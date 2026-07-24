import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { engine } from 'express-handlebars';
import express, { Express, NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { authGate } from './auth/auth.middleware';
import { ensureDbSchema, hasDatabase } from './db/client';
import { getDevRevision } from './shared/dev-reload';
import { loadEnvFile } from './shared/load-env';
import { mobileImageMiddleware } from './shared/mobile-image.middleware';
import { projectAssetRoot } from './shared/trace-static-files';
import { recordVisit } from './shared/visit-tracker';

export function resolveRoot(): string {
  const fromAssets = projectAssetRoot();
  if (existsSync(join(fromAssets, 'views'))) return fromAssets;

  const candidates = [
    process.cwd(),
    join(__dirname, '..'),
    join(__dirname, '..', '..'),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'views'))) ?? candidates[0];
}

function configureViewEngine(app: NestExpressApplication, root: string): void {
  app.engine(
    'hbs',
    engine({
      extname: 'hbs',
      layoutsDir: join(root, 'views', 'layouts'),
      partialsDir: join(root, 'views', 'partials'),
      defaultLayout: 'main',
      helpers: {
        eq: (a: unknown, b: unknown) => a === b,
        ifeq(a: unknown, b: unknown, options: { fn: (ctx: unknown) => string; inverse: (ctx: unknown) => string }) {
          return a === b ? options.fn(this) : options.inverse(this);
        },
        seoGaugeOffset(score: number) {
          const circumference = 2 * Math.PI * 52;
          return circumference - (score / 100) * circumference;
        },
        multiply(a: number, b: number) {
          return a * b;
        },
        initials(name: string) {
          if (!name || typeof name !== 'string') return '?';
          const parts = name.trim().split(/\s+/).filter(Boolean);
          if (parts.length === 0) return '?';
          if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
          return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        },
        json(value: unknown) {
          return JSON.stringify(value ?? null);
        },
      },
    }),
  );

  const devMode = process.env.NODE_ENV !== 'production';
  const publicDir = join(root, 'public');

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Accept-CH', 'Sec-CH-UA-Mobile');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "connect-src 'self' https://cdn.jsdelivr.net",
        "frame-src 'self' https://www.google.com https://maps.google.com",
        "child-src 'self' blob:",
        "object-src 'none'",
      ].join('; '),
    );
    if (!devMode) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    res.locals.devMode = devMode;
    if (devMode) {
      res.locals.devRevision = getDevRevision();
    }

    const path = req.path || '';
    res.locals.currentPath = path;
    const isStaticAsset =
      /\.(css|js|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm)$/i.test(path) ||
      path.startsWith('/css/') ||
      path.startsWith('/js/') ||
      path.startsWith('/images/') ||
      path.startsWith('/uploads/') ||
      path.startsWith('/vendor/');

    if (devMode && !isStaticAsset) {
      // HTML / API indev: always fresh. Static assets keep short revalidate cache below.
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    recordVisit(req);
    next();
  });

  // Phone clients get *.m.webp (max ~750px) for /images and /uploads when available.
  app.use(mobileImageMiddleware(publicDir));

  app.useStaticAssets(publicDir, {
    etag: true,
    lastModified: true,
    maxAge: devMode ? 0 : '7d',
    setHeaders(res, filePath) {
      if (devMode) {
        // Allow browser to reuse CSS/JS across in-site navigations while still revalidating.
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return;
      }
      if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      } else if (/\.(css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    },
  });

  app.setBaseViewsDir(join(root, 'views'));
  app.setViewEngine('hbs');
  app.use(authGate);
}

/** Local / long-running server entry. */
export async function createNestApp(): Promise<NestExpressApplication> {
  loadEnvFile(resolveRoot());
  if (hasDatabase()) {
    await ensureDbSchema().catch((err) => {
      console.error('[db] Schema init failed', err);
    });
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureViewEngine(app, resolveRoot());
  app.enableShutdownHooks();
  return app;
}

/** Vercel serverless: reuse one Express instance across warm invocations. */
let cachedServer: Express | undefined;

export async function getExpressApp(): Promise<Express> {
  if (cachedServer) return cachedServer;

  loadEnvFile(resolveRoot());
  if (hasDatabase()) {
    await ensureDbSchema().catch((err) => {
      console.error('[db] Schema init failed', err);
    });
  }
  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: true },
  );
  configureViewEngine(app, resolveRoot());
  await app.init();
  cachedServer = expressApp;
  return expressApp;
}

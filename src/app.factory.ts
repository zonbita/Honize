import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { engine } from 'express-handlebars';
import express, { Express, NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { authGate } from './auth/auth.middleware';
import { getDevRevision } from './shared/dev-reload';
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
      },
    }),
  );

  app.useStaticAssets(join(root, 'public'));
  app.setBaseViewsDir(join(root, 'views'));
  app.setViewEngine('hbs');

  const devMode = process.env.NODE_ENV !== 'production';
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');

    res.locals.devMode = devMode;
    if (devMode) {
      res.locals.devRevision = getDevRevision();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    recordVisit(req);
    next();
  });

  app.use(authGate);
}

/** Local / long-running server entry. */
export async function createNestApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureViewEngine(app, resolveRoot());
  app.enableShutdownHooks();
  return app;
}

/** Vercel serverless: reuse one Express instance across warm invocations. */
let cachedServer: Express | undefined;

export async function getExpressApp(): Promise<Express> {
  if (cachedServer) return cachedServer;

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

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { engine } from 'express-handlebars';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

function resolveRoot(): string {
  const candidates = [join(__dirname, '..'), join(__dirname, '..', '..')];
  return candidates.find((dir) => existsSync(join(dir, 'views'))) ?? candidates[0];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const root = resolveRoot();

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Honize running at http://localhost:${port}`);
}

bootstrap();

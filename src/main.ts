import { createNestApp, resolveRoot } from './app.factory';
import { startDevWatcher } from './shared/dev-watcher';
import { loadEnvFile } from './shared/load-env';

async function bootstrap() {
  loadEnvFile();
  const app = await createNestApp();
  const root = resolveRoot();
  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    startDevWatcher(root);
  }

  console.log(`Honize Test running at http://localhost:${port}`);
}

bootstrap();

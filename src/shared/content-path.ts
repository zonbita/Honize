import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function resolveProjectRoot(): string {
  const candidates = [
    process.cwd(),
    join(__dirname, '..', '..'),
    join(__dirname, '..', '..', '..'),
    join(__dirname, '..'),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'content'))) ?? process.cwd();
}

export function getArticlesDir(): string {
  return join(resolveProjectRoot(), 'content', 'articles');
}

export function getUploadsDir(): string {
  const dir = join(resolveProjectRoot(), 'public', 'uploads');
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
      // Read-only filesystem (e.g. Vercel) — path still returned for reads
    }
  }
  return dir;
}

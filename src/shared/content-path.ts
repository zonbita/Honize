import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function resolveProjectRoot(): string {
  const candidates = [
    join(__dirname, '..', '..', '..'),
    join(__dirname, '..', '..'),
    join(__dirname, '..'),
    process.cwd(),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'content'))) ?? process.cwd();
}

export function getArticlesDir(): string {
  return join(resolveProjectRoot(), 'content', 'articles');
}

export function getUploadsDir(): string {
  const dir = join(resolveProjectRoot(), 'public', 'uploads');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

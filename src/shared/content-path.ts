import { existsSync } from 'fs';
import { join } from 'path';

export function resolveProjectRoot(): string {
  const candidates = [join(__dirname, '..'), join(__dirname, '..', '..')];
  return candidates.find((dir) => existsSync(join(dir, 'content'))) ?? candidates[0];
}

export function getArticlesDir(): string {
  return join(resolveProjectRoot(), 'content', 'articles');
}

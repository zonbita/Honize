import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getUploadsDir, resolveProjectRoot } from '../shared/content-path';

export function readJsonFile<T>(filename: string, fallback: T): T {
  const path = join(resolveProjectRoot(), 'content', filename);
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

export function writeJsonFile<T>(filename: string, data: T): void {
  const dir = join(resolveProjectRoot(), 'content');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), JSON.stringify(data, null, 2), 'utf-8');
}

export { getUploadsDir } from '../shared/content-path';

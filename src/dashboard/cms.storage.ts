import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getUploadsDir, resolveProjectRoot } from '../shared/content-path';

const memory = new Map<string, unknown>();

export function setJsonMemory(filename: string, data: unknown): void {
  memory.set(filename, data);
}

export function getJsonMemory<T>(filename: string): T | undefined {
  if (!memory.has(filename)) return undefined;
  return memory.get(filename) as T;
}

export function readJsonFile<T>(filename: string, fallback: T): T {
  if (memory.has(filename)) {
    return memory.get(filename) as T;
  }

  const path = join(resolveProjectRoot(), 'content', filename);
  if (!existsSync(path)) return fallback;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8')) as T;
    memory.set(filename, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

/** Sync disk write only — throws on read-only FS. */
export function writeJsonFileToDisk<T>(filename: string, data: T): void {
  const dir = join(resolveProjectRoot(), 'content');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(join(dir, filename), JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Legacy sync write: updates memory + disk.
 * Prefer writeJsonDurable() for Vercel / serverless.
 */
export function writeJsonFile<T>(filename: string, data: T): void {
  memory.set(filename, data);
  writeJsonFileToDisk(filename, data);
}

export { getUploadsDir } from '../shared/content-path';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/** Load KEY=VALUE pairs from project .env into process.env.
 *  Does not override non-empty existing env; empty placeholders are filled from .env.
 */
export function loadEnvFile(root = process.cwd()): void {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;

  const text = readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!key) continue;
    const existing = process.env[key];
    if (existing !== undefined && existing.trim() !== '') continue;
    process.env[key] = value;
  }
}

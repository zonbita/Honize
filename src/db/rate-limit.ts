import { ensureDbSchema, getSql, hasDatabase } from './client';

type MemoryEntry = { count: number; resetAt: number };
const memory = new Map<string, MemoryEntry>();

function consumeMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

async function consumePostgres(key: string, limit: number, windowMs: number): Promise<boolean> {
  await ensureDbSchema();
  const db = getSql();
  if (!db) return consumeMemory(key, limit, windowMs);

  const now = new Date();
  const rows = await db<{ hit_count: number; reset_at: Date }[]>`
    SELECT hit_count, reset_at FROM rate_limits WHERE bucket_key = ${key} LIMIT 1
  `;

  if (!rows.length || rows[0].reset_at.getTime() <= now.getTime()) {
    const resetAt = new Date(now.getTime() + windowMs);
    await db`
      INSERT INTO rate_limits (bucket_key, hit_count, reset_at)
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT (bucket_key) DO UPDATE
      SET hit_count = 1, reset_at = EXCLUDED.reset_at
    `;
    return true;
  }

  const next = rows[0].hit_count + 1;
  await db`
    UPDATE rate_limits SET hit_count = ${next} WHERE bucket_key = ${key}
  `;
  return next <= limit;
}

/** Returns true if the request is allowed. */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (hasDatabase()) {
    try {
      return await consumePostgres(key, limit, windowMs);
    } catch {
      return consumeMemory(key, limit, windowMs);
    }
  }
  return consumeMemory(key, limit, windowMs);
}

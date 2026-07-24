import postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

let sql: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return sql;
}

export async function ensureDbSchema(): Promise<void> {
  const db = getSql();
  if (!db) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await db`
        CREATE TABLE IF NOT EXISTS auth_users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          avatar TEXT NOT NULL DEFAULT 'AD',
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`
        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          read BOOLEAN NOT NULL DEFAULT FALSE
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC)`;
      await db`
        CREATE TABLE IF NOT EXISTS visits (
          id TEXT PRIMARY KEY,
          ip TEXT NOT NULL,
          country TEXT NOT NULL,
          country_code TEXT NOT NULL DEFAULT '',
          path TEXT NOT NULL,
          visited_at TIMESTAMPTZ NOT NULL
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS visits_visited_at_idx ON visits (visited_at DESC)`;
      await db`CREATE INDEX IF NOT EXISTS visits_ip_idx ON visits (ip)`;
      await db`
        CREATE TABLE IF NOT EXISTS rate_limits (
          bucket_key TEXT PRIMARY KEY,
          hit_count INT NOT NULL DEFAULT 0,
          reset_at TIMESTAMPTZ NOT NULL
        )
      `;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

-- Honize durable store (Neon / any Postgres)
-- Applied automatically when DATABASE_URL is set.

CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'AD',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS visits_visited_at_idx ON visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS visits_ip_idx ON visits (ip);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT PRIMARY KEY,
  hit_count INT NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_documents (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

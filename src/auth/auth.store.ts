import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ensureDbSchema, getSql, hasDatabase } from '../db/client';
import { resolveProjectRoot } from '../shared/content-path';
import { readJsonFile, writeJsonFile } from '../dashboard/cms.storage';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthStoredUser extends AuthUser {
  passwordHash: string;
}

interface AuthFile {
  users: AuthStoredUser[];
}

const AUTH_FILE = 'auth.json';
const COOKIE_NAME = 'honize_session';
const SESSION_DAYS = 7;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return null;
  // Never allow the old hardcoded demo password in production.
  if (isProduction() && password === 'Admin@123') return null;
  return { email, password };
}

function getSessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv) {
    if (isProduction() && fromEnv.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters in production');
    }
    return fromEnv;
  }

  if (isProduction()) {
    throw new Error('SESSION_SECRET is required in production (set it in Vercel env)');
  }

  const secretPath = join(resolveProjectRoot(), 'content', '.session-secret');
  try {
    if (existsSync(secretPath)) {
      return readFileSync(secretPath, 'utf-8').trim();
    }
    const secret = randomBytes(32).toString('hex');
    const dir = join(resolveProjectRoot(), 'content');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(secretPath, secret, 'utf-8');
    return secret;
  } catch {
    throw new Error(
      'Cannot create content/.session-secret — set SESSION_SECRET in .env for local auth',
    );
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, 'hex');
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

async function ensureAuthUsersDb(): Promise<AuthStoredUser[]> {
  await ensureDbSchema();
  const db = getSql();
  if (!db) return [];

  const rows = await db<{
    id: number;
    email: string;
    name: string;
    role: string;
    avatar: string;
    password_hash: string;
  }[]>`SELECT id, email, name, role, avatar, password_hash FROM auth_users ORDER BY id ASC`;

  if (rows.length) {
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      avatar: r.avatar,
      passwordHash: r.password_hash,
    }));
  }

  const creds = getAdminCredentials();
  if (!creds) {
    console.error(
      '[auth] No auth_users and ADMIN_EMAIL/ADMIN_PASSWORD not set — login will fail until configured',
    );
    return [];
  }

  const passwordHash = hashPassword(creds.password);
  const inserted = await db<{
    id: number;
    email: string;
    name: string;
    role: string;
    avatar: string;
    password_hash: string;
  }[]>`
    INSERT INTO auth_users (email, name, role, avatar, password_hash)
    VALUES (${creds.email}, 'Admin', 'Quản trị viên', 'AD', ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id, email, name, role, avatar, password_hash
  `;

  return inserted.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    avatar: r.avatar,
    passwordHash: r.password_hash,
  }));
}

function ensureAuthFile(): AuthFile {
  const existing = readJsonFile<AuthFile | null>(AUTH_FILE, null);
  if (existing?.users?.length) return existing;

  const creds = getAdminCredentials();
  if (!creds) {
    console.error(
      '[auth] content/auth.json missing and ADMIN_EMAIL/ADMIN_PASSWORD not set — set them in .env',
    );
    return { users: [] };
  }

  const seed: AuthFile = {
    users: [
      {
        id: 1,
        email: creds.email,
        name: 'Admin',
        role: 'Quản trị viên',
        avatar: 'AD',
        passwordHash: hashPassword(creds.password),
      },
    ],
  };
  try {
    writeJsonFile(AUTH_FILE, seed);
  } catch {
    /* read-only FS */
  }
  return seed;
}

export async function findAuthUserByEmail(email: string): Promise<AuthStoredUser | undefined> {
  const needle = email.toLowerCase();
  if (hasDatabase()) {
    try {
      const users = await ensureAuthUsersDb();
      return users.find((u) => u.email.toLowerCase() === needle);
    } catch (err) {
      console.error('[auth] Postgres lookup failed, falling back to file', err);
    }
  }
  return ensureAuthFile().users.find((u) => u.email.toLowerCase() === needle);
}

export function toPublicUser(user: AuthStoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
}

function sign(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

export function readSessionUser(req: Request): AuthUser | null {
  const raw = parseCookies(req)[COOKIE_NAME];
  if (!raw) return null;

  let expected: string;
  try {
    const [payloadB64, signature] = raw.split('.');
    if (!payloadB64 || !signature) return null;
    expected = sign(payloadB64);
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as {
      user: AuthUser;
      exp: number;
    };
    if (!payload?.user?.email || !payload.exp || Date.now() > payload.exp) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, user: AuthUser): void {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payloadB64 = Buffer.from(JSON.stringify({ user, exp }), 'utf-8').toString('base64url');
  const token = `${payloadB64}.${sign(payloadB64)}`;
  const secure = isProduction() ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`,
  );
}

export function clearSessionCookie(res: Response): void {
  const secure = isProduction() ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

/** Prefill email only — never expose passwords in the UI. */
export function getLoginEmailPrefill(): string {
  return process.env.ADMIN_EMAIL?.trim() || '';
}

export function passwordLoginEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

/** Session user for Google OAuth (no password hash needed). */
export function buildOAuthAdminUser(input: {
  email: string;
  name: string;
}): AuthUser {
  const name = input.name.trim() || 'Admin';
  const parts = name.split(/\s+/).filter(Boolean);
  const avatar =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return {
    id: 1,
    email: input.email.trim().toLowerCase(),
    name,
    role: 'Quản trị viên',
    avatar,
  };
}

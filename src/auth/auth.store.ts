import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
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
const DEFAULT_EMAIL = 'admin@honize.vn';
const DEFAULT_PASSWORD = 'Admin@123';

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET?.trim()) return process.env.SESSION_SECRET.trim();

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
    return 'honize-dev-session-secret-change-me';
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

function ensureAuthFile(): AuthFile {
  const existing = readJsonFile<AuthFile | null>(AUTH_FILE, null);
  if (existing?.users?.length) return existing;

  const email = process.env.ADMIN_EMAIL?.trim() || DEFAULT_EMAIL;
  const password = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
  const seed: AuthFile = {
    users: [
      {
        id: 1,
        email,
        name: 'Admin',
        role: 'Quản trị viên',
        avatar: 'AD',
        passwordHash: hashPassword(password),
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

export function findAuthUserByEmail(email: string): AuthStoredUser | undefined {
  const data = ensureAuthFile();
  return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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

  const [payloadB64, signature] = raw.split('.');
  if (!payloadB64 || !signature) return null;
  const expected = sign(payloadB64);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
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
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`,
  );
}

export function clearSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export function getDefaultAdminHint(): { email: string; password: string } {
  return {
    email: process.env.ADMIN_EMAIL?.trim() || DEFAULT_EMAIL,
    password: process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD,
  };
}

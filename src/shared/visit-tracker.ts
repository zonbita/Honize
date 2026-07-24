import { Request } from 'express';
import { ensureDbSchema, getSql, hasDatabase } from '../db/client';
import { readJsonFile, writeJsonFile } from '../dashboard/cms.storage';

export interface VisitRecord {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  path: string;
  visitedAt: string;
}

const MAX_VISITS = 500;
const VISITS_FILE = 'visits.json';
const RECORD_COOLDOWN_MS = 5 * 60 * 1000;

const countryCache = new Map<string, { country: string; countryCode: string }>();
const lastRecordedAt = new Map<string, number>();

const SKIP_PREFIXES = [
  '/dashboard',
  '/api/',
  '/css/',
  '/js/',
  '/images/',
  '/uploads/',
  '/images/upload/',
  '/images/Demo/',
  '/dev/',
  '/favicon',
  '/robots.txt',
  '/sitemap.xml',
];

const STATIC_EXT = /\.(css|js|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm)$/i;

export function shouldTrackRequest(req: Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const path = req.path || '/';
  if (STATIC_EXT.test(path)) return false;
  return !SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip.replace(/^::ffff:/, '') || 'unknown';
}

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('fc') || ip.startsWith('fd')) {
    return true;
  }
  const match = /^172\.(\d+)\./.exec(ip);
  if (match) {
    const n = Number(match[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

async function resolveCountry(ip: string): Promise<{ country: string; countryCode: string }> {
  if (isPrivateIp(ip)) {
    return { country: 'Mạng nội bộ', countryCode: 'LOCAL' };
  }

  const cached = countryCache.get(ip);
  if (cached) return cached;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) throw new Error(`geo ${res.status}`);
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
    };
    if (data.status === 'success' && data.country) {
      const result = {
        country: data.country,
        countryCode: data.countryCode || '',
      };
      countryCache.set(ip, result);
      return result;
    }
  } catch {
    /* keep fallback */
  }

  return { country: 'Không xác định', countryCode: '' };
}

async function listVisitsDb(): Promise<VisitRecord[]> {
  await ensureDbSchema();
  const db = getSql();
  if (!db) return [];
  const rows = await db<{
    id: string;
    ip: string;
    country: string;
    country_code: string;
    path: string;
    visited_at: Date;
  }[]>`
    SELECT id, ip, country, country_code, path, visited_at
    FROM visits
    ORDER BY visited_at DESC
    LIMIT ${MAX_VISITS}
  `;
  return rows.map((r) => ({
    id: r.id,
    ip: r.ip,
    country: r.country,
    countryCode: r.country_code,
    path: r.path,
    visitedAt: r.visited_at.toISOString(),
  }));
}

function listVisitsFile(): VisitRecord[] {
  return readJsonFile<VisitRecord[]>(VISITS_FILE, []);
}

export async function getVisits(): Promise<VisitRecord[]> {
  if (hasDatabase()) {
    try {
      return await listVisitsDb();
    } catch (err) {
      console.error('[visits] Postgres read failed', err);
    }
  }
  return listVisitsFile();
}

export async function clearVisits(): Promise<void> {
  lastRecordedAt.clear();
  if (hasDatabase()) {
    try {
      await ensureDbSchema();
      const db = getSql()!;
      await db`DELETE FROM visits`;
      return;
    } catch (err) {
      console.error('[visits] Postgres clear failed', err);
    }
  }
  writeJsonFile(VISITS_FILE, []);
}

function getLastVisitTime(ip: string, visits: VisitRecord[]): number {
  const cached = lastRecordedAt.get(ip);
  if (cached !== undefined) return cached;

  const latest = visits.find((v) => v.ip === ip);
  if (!latest) return 0;

  const ts = Date.parse(latest.visitedAt);
  if (!Number.isNaN(ts)) lastRecordedAt.set(ip, ts);
  return Number.isNaN(ts) ? 0 : ts;
}

export function recordVisit(req: Request): void {
  if (!shouldTrackRequest(req)) return;

  const ip = getClientIp(req);
  const path = req.path || '/';
  const now = Date.now();

  void (async () => {
    try {
      const visits = await getVisits();
      const lastAt = getLastVisitTime(ip, visits);
      if (lastAt > 0 && now - lastAt < RECORD_COOLDOWN_MS) return;

      lastRecordedAt.set(ip, now);

      const geo = await resolveCountry(ip);
      const record: VisitRecord = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        ip,
        country: geo.country,
        countryCode: geo.countryCode,
        path,
        visitedAt: new Date(now).toISOString(),
      };

      if (hasDatabase()) {
        try {
          await ensureDbSchema();
          const db = getSql()!;
          const recent = await db<{ visited_at: Date }[]>`
            SELECT visited_at FROM visits WHERE ip = ${ip}
            ORDER BY visited_at DESC LIMIT 1
          `;
          if (recent.length) {
            const stillTs = recent[0].visited_at.getTime();
            if (now - stillTs < RECORD_COOLDOWN_MS) return;
          }
          await db`
            INSERT INTO visits (id, ip, country, country_code, path, visited_at)
            VALUES (
              ${record.id}, ${record.ip}, ${record.country}, ${record.countryCode},
              ${record.path}, ${new Date(record.visitedAt)}
            )
          `;
          await db`
            DELETE FROM visits WHERE id IN (
              SELECT id FROM visits ORDER BY visited_at DESC OFFSET ${MAX_VISITS}
            )
          `;
          return;
        } catch (err) {
          console.error('[visits] Postgres write failed, falling back to file', err);
        }
      }

      const next = listVisitsFile();
      const stillRecent = next.find((v) => v.ip === ip);
      if (stillRecent) {
        const stillTs = Date.parse(stillRecent.visitedAt);
        if (!Number.isNaN(stillTs) && now - stillTs < RECORD_COOLDOWN_MS) return;
      }
      next.unshift(record);
      writeJsonFile(VISITS_FILE, next.slice(0, MAX_VISITS));
    } catch {
      /* ignore write/geo failures so requests stay fast */
    }
  })();
}

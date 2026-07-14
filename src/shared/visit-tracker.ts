import { Request } from 'express';
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

export function getVisits(): VisitRecord[] {
  return readJsonFile<VisitRecord[]>(VISITS_FILE, []);
}

export function clearVisits(): void {
  lastRecordedAt.clear();
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
      const visits = getVisits();
      const lastAt = getLastVisitTime(ip, visits);
      if (lastAt > 0 && now - lastAt < RECORD_COOLDOWN_MS) return;

      lastRecordedAt.set(ip, now);

      const geo = await resolveCountry(ip);
      const next = getVisits();
      const stillRecent = next.find((v) => v.ip === ip);
      if (stillRecent) {
        const stillTs = Date.parse(stillRecent.visitedAt);
        if (!Number.isNaN(stillTs) && now - stillTs < RECORD_COOLDOWN_MS) return;
      }

      next.unshift({
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        ip,
        country: geo.country,
        countryCode: geo.countryCode,
        path,
        visitedAt: new Date(now).toISOString(),
      });
      writeJsonFile(VISITS_FILE, next.slice(0, MAX_VISITS));
    } catch {
      /* ignore write/geo failures so requests stay fast */
    }
  })();
}

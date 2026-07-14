import { NextFunction, Request, Response } from 'express';
import { authContext } from './auth-context';
import { readSessionUser } from './auth.store';

const PUBLIC_EXACT = new Set([
  '/dashboard/login',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/dev/reload-check',
]);

function isStaticAsset(path: string): boolean {
  return /\.(css|js|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm)$/i.test(path);
}

function requiresAuth(req: Request): boolean {
  const path = req.path || '/';
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') return false;
  if (isStaticAsset(path)) return false;
  if (PUBLIC_EXACT.has(path)) return false;

  if (path.startsWith('/dashboard')) return true;

  if (path.startsWith('/api/')) {
    if (method === 'GET') return false;
    if (path === '/api/chat' && method === 'POST') return false;
    return true;
  }

  return false;
}

/** Express middleware — protect dashboard + write APIs. */
export function authGate(req: Request, res: Response, next: NextFunction): void {
  const user = readSessionUser(req);

  authContext.run(user, () => {
    if (!requiresAuth(req)) {
      next();
      return;
    }

    if (!user) {
      if (req.path.startsWith('/api/')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const nextUrl = req.originalUrl || '/dashboard';
      res.redirect(`/dashboard/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    next();
  });
}

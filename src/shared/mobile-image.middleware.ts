import { NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { extname, join, normalize } from 'path';

const SOURCE_EXT = /\.(png|jpe?g|gif|webp)$/i;

export function isMobileClient(req: Request): boolean {
  const ch = req.get('sec-ch-ua-mobile');
  if (ch === '?1') return true;
  if (ch === '?0') return false;
  if (req.query.mobile === '1' || req.query.mobile === 'true') return true;
  const ua = req.get('user-agent') || '';
  return /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function mobileSibling(absPath: string): string {
  const ext = extname(absPath);
  return absPath.slice(0, -ext.length) + '.m.webp';
}

/**
 * Serve phone-resolution *.m.webp for /images and /uploads when the client is mobile.
 * Falls back to the original file via express.static.
 */
export function mobileImageMiddleware(publicDir: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const path = req.path || '';
    if (!path.startsWith('/images/') && !path.startsWith('/uploads/')) return next();
    if (!SOURCE_EXT.test(path) || path.endsWith('.m.webp')) return next();
    if (!isMobileClient(req)) return next();

    const relative = normalize(path.replace(/^\/+/, '')).replace(/^(\.\.(\/|\\|$))+/, '');
    const original = join(publicDir, relative);
    const mobile = mobileSibling(original);

    if (!existsSync(mobile)) return next();

    res.setHeader('Accept-CH', 'Sec-CH-UA-Mobile');
    res.setHeader('Vary', 'Sec-CH-UA-Mobile, User-Agent');
    res.type('image/webp');
    return res.sendFile(mobile);
  };
}

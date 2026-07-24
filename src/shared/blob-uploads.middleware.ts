import { NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join, normalize } from 'path';
import { hasBlobStorage, resolveBlobUploadUrl } from './upload-storage';

/**
 * When a /uploads/* file is missing locally (Vercel serverless), redirect to Vercel Blob.
 */
export function blobUploadsFallbackMiddleware(publicDir: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (!hasBlobStorage()) return next();

    const path = req.path || '';
    if (!path.startsWith('/uploads/')) return next();

    const relative = normalize(path.replace(/^\/+/, '')).replace(/^(\.\.(\/|\\|$))+/, '');
    if (!relative.startsWith('uploads/') || relative.includes('..')) return next();

    const localPath = join(publicDir, relative);
    if (existsSync(localPath)) return next();

    const name = relative.slice('uploads/'.length);
    try {
      const blobUrl = await resolveBlobUploadUrl(decodeURIComponent(name));
      if (!blobUrl) return next();
      return res.redirect(302, blobUrl);
    } catch (err) {
      console.error('[uploads] Blob fallback failed', err);
      return next();
    }
  };
}

import { del, head, list, put } from '@vercel/blob';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getUploadsDir } from './content-path';

export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function blobToken(): string {
  return process.env.BLOB_READ_WRITE_TOKEN!.trim();
}

function localUploadUrl(filename: string): { url: string; name: string } {
  return { url: `/uploads/${filename}`, name: filename };
}

function tryWriteLocal(filename: string, buffer: Buffer): boolean {
  const dir = getUploadsDir();
  try {
    writeFileSync(join(dir, filename), buffer);
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function writeBlob(
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  if (!hasBlobStorage()) {
    throw new Error(
      'Không ghi được public/uploads (filesystem read-only). Cần BLOB_READ_WRITE_TOKEN trên Vercel.',
    );
  }
  await put(`uploads/${filename}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    token: blobToken(),
  });
}

/**
 * Prefer writing to public/uploads (local / persistent disk).
 * On Vercel (read-only), fall back to Vercel Blob but still return /uploads/... URLs.
 */
export async function saveUploadFile(
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ url: string; name: string }> {
  if (tryWriteLocal(filename, buffer)) {
    return localUploadUrl(filename);
  }

  await writeBlob(filename, buffer, contentType);
  return localUploadUrl(filename);
}

export async function resolveBlobUploadUrl(
  filename: string,
): Promise<string | null> {
  if (!hasBlobStorage()) return null;
  const safeName = filename.replace(/^.*\//, '');
  if (!safeName || safeName.includes('..')) return null;

  try {
    const meta = await head(`uploads/${safeName}`, { token: blobToken() });
    return meta.url;
  } catch {
    return null;
  }
}

export async function listBlobUploads(): Promise<
  { name: string; url: string; size: number; mtime: number }[]
> {
  if (!hasBlobStorage()) return [];

  const out: { name: string; url: string; size: number; mtime: number }[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: 'uploads/',
      cursor,
      token: blobToken(),
    });
    for (const blob of page.blobs) {
      const name = blob.pathname.replace(/^uploads\//, '');
      if (!name || name.includes('/')) continue;
      out.push({
        name,
        url: `/uploads/${encodeURIComponent(name)}`,
        size: blob.size,
        mtime: blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : 0,
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return out;
}

export async function deleteUploadFile(filename: string): Promise<boolean> {
  const safeName = filename.replace(/^.*\//, '');
  if (!safeName || safeName.includes('..')) return false;

  let deleted = false;

  const localPath = join(getUploadsDir(), safeName);
  if (existsSync(localPath)) {
    try {
      unlinkSync(localPath);
      deleted = true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'EROFS' && code !== 'EACCES') throw err;
    }
  }

  if (hasBlobStorage()) {
    try {
      await del(`uploads/${safeName}`, { token: blobToken() });
      deleted = true;
    } catch {
      // May not exist in blob store
    }
  }

  return deleted;
}

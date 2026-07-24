import { ensureDbSchema, getSql, hasDatabase } from '../db/client';
import { readJsonFile, writeJsonFileToDisk, setJsonMemory } from '../dashboard/cms.storage';

/**
 * Durable CMS JSON for serverless (Vercel): Postgres cms_documents + in-memory cache.
 * Disk is still preferred when writable (local).
 */

export async function hydrateCmsDocument(
  filename: string,
): Promise<boolean> {
  if (!hasDatabase()) return false;
  await ensureDbSchema();
  const db = getSql();
  if (!db) return false;

  try {
    const rows = await db<{ data: unknown }[]>`
      SELECT data FROM cms_documents WHERE id = ${filename} LIMIT 1
    `;
    if (!rows[0]) return false;
    setJsonMemory(filename, rows[0].data);
    return true;
  } catch (err) {
    console.error(`[cms] hydrate ${filename} failed`, err);
    return false;
  }
}

export async function hydrateCmsDocuments(filenames: string[]): Promise<void> {
  await Promise.all(filenames.map((name) => hydrateCmsDocument(name)));
}

export async function writeJsonDurable<T>(filename: string, data: T): Promise<void> {
  setJsonMemory(filename, data);

  let wroteDisk = false;
  try {
    writeJsonFileToDisk(filename, data);
    wroteDisk = true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== 'EROFS' && code !== 'EACCES' && code !== 'ENOENT') {
      throw err;
    }
  }

  if (hasDatabase()) {
    await ensureDbSchema();
    const db = getSql();
    if (!db) {
      if (!wroteDisk) throw new Error(`Cannot write ${filename}: no database`);
      return;
    }
    try {
      await db`
        INSERT INTO cms_documents (id, data, updated_at)
        VALUES (${filename}, ${db.json(data as never)}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW()
      `;
      return;
    } catch (err) {
      if (wroteDisk) {
        console.error(`[cms] DB write ${filename} failed; disk copy kept`, err);
        return;
      }
      throw err;
    }
  }

  if (!wroteDisk) {
    throw new Error(
      `Cannot write ${filename}: filesystem read-only and DATABASE_URL is not set`,
    );
  }
}

/** Read with memory → DB hydrate → disk fallback. */
export async function readJsonDurable<T>(filename: string, fallback: T): Promise<T> {
  await hydrateCmsDocument(filename);
  return readJsonFile(filename, fallback);
}

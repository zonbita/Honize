import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getJsonMemory, setJsonMemory } from '../dashboard/cms.storage';
import { getArticlesDir } from './content-path';
import { hydrateCmsDocument, writeJsonDurable } from './cms-documents';
import { bumpDevRevision } from './dev-reload';
import type { Article } from '../articles/articles.types';

const STORE_ID = 'articles-store.json';

export interface ArticlesStoreData {
  articles: Article[];
  contents: Record<string, string>;
}

let ready = false;

function emptyStore(): ArticlesStoreData {
  return { articles: [], contents: {} };
}

function loadFromDiskFiles(): ArticlesStoreData {
  const dir = getArticlesDir();
  if (!existsSync(dir)) return emptyStore();

  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const articles: Article[] = [];
  const contents: Record<string, string> = {};

  for (const file of files) {
    try {
      const article = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as Article;
      if (!article?.slug) continue;
      articles.push(article);
      const mdPath = join(dir, `${article.slug}.md`);
      contents[article.slug] = existsSync(mdPath) ? readFileSync(mdPath, 'utf-8') : '';
    } catch {
      // skip corrupt seed files
    }
  }

  articles.sort((a, b) => b.id - a.id);
  return { articles, contents };
}

function cloneStore(data: ArticlesStoreData): ArticlesStoreData {
  return {
    articles: data.articles.map((a) => ({ ...a, seo: { ...a.seo } })),
    contents: { ...data.contents },
  };
}

/** Sync individual article files when disk is writable (local/git). */
function syncDiskFiles(data: ArticlesStoreData): void {
  const dir = getArticlesDir();
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    for (const article of data.articles) {
      writeFileSync(
        join(dir, `${article.slug}.json`),
        JSON.stringify(article, null, 2),
        'utf-8',
      );
      writeFileSync(join(dir, `${article.slug}.md`), data.contents[article.slug] ?? '', 'utf-8');
    }
  } catch {
    // Read-only FS — durable store already handled via Postgres
  }
}

function removeDiskFiles(slug: string): void {
  const dir = getArticlesDir();
  for (const name of [`${slug}.json`, `${slug}.md`]) {
    const path = join(dir, name);
    try {
      if (existsSync(path)) unlinkSync(path);
    } catch {
      // ignore EROFS
    }
  }
}

export async function ensureArticlesStore(): Promise<ArticlesStoreData> {
  if (ready && getJsonMemory<ArticlesStoreData>(STORE_ID)) {
    return getJsonMemory<ArticlesStoreData>(STORE_ID)!;
  }

  const fromDb = await hydrateCmsDocument(STORE_ID);
  if (fromDb) {
    ready = true;
    return getJsonMemory<ArticlesStoreData>(STORE_ID)!;
  }

  const existing = getJsonMemory<ArticlesStoreData>(STORE_ID);
  if (existing) {
    ready = true;
    return existing;
  }

  const seeded = loadFromDiskFiles();
  setJsonMemory(STORE_ID, seeded);
  ready = true;
  return seeded;
}

export function getArticlesStoreSync(): ArticlesStoreData {
  const cached = getJsonMemory<ArticlesStoreData>(STORE_ID);
  if (cached) return cached;
  const seeded = loadFromDiskFiles();
  setJsonMemory(STORE_ID, seeded);
  ready = true;
  return seeded;
}

export async function persistArticlesStore(data: ArticlesStoreData): Promise<void> {
  const next = cloneStore(data);
  setJsonMemory(STORE_ID, next);
  ready = true;
  await writeJsonDurable(STORE_ID, next);
  syncDiskFiles(next);
  bumpDevRevision();
}

export async function deleteArticleFiles(slug: string): Promise<void> {
  removeDiskFiles(slug);
}

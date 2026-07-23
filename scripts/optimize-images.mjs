/**
 * Generate phone-resolution WebP siblings (*.m.webp) for home + Demo images.
 * Usage: node scripts/optimize-images.mjs [--force] [--max=750] [--quality=75]
 */
import { createHash } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { mkdir, readdir, stat, writeFile } from 'fs/promises';
import { dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_ROOTS = [
  join(root, 'public', 'images'),
  join(root, 'public', 'uploads'),
];

const FORCE = process.argv.includes('--force');
const maxArg = process.argv.find((a) => a.startsWith('--max='));
const qualityArg = process.argv.find((a) => a.startsWith('--quality='));
const MAX_WIDTH = Number(maxArg?.split('=')[1] || 750);
const QUALITY = Number(qualityArg?.split('=')[1] || 75);
const CONCURRENCY = 4;
const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const SKIP_DIR = new Set(['node_modules', '.git']);

function mobilePath(filePath) {
  const ext = extname(filePath);
  return filePath.slice(0, -ext.length) + '.m.webp';
}

async function* walk(dir) {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIR.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (!SOURCE_EXT.has(ext)) continue;
    if (entry.name.endsWith('.m.webp')) continue;
    yield full;
  }
}

async function fileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha1');
    createReadStream(filePath)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex').slice(0, 12)));
  });
}

async function needsBuild(src, dest) {
  if (FORCE || !existsSync(dest)) return true;
  const [s, d] = await Promise.all([stat(src), stat(dest)]);
  return s.mtimeMs > d.mtimeMs;
}

async function optimizeOne(src) {
  const dest = mobilePath(src);
  if (!(await needsBuild(src, dest))) {
    return { src, dest, skipped: true };
  }

  await mkdir(dirname(dest), { recursive: true });
  const input = sharp(src, { animated: false, failOn: 'none' });
  const meta = await input.metadata();
  const width = meta.width || MAX_WIDTH;
  const pipeline = input.rotate().resize({
    width: Math.min(width, MAX_WIDTH),
    withoutEnlargement: true,
    fit: 'inside',
  });

  const buffer = await pipeline.webp({ quality: QUALITY, effort: 4 }).toBuffer();
  await writeFile(dest, buffer);

  const before = (await stat(src)).size;
  const after = buffer.length;
  return {
    src,
    dest,
    skipped: false,
    before,
    after,
    hash: await fileHash(dest),
  };
}

async function runPool(items, limit, worker) {
  const results = [];
  let index = 0;
  async function next() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return results;
}

const sources = [];
for (const base of IMAGE_ROOTS) {
  for await (const file of walk(base)) {
    // Home page assets: public/images/* (not nested Demo) + Demo tree + uploads
    const rel = relative(join(root, 'public'), file).replace(/\\/g, '/');
    const isHomeRoot =
      rel.startsWith('images/') && !rel.slice('images/'.length).includes('/');
    const isDemo = rel.startsWith('images/Demo/');
    const isUpload = rel.startsWith('uploads/');
    if (isHomeRoot || isDemo || isUpload) sources.push(file);
  }
}

console.log(
  `Optimizing ${sources.length} images → max ${MAX_WIDTH}px WebP q${QUALITY}`,
);

const results = await runPool(sources, CONCURRENCY, async (src) => {
  try {
    return await optimizeOne(src);
  } catch (err) {
    return { src, error: err?.message || String(err) };
  }
});

let built = 0;
let skipped = 0;
let failed = 0;
let saved = 0;

for (const r of results) {
  if (r.error) {
    failed += 1;
    console.warn(`FAIL ${relative(root, r.src)}: ${r.error}`);
    continue;
  }
  if (r.skipped) {
    skipped += 1;
    continue;
  }
  built += 1;
  saved += Math.max(0, r.before - r.after);
  const rel = relative(root, r.src);
  const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
  console.log(
    `OK ${rel} → ${(r.after / 1024).toFixed(0)}KB (−${pct}%)`,
  );
}

console.log(
  `\nDone: built=${built} skipped=${skipped} failed=${failed} saved≈${(saved / 1024 / 1024).toFixed(1)}MB`,
);
console.log('Mobile clients are served *.m.webp via mobile-image middleware.');

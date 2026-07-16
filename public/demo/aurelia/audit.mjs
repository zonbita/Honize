#!/usr/bin/env node
/**
 * Audit Aurelia demo — dành cho Cursor Agent.
 * Chạy: node public/demo/aurelia/audit.mjs
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

const manifest = JSON.parse(readFileSync(join(__dirname, 'manifest.json'), 'utf8'));
const templatePath = join(root, manifest.files.template);
const template = readFileSync(templatePath, 'utf8');

function hasDemoId(id) {
  return template.includes(`data-demo-id="${id}"`);
}

function hasDemoLive(id) {
  const re = new RegExp(`<[^>]*data-demo-id="${id}"[^>]*>`, 'i');
  const match = template.match(re);
  if (!match) return false;
  if (/data-demo-live/.test(match[0])) return true;
  if (id.startsWith('nav-') && /<nav[^>]*data-demo-live/.test(template)) return true;
  return false;
}

const rows = manifest.features.map((f) => {
  const inTemplate =
    f.type === 'anchor' || f.selector.startsWith('.')
      ? template.includes(f.selector.replace(/\[data-demo-id="[^"]+"\]/, '')) ||
        (f.id && hasDemoId(f.id))
      : f.id
        ? hasDemoId(f.id)
        : false;

  const liveInTemplate = f.id ? hasDemoLive(f.id) : f.status === 'live';
  const manifestStatus = f.status;
  const actualStatus = liveInTemplate ? 'live' : manifestStatus;
  const mismatch = manifestStatus === 'live' && !liveInTemplate;
  const missing = f.id && !hasDemoId(f.id) && f.type !== 'anchor';

  return {
    id: f.id,
    label: f.label,
    type: f.type,
    manifest: manifestStatus,
    template: missing ? 'missing-id' : liveInTemplate ? 'live' : 'pending',
    mismatch: mismatch ? 'YES' : '',
    next: f.status === 'pending' ? f.expected : '—',
  };
});

const pending = rows.filter((r) => r.manifest === 'pending');
const live = rows.filter((r) => r.manifest === 'live');
const mismatches = rows.filter((r) => r.mismatch === 'YES');
const missingIds = rows.filter((r) => r.template === 'missing-id');

console.log('\n=== Aurelia Estates Demo Audit (Cursor) ===\n');
console.log(`Template: ${manifest.files.template}`);
console.log(`Pending: ${pending.length} | Live: ${live.length}\n`);

if (pending.length) {
  console.log('--- Cycle tiếp theo (pending) ---');
  const cycleOrder = manifest.cycle || [];
  const ordered = cycleOrder
    .map((id) => pending.find((p) => p.id === id))
    .filter(Boolean);
  const rest = pending.filter((p) => !cycleOrder.includes(p.id));
  [...ordered, ...rest].forEach((r, i) => {
    console.log(`${i + 1}. [${r.id}] ${r.label}`);
    console.log(`   → ${r.next}`);
  });
  console.log('');
}

console.table(rows);

if (missingIds.length) {
  console.warn('\n⚠ Thiếu data-demo-id trong template:');
  missingIds.forEach((r) => console.warn(`  - ${r.id}: ${r.label}`));
}

if (mismatches.length) {
  console.warn('\n⚠ Manifest ghi live nhưng template chưa có data-demo-live:');
  mismatches.forEach((r) => console.warn(`  - ${r.id}`));
}

if (!pending.length && !mismatches.length && !missingIds.length) {
  console.log('\n✓ Tất cả tính năng trong manifest đã live.\n');
  process.exit(0);
}

process.exit(missingIds.length || mismatches.length ? 1 : 0);

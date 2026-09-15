/**
 * Prune legacy / gap formats 31–33 and rebuild invoice UI layouts without EXTRA duplicates.
 * Usage: node scripts/prune-invoice-extras.mjs && node scripts/build-invoice-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DROP = new Set([31, 32, 33]);

function pruneJson(rel, pick) {
  const p = path.join(root, rel);
  const rows = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = rows.filter(pick);
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return { before: rows.length, after: next.length };
}

const prev = pruneJson(
  'src/features/reports/data/invoiceFormatPreviews.json',
  (r) => !DROP.has(Number(r.formatNumber)),
);

const reg = pruneJson('src/features/reports/data/fresaReportRegistry.json', (r) => {
  const m = String(r.code || '').match(/^INVOICE_REPORT_FORMAT_(\d+)(?:_|$)/i);
  if (!m) return true; // keep non-invoice registry rows
  return !DROP.has(Number(m[1]));
});

console.log('previews', prev.before, '→', prev.after);
console.log('registry', reg.before, '→', reg.after);

// Refresh generated TS + names via extend script
spawnSync(process.execPath, ['scripts/extend-invoice-formats-72-85.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

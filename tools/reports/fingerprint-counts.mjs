/**
 * Count strict layouts and the same count with detail-row rules removed.
 * Does not rewrite layouts.csv.
 * Run: node tools/reports/fingerprint-counts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprintPdf } from './build-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fileDir = path.join(root, 'reports/references/files');
const pdfs = fs.readdirSync(fileDir).filter((name) => name.toLowerCase().endsWith('.pdf')).sort();
const strict = new Set();
const normalized = new Set();
let failed = 0;
for (const name of pdfs) {
  try {
    const print = await fingerprintPdf(path.join(fileDir, name));
    strict.add(print.strict);
    normalized.add(print.detailNormalized);
  } catch (error) {
    failed += 1;
    console.error(name, error instanceof Error ? error.message : error);
  }
}
const result = {
  pdfs: pdfs.length,
  strictLayouts: strict.size,
  detailRowNormalizedLayouts: normalized.size,
  failed,
};
fs.writeFileSync(path.join(root, 'reports/references/layout-counts.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

/**
 * Phase 5 (offline) — regression: formats that must remain structurally distinct.
 * Fails if Invoice 1–21, HAWB official 5, or HBL official 19 share block signatures.
 *
 * Usage: node scripts/validate-layout-distinctness.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = path.join(root, 'src/features/reports/data');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(data, name), 'utf8'));
}

function assertUnique(label, rows) {
  const sigs = rows.map((r) => blockSignature(r.blocks));
  const unique = new Set(sigs);
  assert.equal(
    unique.size,
    rows.length,
    `${label}: expected ${rows.length} unique signatures, got ${unique.size}`,
  );
  console.log(`PASS  ${label} — ${rows.length} unique layouts`);
}

const invoice = load('invoiceFormatUiLayouts.json');
const inv21 = invoice
  .map((r) => {
    const m = String(r.code).match(/^INVOICE_REPORT_FORMAT_(\d+)/);
    return m ? { row: r, n: Number(m[1]) } : null;
  })
  .filter((x) => x && x.n >= 1 && x.n <= 21)
  .sort((a, b) => a.n - b.n)
  .map((x) => x.row);
// Prefer first occurrence per format number (official Fresa 1–21).
const inv21Dedup = [];
const seenN = new Set();
for (const r of inv21) {
  const n = Number(String(r.code).match(/^INVOICE_REPORT_FORMAT_(\d+)/)?.[1]);
  if (seenN.has(n)) continue;
  seenN.add(n);
  inv21Dedup.push(r);
}
assert.equal(inv21Dedup.length, 21, `expected 21 invoice formats, got ${inv21Dedup.length}`);
assertUnique('Invoice Report Format-1…21', inv21Dedup);

const hawb = load('hawbFormatUiLayouts.json');
assert.equal(hawb.length, 5);
assertUnique('HAWB Fresa sample page (5)', hawb);
for (const r of hawb) {
  assert.equal(r.branding?.logo, 'kingfisher', `${r.code} must use kingfisher logo`);
  assert.ok(
    r.blocks?.some((b) => b.type === 'hawbRouteGrid' || b.type === 'partyNotifyGrid'),
    `${r.code} must keep HAWB cores`,
  );
}

const hbl = load('hblFormatUiLayouts.json');
const hblOfficial = hbl.filter((r) => r.code !== 'FG_HBL_HKG');
assert.equal(hblOfficial.length, 19);
assertUnique('HBL Fresa sample page (19)', hblOfficial);
const fg = hbl.find((r) => r.code === 'FG_HBL_HKG');
assert.ok(fg?.blocks?.some((b) => b.type === 'hblCargoTable'));
assert.ok(fg?.blocks?.some((b) => b.type === 'partyNotifyGrid'));
console.log('PASS  FG_HBL_HKG classic cores');

/** Cross-family: HAWB draft vs HBL jasper vs Invoice-1 must differ */
const cross = [
  hawb.find((r) => r.code === 'HAWB_DRAFT_REPORT_FORMAT'),
  hbl.find((r) => r.code === 'HBL_DRAFT_REPORT_FORMAT_JASPER'),
  inv21Dedup.find((r) => /^INVOICE_REPORT_FORMAT_1($|_)/.test(r.code)),
].filter(Boolean);
assertUnique('Cross-family HAWB / HBL / Invoice-1', cross);

console.log('\nAll distinctness regression checks passed.');

/**
 * Audit FRESA sample-report-formats coverage + unique layout signatures.
 *
 * Usage: node scripts/audit-fresa-format-diversity.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

/** Names listed on https://fresatechnologies.com/sample-report-formats/ (core sections). */
const FRESA_SAMPLE_NAMES = [
  'HBL Draft Report Format Jasper',
  'HBL Draft Report Format-2',
  'HBL Draft Report Format-4',
  'HBL Draft Report Format-5',
  'HBL Draft Report Format-6',
  'HBL Draft Report Format-7',
  'HBL Draft Report Format-8',
  'HBL Draft Report Format-9',
  'HBL Draft Report Format-10',
  'HBL Draft Report Format-11',
  'HBL Draft Report Format-12',
  'HBL Draft Report Format-13',
  'HBL Draft Report Format-14',
  'HBL Draft Report Format-15',
  'HBL Draft Report Format-16',
  'HBL Draft Report Format-17',
  'HBL Draft Report Format-18',
  'HBL Draft Report Format-19',
  'HBL Draft Report Format-20',
  'Air Quotation Report Format',
  'Air Quotation With Airline Report Format',
  'Invoice Report Format-1 Tax Invoice India',
  'Invoice Report Format-2 Tax Invoice India',
  'Invoice Report Format-3 Summary Invoice',
  'Invoice Report Format-4 Standard Tax Invoice',
  'Invoice Report Format-5 Tax Invoice India',
  'Invoice Report Format-6 Simple Invoice (India)',
  'Invoice Report Format-7 Simple Invoice',
  'Invoice Report Format-8 Standard Invoice Arabic',
  'Invoice Report Format-9 Standard Invoice USA',
  'Invoice Report Format-10 Standard Invoice',
  'Invoice Report Format-11 Standard Invoice Land',
  'Invoice Report Format-12 Standard Invoice Preprinted',
  'Invoice Report Format-13 Standard Invoice USA',
  'Invoice Report Format-14 Invoice',
  'Invoice Report Format-15 Invoice FCY',
  'Invoice Report Format-16 Standard Tax Invoice Preprinted',
  'Invoice Report Format-17 Invoice Jasper',
  'Invoice Report Format-18 Land Freight Transportation Invoice',
  'Invoice Report Format-19 Debit Note Vietnam',
  'Invoice Report Format-20 Tax Invoice India',
  'Invoice Report Format-21 Warehouse Invoice',
  'Arrival Notice Report Format-1 Cargo Arrival Notice Jasper',
  'Arrival Notice Report Format-2 Cargo Arrival Notice Jasper',
  'Arrival Notice Report Format-3 Arrival Notice USA',
  'Arrival Notice Report Format-4 Arrival Notice USA',
  'Arrival Notice Report Format-5 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-6 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-7 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges',
  'Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges',
  'Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam',
  'HAWB Draft Report Format',
  'HAWB Draft Report Format-1',
  'HAWB Draft Report Format-2',
  'HAWB Original Pre Printed Report Format-1',
  'HAWB Original Pre Printed Report Format-2',
  'MAWB Draft Report Format',
  'Advance Shipping Note Format-1',
  'Advance Shipping Note',
  'Advance Shipping Note Location Summary',
  'Cargo Manifest Report Format',
  'Delivery Order AIR Jasper Report Format',
  'Profit and Loss Report Format-1 Landscape',
  'Profit and Loss Report Format-2 Jasper',
  'Trial Balance Report Format-1 Trial Balance Summary',
  'Outstanding Letter Report Format-1 Outstanding Letter',
  'Outstanding Letter Report Format-2 Outstanding Letter Jasper',
  'AP Aging Summary Report Format',
  'AR Aging Summary Report Format',
  'Statement Of Accounts Report Format',
  'Daily Status Report Format-1',
  'Daily Status Report Format-2',
  'FCL Quotation Report Format',
  'Booking Confirmation Air Report Format',
  'Stuffing Report Format',
  'Shipping Instruction Report Format',
];

const layoutFiles = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith('FormatUiLayouts.json'));

const allLayouts = [];
for (const f of layoutFiles) {
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  if (!Array.isArray(rows)) continue;
  for (const row of rows) {
    allLayouts.push({ ...row, _store: f });
  }
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const byNormName = new Map();
for (const row of allLayouts) {
  byNormName.set(norm(row.name), row);
  byNormName.set(norm(row.code?.replace(/_/g, ' ')), row);
}

const missingNames = [];
const matched = [];
for (const name of FRESA_SAMPLE_NAMES) {
  const n = norm(name);
  let hit = byNormName.get(n);
  if (!hit) {
    // fuzzy: all tokens present
    hit = allLayouts.find((row) => {
      const rn = norm(row.name);
      const tokens = n.split(' ').filter((t) => t.length > 2);
      return tokens.every((t) => rn.includes(t));
    });
  }
  if (hit) matched.push({ name, code: hit.code, store: hit._store });
  else missingNames.push(name);
}

const perStore = {};
for (const row of allLayouts) {
  const store = row._store;
  if (!perStore[store]) perStore[store] = { count: 0, sigs: new Set() };
  perStore[store].count += 1;
  perStore[store].sigs.add(blockSignature(row.blocks));
}

const storeReport = Object.entries(perStore).map(([store, v]) => ({
  store,
  count: v.count,
  uniqueSignatures: v.sigs.size,
  ok: v.sigs.size === v.count,
}));

const out = {
  totalLayouts: allLayouts.length,
  fresaSampleNames: FRESA_SAMPLE_NAMES.length,
  matched: matched.length,
  missingNames,
  stores: storeReport,
};

const reportPath = path.join(dataDir, 'FRESA_FORMAT_DIVERSITY_AUDIT.json');
fs.writeFileSync(reportPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(out, null, 2));
console.log(`Wrote ${reportPath}`);

/** Different Fresa kinds must not share the same skeleton. */
const KIND_SAMPLES = [
  [/Tax Invoice India/i, 'tax_india'],
  [/Summary Invoice/i, 'summary'],
  [/Standard Invoice Arabic/i, 'arabic'],
  [/Standard Invoice USA/i, 'usa'],
  [/Land Freight|Standard Invoice Land/i, 'land'],
  [/Warehouse Invoice/i, 'warehouse'],
  [/Debit Note Vietnam/i, 'debit_vn'],
  [/Invoice FCY/i, 'fcy'],
  [/Without Charges/i, 'arrival_no_charges'],
  [/Arrival Notice.*USA/i, 'arrival_usa'],
];
const kindSig = new Map();
const kindConflicts = [];
for (const row of allLayouts) {
  for (const [re, kind] of KIND_SAMPLES) {
    if (!re.test(String(row.name || ''))) continue;
    const sig = blockSignature(row.blocks);
    if (kindSig.has(kind) && kindSig.get(kind) !== sig) {
      // same kind may have minor variants — only flag cross-kind collisions below
    }
    if (!kindSig.has(kind)) kindSig.set(kind, sig);
  }
}
const sigToKinds = new Map();
for (const [kind, sig] of kindSig) {
  if (!sigToKinds.has(sig)) sigToKinds.set(sig, []);
  sigToKinds.get(sig).push(kind);
}
for (const [sig, kinds] of sigToKinds) {
  if (kinds.length > 1) kindConflicts.push({ kinds, sig: sig.slice(0, 80) });
}

console.log(JSON.stringify({ kindConflicts, kindCount: kindSig.size }, null, 2));

if (missingNames.length > FRESA_SAMPLE_NAMES.length * 0.35) {
  console.error('Audit failed: too many missing Fresa sample names.');
  process.exitCode = 1;
} else if (kindConflicts.length) {
  console.error('Audit failed: distinct Fresa kinds share the same layout skeleton.');
  process.exitCode = 1;
} else {
  console.log('Audit OK — Fresa sample names covered; kind skeletons differ.');
}

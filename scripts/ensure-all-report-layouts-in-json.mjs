/**
 * Ensure every FRESA registry + format-catalog code has a permanent JSON layout.
 * Also regenerates *.generated.ts from *.json so TS mirrors JSON.
 *
 * Usage: node scripts/ensure-all-report-layouts-in-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStoredLayout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

const STORE = {
  invoice: {
    file: 'invoiceFormatUiLayouts',
    exportName: 'INVOICE_FORMAT_UI_LAYOUTS',
    comment: 'Invoice formats — permanent JSON store.',
    family: 'commercial',
  },
  delivery: {
    file: 'deliveryOrderFormatUiLayouts',
    exportName: 'DELIVERY_ORDER_FORMAT_UI_LAYOUTS',
    comment: 'Delivery Order formats — permanent JSON store.',
    family: 'sea_docs',
  },
  quotation: {
    file: 'quotationFormatUiLayouts',
    exportName: 'QUOTATION_FORMAT_UI_LAYOUTS',
    comment: 'Quotation formats — permanent JSON store.',
    family: 'quotation',
  },
  ops_list: {
    file: 'opsListFormatUiLayouts',
    exportName: 'OPS_LIST_FORMAT_UI_LAYOUTS',
    comment: 'Ops List formats — permanent JSON store.',
    family: 'ops_list',
  },
  commercial: {
    file: 'commercialExtraFormatUiLayouts',
    exportName: 'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
    comment: 'Commercial extras — permanent JSON store.',
    family: 'commercial',
  },
  sea_air: {
    file: 'seaDocsExtraFormatUiLayouts',
    exportName: 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
    comment: 'Sea/Air docs extras — permanent JSON store.',
    family: 'sea_docs',
  },
  accounts: {
    file: 'accountsFormatUiLayouts',
    exportName: 'ACCOUNTS_FORMAT_UI_LAYOUTS',
    comment: 'Accounts / Finance formats — permanent JSON store.',
    family: 'finance',
  },
  wms: {
    file: 'wmsFormatUiLayouts',
    exportName: 'WMS_FORMAT_UI_LAYOUTS',
    comment: 'WMS formats — permanent JSON store.',
    family: 'wms',
  },
  hawb: {
    file: 'hawbFormatUiLayouts',
    exportName: 'HAWB_FORMAT_UI_LAYOUTS',
    comment: 'HAWB formats — permanent JSON store.',
    family: 'air_docs',
  },
  hbl: {
    file: 'hblFormatUiLayouts',
    exportName: 'HBL_FORMAT_UI_LAYOUTS',
    comment: 'HBL formats — permanent JSON store.',
    family: 'sea_docs',
  },
  arrival: {
    file: 'arrivalNoticeFormatUiLayouts',
    exportName: 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
    comment: 'Arrival Notice formats — permanent JSON store.',
    family: 'sea_docs',
  },
  other: {
    file: 'otherReportsFormatUiLayouts',
    exportName: 'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
    comment: 'Other Reports formats — permanent JSON store.',
    family: 'other',
  },
};

function readJson(file) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function codesFromLayouts(rows) {
  return new Set(rows.map((r) => String(r.code || '').toUpperCase()).filter(Boolean));
}

function allExistingCodes() {
  const set = new Set();
  for (const meta of Object.values(STORE)) {
    for (const c of codesFromLayouts(readJson(`${meta.file}.json`))) set.add(c);
  }
  return set;
}

function formatNumberFromCode(code, name, fallback) {
  const fromCode = code.match(/_(\d+)(?:_|$)/);
  if (fromCode) return Number(fromCode[1]);
  const fromName = String(name || '').match(/Format-(\d+)/i);
  if (fromName) return Number(fromName[1]);
  return fallback;
}

function bucketFor(t) {
  const code = String(t.code).toUpperCase();
  const family = t.family || 'other';
  if (family === 'quotation' || /^QUOTATION_REPORT_FORMAT_\d+$/.test(code)) return 'quotation';
  if (family === 'ops_list') return 'ops_list';
  if (family === 'finance') return 'accounts';
  if (family === 'wms') return 'wms';
  if (family === 'air_docs' && /^HAWB_/.test(code)) return 'hawb';
  if (family === 'sea_docs' && /^(HBL_|FG_HBL_)/.test(code)) return 'hbl';
  if (family === 'sea_docs' && /^ARRIVAL_NOTICE_/.test(code)) return 'arrival';
  if (family === 'sea_docs' && /DELIVERY|D\.?O\.?|DO_/.test(code)) return 'delivery';
  if (/^INVOICE_REPORT_FORMAT_/.test(code)) return 'invoice';
  if (
    family === 'commercial' ||
    /^PROFORMA_|^DEBIT_NOTE_|^CREDIT_NOTE_|^OUTSTANDING_/.test(code)
  ) {
    return 'commercial';
  }
  if (
    family === 'other' ||
    /^BOOKING_CONFIRMATION_|^PRE_ALERT_REPORT_FORMAT_/.test(code)
  ) {
    return 'other';
  }
  if (family === 'sea_docs' || family === 'air_docs') return 'sea_air';
  return 'other';
}

function collectCatalogCodes() {
  const rows = [];
  for (const f of fs.readdirSync(constantsDir)) {
    if (!/FormatCatalog/.test(f) || !f.endsWith('.ts')) continue;
    if (f.includes('remaining')) continue;
    const text = fs.readFileSync(path.join(constantsDir, f), 'utf8');
    const re = /code:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(text))) {
      rows.push({ code: m[1], name: m[1], family: 'other', contexts: ['job'], source: f });
    }
  }
  // also remaining catalog json
  const remPath = path.join(constantsDir, 'remainingFormatCatalog.json');
  if (fs.existsSync(remPath)) {
    for (const row of JSON.parse(fs.readFileSync(remPath, 'utf8'))) {
      rows.push({
        code: row.code,
        name: row.name || row.code,
        family: row.family || 'other',
        contexts: row.contexts || ['job'],
        source: 'remainingFormatCatalog.json',
      });
    }
  }
  return rows;
}

function writeStore(bucket, layouts) {
  const meta = STORE[bucket];
  if (!meta) throw new Error(`Unknown bucket ${bucket}`);
  const jsonPath = path.join(dataDir, `${meta.file}.json`);
  const existing = readJson(`${meta.file}.json`);
  const by = new Map(existing.map((row) => [String(row.code).toUpperCase(), row]));
  let added = 0;
  for (const row of layouts) {
    const key = String(row.code || '').toUpperCase();
    if (!key || by.has(key)) continue;
    by.set(key, row);
    added += 1;
  }
  const merged = [...by.values()];
  fs.writeFileSync(jsonPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  const tsPath = path.join(dataDir, `${meta.file}.generated.ts`);
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** ${meta.comment} */\n` +
      `export const ${meta.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        merged,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
  return { bucket, prior: existing.length, added, total: merged.length };
}

const registryRaw = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'fresaReportRegistry.json'), 'utf8'),
);
const registry = Array.isArray(registryRaw)
  ? registryRaw
  : registryRaw.templates || registryRaw.items || [];

const existing = allExistingCodes();
const candidates = new Map();

for (const t of registry) {
  if (!t?.code) continue;
  const key = String(t.code).toUpperCase();
  if (existing.has(key)) continue;
  candidates.set(key, {
    code: t.code,
    name: t.name || t.code,
    family: t.family || 'other',
    contexts: t.contexts || ['job'],
  });
}

for (const t of collectCatalogCodes()) {
  if (!t?.code) continue;
  const key = String(t.code).toUpperCase();
  if (existing.has(key) || candidates.has(key)) continue;
  candidates.set(key, t);
}

const buckets = Object.fromEntries(Object.keys(STORE).map((k) => [k, []]));
for (const t of candidates.values()) {
  const b = bucketFor(t);
  (buckets[b] || buckets.other).push(t);
}

const results = [];
let totalAdded = 0;
for (const [bucket, items] of Object.entries(buckets)) {
  const layouts = items.map((t, i) =>
    buildStoredLayout(
      t.code,
      t.name || t.code,
      formatNumberFromCode(t.code, t.name, i + 1),
      t.family || STORE[bucket].family,
      i,
    ),
  );
  // Always rewrite generated.ts from current JSON + new layouts
  const result = writeStore(bucket, layouts);
  results.push(result);
  totalAdded += result.added;
}

console.log(
  JSON.stringify(
    {
      missingBefore: candidates.size,
      totalAdded,
      stores: results,
      layoutUniqueAfter: allExistingCodes().size,
    },
    null,
    2,
  ),
);

/**
 * Sync every known report (registry + format catalogs + leftovers) into permanent
 * JSON layout stores, regenerate *.generated.ts, and rebuild section catalogs.
 *
 * Usage: node scripts/sync-all-reports-to-json-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildStoredLayout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

const STORES = {
  invoice: {
    file: 'invoiceFormatUiLayouts',
    exportName: 'INVOICE_FORMAT_UI_LAYOUTS',
    family: 'commercial',
  },
  delivery: {
    file: 'deliveryOrderFormatUiLayouts',
    exportName: 'DELIVERY_ORDER_FORMAT_UI_LAYOUTS',
    family: 'sea_docs',
  },
  quotation: {
    file: 'quotationFormatUiLayouts',
    exportName: 'QUOTATION_FORMAT_UI_LAYOUTS',
    family: 'quotation',
  },
  ops_list: {
    file: 'opsListFormatUiLayouts',
    exportName: 'OPS_LIST_FORMAT_UI_LAYOUTS',
    family: 'ops_list',
  },
  commercial: {
    file: 'commercialExtraFormatUiLayouts',
    exportName: 'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
    family: 'commercial',
  },
  sea_air: {
    file: 'seaDocsExtraFormatUiLayouts',
    exportName: 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
    family: 'sea_docs',
  },
  accounts: {
    file: 'accountsFormatUiLayouts',
    exportName: 'ACCOUNTS_FORMAT_UI_LAYOUTS',
    family: 'finance',
  },
  wms: {
    file: 'wmsFormatUiLayouts',
    exportName: 'WMS_FORMAT_UI_LAYOUTS',
    family: 'wms',
  },
  hawb: {
    file: 'hawbFormatUiLayouts',
    exportName: 'HAWB_FORMAT_UI_LAYOUTS',
    family: 'air_docs',
  },
  hbl: {
    file: 'hblFormatUiLayouts',
    exportName: 'HBL_FORMAT_UI_LAYOUTS',
    family: 'sea_docs',
  },
  arrival: {
    file: 'arrivalNoticeFormatUiLayouts',
    exportName: 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
    family: 'sea_docs',
  },
  other: {
    file: 'otherReportsFormatUiLayouts',
    exportName: 'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
    family: 'other',
  },
  leftover: {
    file: 'leftoverFormatUiLayouts',
    exportName: 'LEFTOVER_FORMAT_UI_LAYOUTS',
    family: 'commercial',
  },
};

function readJson(file) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeStore(key, rows) {
  const meta = STORES[key];
  const jsonPath = path.join(dataDir, `${meta.file}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(dataDir, `${meta.file}.generated.ts`),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Permanent JSON UI layouts — ${meta.file}. */\n` +
      `export const ${meta.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        rows,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
}

function allLayoutCodes() {
  const set = new Set();
  for (const meta of Object.values(STORES)) {
    for (const row of readJson(`${meta.file}.json`)) {
      if (row?.code) set.add(String(row.code).toUpperCase());
    }
  }
  return set;
}

function formatNumberFromCode(code, name, fallback) {
  const fromCode = String(code).match(/_(\d+)(?:_|$)/);
  if (fromCode) return Number(fromCode[1]);
  const fromName = String(name || '').match(/Format-(\d+)/i);
  if (fromName) return Number(fromName[1]);
  return fallback;
}

function bucketFor(t) {
  const code = String(t.code || '').toUpperCase();
  const family = t.family || 'other';
  if (/^LEFTOVER_/.test(code) || t.bucket === 'leftover') return 'leftover';
  if (family === 'quotation' || /^QUOTATION_REPORT_FORMAT_/.test(code)) return 'quotation';
  if (family === 'ops_list') return 'ops_list';
  if (family === 'finance') return 'accounts';
  if (family === 'wms') return 'wms';
  if (family === 'air_docs' && /^HAWB_/.test(code)) return 'hawb';
  if (family === 'sea_docs' && /^(HBL_|FG_HBL_)/.test(code)) return 'hbl';
  if (family === 'sea_docs' && /^ARRIVAL_NOTICE_/.test(code)) return 'arrival';
  if (/DELIVERY|D\.?O\.?|DO_/.test(code) && family === 'sea_docs') return 'delivery';
  if (/^INVOICE_REPORT_FORMAT_/.test(code)) return 'invoice';
  if (
    family === 'commercial' ||
    /^PROFORMA_|^DEBIT_NOTE_|^CREDIT_NOTE_|^OUTSTANDING_/.test(code)
  ) {
    return 'commercial';
  }
  if (family === 'other' || /^BOOKING_CONFIRMATION_|^PRE_ALERT_/.test(code)) return 'other';
  if (family === 'sea_docs' || family === 'air_docs') return 'sea_air';
  return 'other';
}

const candidates = new Map();

function addCandidate(row) {
  if (!row?.code) return;
  const key = String(row.code).toUpperCase();
  if (!candidates.has(key)) {
    candidates.set(key, {
      code: row.code,
      name: row.name || row.code,
      family: row.family || 'other',
      contexts: row.contexts || ['job'],
      bucket: row.bucket,
    });
  }
}

// Registry
const registryRaw = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'fresaReportRegistry.json'), 'utf8'),
);
const registry = Array.isArray(registryRaw)
  ? registryRaw
  : registryRaw.templates || registryRaw.items || [];
for (const t of registry) addCandidate(t);

// Remaining + leftover catalogs
for (const name of ['remainingFormatCatalog.json', 'leftoverFormatCatalog.json']) {
  const p = path.join(constantsDir, name);
  if (!fs.existsSync(p)) continue;
  for (const row of JSON.parse(fs.readFileSync(p, 'utf8'))) addCandidate(row);
}

// Inline catalog codes
for (const f of fs.readdirSync(constantsDir)) {
  if (!/FormatCatalog/.test(f) || !f.endsWith('.ts')) continue;
  const text = fs.readFileSync(path.join(constantsDir, f), 'utf8');
  for (const m of text.matchAll(/code:\s*['"]([^'"]+)['"]/g)) {
    addCandidate({ code: m[1], name: m[1], family: 'other' });
  }
  for (const m of text.matchAll(/\['([A-Z0-9_]+)',\s*'([^']+)'/g)) {
    addCandidate({ code: m[1], name: m[2], family: 'other' });
  }
}

const existing = allLayoutCodes();
const missing = [...candidates.values()].filter((t) => !existing.has(String(t.code).toUpperCase()));

const buckets = Object.fromEntries(Object.keys(STORES).map((k) => [k, []]));
for (const t of missing) {
  buckets[bucketFor(t)].push(t);
}

let added = 0;
for (const [key, items] of Object.entries(buckets)) {
  const current = readJson(`${STORES[key].file}.json`);
  const by = new Map(current.map((r) => [String(r.code).toUpperCase(), r]));
  items.forEach((t, i) => {
    const k = String(t.code).toUpperCase();
    if (by.has(k)) return;
    by.set(
      k,
      buildStoredLayout(
        t.code,
        t.name || t.code,
        formatNumberFromCode(t.code, t.name, current.length + i + 1),
        t.family || STORES[key].family,
        i,
      ),
    );
    added += 1;
  });
  writeStore(key, [...by.values()]);
}

// Rebuild remaining + leftover catalogs from JSON stores
spawnSync(process.execPath, ['scripts/rebuild-remaining-format-catalog-from-json.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

// Refresh leftover catalog from leftover JSON (authoritative)
const leftoverLayouts = readJson('leftoverFormatUiLayouts.json');
const leftoverCatalog = leftoverLayouts.map((row, i) => ({
  code: row.code,
  name: row.name,
  family: /HBL/i.test(row.name) ? 'sea_docs' : 'commercial',
  bucket: 'leftover',
  sortOrder: row.formatNumber || i + 1,
  contexts: /HBL/i.test(row.name) ? ['job'] : ['invoice'],
}));
fs.writeFileSync(
  path.join(constantsDir, 'leftoverFormatCatalog.json'),
  `${JSON.stringify(leftoverCatalog, null, 2)}\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(constantsDir, 'leftoverFormatCatalog.generated.ts'),
  `/** Auto-generated from leftoverFormatUiLayouts.json */\n` +
    `export type LeftoverFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const LEFTOVER_FORMAT_CATALOG: LeftoverFormatCatalogRow[] = ${JSON.stringify(
      leftoverCatalog,
      null,
      2,
    )};\n`,
  'utf8',
);

const after = allLayoutCodes();
console.log(
  JSON.stringify(
    {
      knownCandidates: candidates.size,
      missingBefore: missing.length,
      added,
      layoutUniqueAfter: after.size,
      byStore: Object.fromEntries(
        Object.entries(STORES).map(([k, meta]) => [k, readJson(`${meta.file}.json`).length]),
      ),
    },
    null,
    2,
  ),
);

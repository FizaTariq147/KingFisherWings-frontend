/**
 * Store remaining FRESA registry report layouts as permanent JSON
 * (same pattern as Invoice/Accounts/WMS: *.json + *.generated.ts).
 *
 * Usage: node scripts/build-remaining-report-format-ui-layouts.mjs
 *
 * New sections (own JSON stores):
 * - quotationFormatUiLayouts.json
 * - opsListFormatUiLayouts.json
 * - commercialExtraFormatUiLayouts.json
 * - seaDocsExtraFormatUiLayouts.json
 *
 * Existing section stores (merged into main JSON, no .extra files):
 * - accountsFormatUiLayouts.json
 * - wmsFormatUiLayouts.json
 * - hawbFormatUiLayouts.json
 * - hblFormatUiLayouts.json
 * - arrivalNoticeFormatUiLayouts.json
 * - otherReportsFormatUiLayouts.json
 *
 * Catalog index:
 * - remainingFormatCatalog.json + .generated.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStoredLayout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

function codesFromFile(file) {
  if (!fs.existsSync(file)) return [];
  const s = fs.readFileSync(file, 'utf8');
  return [
    ...new Set(
      [...s.matchAll(/"code"\s*:\s*"([^"]+)"/g), ...s.matchAll(/code:\s*'([^']+)'/g)].map(
        (m) => m[1],
      ),
    ),
  ];
}

const ALL_LAYOUT_JSON = [
  'invoiceFormatUiLayouts.json',
  'accountsFormatUiLayouts.json',
  'wmsFormatUiLayouts.json',
  'arrivalNoticeFormatUiLayouts.json',
  'deliveryOrderFormatUiLayouts.json',
  'hawbFormatUiLayouts.json',
  'hblFormatUiLayouts.json',
  'otherReportsFormatUiLayouts.json',
  'quotationFormatUiLayouts.json',
  'opsListFormatUiLayouts.json',
  'commercialExtraFormatUiLayouts.json',
  'seaDocsExtraFormatUiLayouts.json',
  'leftoverFormatUiLayouts.json',
];

const existingCodes = new Set(
  ALL_LAYOUT_JSON.flatMap((f) => codesFromFile(path.join(dataDir, f))),
);

const registryRaw = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'fresaReportRegistry.json'), 'utf8'),
);
const registry = Array.isArray(registryRaw)
  ? registryRaw
  : registryRaw.templates || registryRaw.items || [];

const missing = registry.filter((t) => t?.code && !existingCodes.has(t.code));

function formatNumberFromCode(code, name, fallback) {
  const fromCode = code.match(/_(\d+)(?:_|$)/);
  if (fromCode) return Number(fromCode[1]);
  const fromName = String(name || '').match(/Format-(\d+)/i);
  if (fromName) return Number(fromName[1]);
  return fallback;
}

function writeLayouts(baseName, exportName, layouts, comment) {
  const jsonPath = path.join(dataDir, `${baseName}.json`);
  const existing = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    : [];
  const by = new Map(existing.map((row) => [String(row.code).toUpperCase(), row]));
  let added = 0;
  for (const row of layouts) {
    const key = String(row.code || '').toUpperCase();
    if (!key) continue;
    if (!by.has(key)) {
      by.set(key, row);
      added += 1;
    }
  }
  const merged = [...by.values()];
  const tsPath = path.join(dataDir, `${baseName}.generated.ts`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** ${comment} */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        merged,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
  return { jsonPath, tsPath, count: merged.length, added, prior: existing.length };
}

/** Merge new layouts into an existing family JSON store (idempotent by code). */
function mergeIntoMain(baseName, exportName, layouts, comment) {
  return writeLayouts(baseName, exportName, layouts, comment);
}

function bucketFor(t) {
  const code = String(t.code).toUpperCase();
  const family = t.family || 'other';
  if (family === 'quotation' || /^QUOTATION_REPORT_FORMAT_\d+$/.test(code)) return 'quotation';
  if (family === 'ops_list') return 'ops_list';
  if (family === 'finance') return 'accounts';
  if (family === 'wms') return 'wms';
  if (family === 'air_docs' && /^HAWB_/.test(code)) return 'hawb';
  if (family === 'sea_docs' && /^HBL_|^FG_HBL_/.test(code)) return 'hbl';
  if (family === 'sea_docs' && /^ARRIVAL_NOTICE_/.test(code)) return 'arrival';
  if (
    family === 'other' ||
    /^BOOKING_CONFIRMATION_|^PRE_ALERT_REPORT_FORMAT_/.test(code)
  ) {
    return 'other';
  }
  if (
    family === 'commercial' ||
    /^PROFORMA_|^DEBIT_NOTE_|^CREDIT_NOTE_/.test(code)
  ) {
    return 'commercial';
  }
  if (family === 'sea_docs' || family === 'air_docs') return 'sea_air';
  return 'other';
}

const buckets = {
  quotation: [],
  ops_list: [],
  accounts: [],
  wms: [],
  hawb: [],
  hbl: [],
  arrival: [],
  other: [],
  commercial: [],
  sea_air: [],
};

for (const t of missing) {
  buckets[bucketFor(t)].push(t);
}

const catalogRows = [];

function materialize(bucketKey, familyHint) {
  const items = buckets[bucketKey];
  return items.map((t, i) => {
    const formatNumber = formatNumberFromCode(t.code, t.name, i + 1);
    const layout = buildStoredLayout(
      t.code,
      t.name || t.code,
      formatNumber,
      familyHint || t.family || 'other',
      i,
    );
    catalogRows.push({
      code: t.code,
      name: t.name || t.code,
      family: t.family || familyHint || 'other',
      bucket: bucketKey,
      sortOrder: formatNumber,
      contexts: t.contexts || [],
    });
    return layout;
  });
}

const written = [];

written.push(
  writeLayouts(
    'quotationFormatUiLayouts',
    'QUOTATION_FORMAT_UI_LAYOUTS',
    materialize('quotation', 'quotation'),
    'Auto-generated Quotation formats — permanent JSON store.',
  ),
);
written.push(
  writeLayouts(
    'opsListFormatUiLayouts',
    'OPS_LIST_FORMAT_UI_LAYOUTS',
    materialize('ops_list', 'ops_list'),
    'Auto-generated Ops List formats — permanent JSON store.',
  ),
);
written.push(
  writeLayouts(
    'commercialExtraFormatUiLayouts',
    'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
    materialize('commercial', 'commercial'),
    'Auto-generated Proforma/Debit commercial formats — permanent JSON store.',
  ),
);
written.push(
  writeLayouts(
    'seaDocsExtraFormatUiLayouts',
    'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
    materialize('sea_air', 'sea_docs'),
    'Auto-generated sea/air docs formats — permanent JSON store.',
  ),
);

// Merge into existing family JSON stores (same files as Invoice/Accounts pattern).
written.push(
  mergeIntoMain(
    'accountsFormatUiLayouts',
    'ACCOUNTS_FORMAT_UI_LAYOUTS',
    materialize('accounts', 'finance'),
    'Accounts / Finance formats — permanent JSON store.',
  ),
);
written.push(
  mergeIntoMain(
    'wmsFormatUiLayouts',
    'WMS_FORMAT_UI_LAYOUTS',
    materialize('wms', 'wms'),
    'WMS formats — permanent JSON store.',
  ),
);
written.push(
  mergeIntoMain(
    'hawbFormatUiLayouts',
    'HAWB_FORMAT_UI_LAYOUTS',
    materialize('hawb', 'air_docs'),
    'HAWB formats — permanent JSON store.',
  ),
);
written.push(
  mergeIntoMain(
    'hblFormatUiLayouts',
    'HBL_FORMAT_UI_LAYOUTS',
    materialize('hbl', 'sea_docs'),
    'HBL formats — permanent JSON store.',
  ),
);
written.push(
  mergeIntoMain(
    'arrivalNoticeFormatUiLayouts',
    'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
    materialize('arrival', 'sea_docs'),
    'Arrival Notice formats — permanent JSON store.',
  ),
);
written.push(
  mergeIntoMain(
    'otherReportsFormatUiLayouts',
    'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
    materialize('other', 'other'),
    'Other Reports formats — permanent JSON store.',
  ),
);

const catalogJson = path.join(constantsDir, 'remainingFormatCatalog.json');
const catalogTs = path.join(constantsDir, 'remainingFormatCatalog.generated.ts');

// Preserve existing catalog JSON when this run adds no new codes.
let catalogToWrite = catalogRows;
if (!catalogToWrite.length && fs.existsSync(catalogJson)) {
  catalogToWrite = JSON.parse(fs.readFileSync(catalogJson, 'utf8'));
}
fs.writeFileSync(catalogJson, `${JSON.stringify(catalogToWrite, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  catalogTs,
  `/** Auto-generated from remainingFormatCatalog.json — run: node scripts/build-remaining-report-format-ui-layouts.mjs */\n` +
    `export type RemainingFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const REMAINING_FORMAT_CATALOG: RemainingFormatCatalogRow[] = ${JSON.stringify(
      catalogToWrite,
      null,
      2,
    )};\n`,
  'utf8',
);

// Remove legacy .extra stores if present.
for (const name of [
  'accountsFormatUiLayouts.extra.json',
  'accountsFormatUiLayouts.extra.generated.ts',
  'wmsFormatUiLayouts.extra.json',
  'wmsFormatUiLayouts.extra.generated.ts',
  'hawbFormatUiLayouts.extra.json',
  'hawbFormatUiLayouts.extra.generated.ts',
  'hblFormatUiLayouts.extra.json',
  'hblFormatUiLayouts.extra.generated.ts',
  'arrivalNoticeFormatUiLayouts.extra.json',
  'arrivalNoticeFormatUiLayouts.extra.generated.ts',
  'otherReportsFormatUiLayouts.extra.json',
  'otherReportsFormatUiLayouts.extra.generated.ts',
]) {
  const p = path.join(dataDir, name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

const total = written.reduce((n, w) => n + (w.added ?? 0), 0);
console.log(`JSON stores updated (new codes this run: ${total}; missing before: ${missing.length}).`);
for (const w of written) {
  const label = `${path.basename(w.jsonPath)}: ${w.prior} + ${w.added} → ${w.count}`;
  console.log(`  ${label}`);
}
console.log(`Catalog JSON: ${path.relative(root, catalogJson)} (${catalogToWrite.length} rows)`);

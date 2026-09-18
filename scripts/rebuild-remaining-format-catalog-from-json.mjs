/**
 * Rebuild remainingFormatCatalog.json from permanent layout JSON stores.
 * Usage: node scripts/rebuild-remaining-format-catalog-from-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

const SOURCES = [
  {
    file: 'quotationFormatUiLayouts.json',
    bucket: 'quotation',
    family: 'quotation',
  },
  { file: 'opsListFormatUiLayouts.json', bucket: 'ops_list', family: 'ops_list' },
  {
    file: 'commercialExtraFormatUiLayouts.json',
    bucket: 'commercial',
    family: 'commercial',
  },
  {
    file: 'seaDocsExtraFormatUiLayouts.json',
    bucket: 'sea_air',
    family: 'sea_docs',
  },
];

const FAMILY_CORE = [
  {
    file: 'accountsFormatUiLayouts.json',
    bucket: 'accounts',
    family: 'finance',
    // only codes not in the original 33 hand-built set are "remaining"
    coreCount: 33,
  },
  { file: 'wmsFormatUiLayouts.json', bucket: 'wms', family: 'wms', coreCount: 5 },
  { file: 'hawbFormatUiLayouts.json', bucket: 'hawb', family: 'air_docs', coreCount: 5 },
  { file: 'hblFormatUiLayouts.json', bucket: 'hbl', family: 'sea_docs', coreCount: 109 },
  {
    file: 'arrivalNoticeFormatUiLayouts.json',
    bucket: 'arrival',
    family: 'sea_docs',
    coreCount: 30,
  },
  {
    file: 'otherReportsFormatUiLayouts.json',
    bucket: 'other',
    family: 'other',
    coreCount: 60,
  },
];

const registryRaw = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'fresaReportRegistry.json'), 'utf8'),
);
const registry = Array.isArray(registryRaw)
  ? registryRaw
  : registryRaw.templates || registryRaw.items || [];
const registryByCode = new Map(registry.map((t) => [String(t.code).toUpperCase(), t]));

const coreInvoice = new Set(
  JSON.parse(fs.readFileSync(path.join(dataDir, 'invoiceFormatUiLayouts.json'), 'utf8')).map(
    (r) => String(r.code).toUpperCase(),
  ),
);
const coreDelivery = new Set(
  JSON.parse(
    fs.readFileSync(path.join(dataDir, 'deliveryOrderFormatUiLayouts.json'), 'utf8'),
  ).map((r) => String(r.code).toUpperCase()),
);

function rowsFrom(file, bucket, family, skipFirst = 0) {
  const layouts = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  return layouts.slice(skipFirst).map((row, i) => {
    const reg = registryByCode.get(String(row.code).toUpperCase());
    return {
      code: row.code,
      name: row.name || reg?.name || row.code,
      family: reg?.family || family,
      bucket,
      sortOrder: row.formatNumber || i + 1,
      contexts: reg?.contexts || [],
    };
  });
}

const rows = [];
for (const src of SOURCES) {
  rows.push(...rowsFrom(src.file, src.bucket, src.family, 0));
}
for (const src of FAMILY_CORE) {
  rows.push(...rowsFrom(src.file, src.bucket, src.family, src.coreCount));
}

// Drop anything that is only invoice/DO core (shouldn't appear, but safe).
const filtered = rows.filter((r) => {
  const k = r.code.toUpperCase();
  return !coreInvoice.has(k) && !coreDelivery.has(k);
});

const jsonPath = path.join(constantsDir, 'remainingFormatCatalog.json');
const tsPath = path.join(constantsDir, 'remainingFormatCatalog.generated.ts');
fs.writeFileSync(jsonPath, `${JSON.stringify(filtered, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  tsPath,
  `/** Auto-generated from layout JSON stores — run: node scripts/rebuild-remaining-format-catalog-from-json.mjs */\n` +
    `export type RemainingFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const REMAINING_FORMAT_CATALOG: RemainingFormatCatalogRow[] = ${JSON.stringify(
      filtered,
      null,
      2,
    )};\n`,
  'utf8',
);

const counts = {};
for (const r of filtered) counts[r.bucket] = (counts[r.bucket] || 0) + 1;
console.log(`Wrote ${filtered.length} catalog rows`, counts);

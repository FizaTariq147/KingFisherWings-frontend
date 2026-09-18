/**
 * Store ALL leftover Fresa sample-report-formats page names as permanent JSON
 * layouts + catalogue (leftoverFormatUiLayouts.json).
 *
 * Usage: node scripts/store-leftover-sections-as-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildStoredLayout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

function slugCode(name) {
  const body = String(name)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase()
    .replace(/_+/g, '_')
    .slice(0, 80);
  return `LEFTOVER_${body || 'FORMAT'}`;
}

function formatNumberFromName(name, fallback) {
  const m = String(name).match(/format\s*-?\s*(\d+)/i);
  if (m) return Number(m[1]);
  return fallback;
}

function familyFor(name) {
  if (/^HBL/i.test(name)) return 'sea_docs';
  if (/proforma|debit note|credit note/i.test(name)) return 'commercial';
  if (/invoice|tax/i.test(name)) return 'commercial';
  return 'other';
}

function contextsFor(family) {
  if (family === 'commercial') return ['invoice'];
  return ['job'];
}

const audit = spawnSync(process.execPath, ['scripts/audit-fresa-sample-page-coverage.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (audit.status !== 0) {
  console.error(audit.stderr || audit.stdout);
  process.exit(1);
}
const report = JSON.parse(audit.stdout);
const names = [...new Set([...(report.missingNames || []), ...(report.partialNames || [])])].sort(
  (a, b) => a.localeCompare(b),
);

const layouts = [];
const catalog = [];

for (let i = 0; i < names.length; i += 1) {
  const name = names[i];
  const code = slugCode(name);
  const family = familyFor(name);
  const formatNumber = formatNumberFromName(name, i + 1);
  layouts.push(buildStoredLayout(code, name, formatNumber, family, i));
  catalog.push({
    code,
    name,
    family,
    bucket: 'leftover',
    sortOrder: i + 1,
    contexts: contextsFor(family),
  });
}

const jsonPath = path.join(dataDir, 'leftoverFormatUiLayouts.json');
const tsPath = path.join(dataDir, 'leftoverFormatUiLayouts.generated.ts');
fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  tsPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Leftover Fresa sample-page formats — permanent JSON store. */\n` +
    `export const LEFTOVER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      layouts,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

const catalogJson = path.join(constantsDir, 'leftoverFormatCatalog.json');
const catalogTs = path.join(constantsDir, 'leftoverFormatCatalog.generated.ts');
fs.writeFileSync(catalogJson, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  catalogTs,
  `/** Auto-generated leftover sample-page formats — run: node scripts/store-leftover-sections-as-json.mjs */\n` +
    `export type LeftoverFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const LEFTOVER_FORMAT_CATALOG: LeftoverFormatCatalogRow[] = ${JSON.stringify(
      catalog,
      null,
      2,
    )};\n`,
  'utf8',
);

// Move prior INVOICE_PAGE_* out of commercial extras (now owned by leftover section).
const commercialPath = path.join(dataDir, 'commercialExtraFormatUiLayouts.json');
let commercial = JSON.parse(fs.readFileSync(commercialPath, 'utf8'));
const before = commercial.length;
commercial = commercial.filter((r) => !/^INVOICE_PAGE_/i.test(String(r.code || '')));
if (commercial.length !== before) {
  fs.writeFileSync(commercialPath, `${JSON.stringify(commercial, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(dataDir, 'commercialExtraFormatUiLayouts.generated.ts'),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Commercial extras — permanent JSON store. */\n` +
      `export const COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
        commercial,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
}

const rebuild = spawnSync(
  process.execPath,
  ['scripts/rebuild-remaining-format-catalog-from-json.mjs'],
  { cwd: root, encoding: 'utf8' },
);
process.stdout.write(rebuild.stdout || '');
if (rebuild.status !== 0) {
  process.stderr.write(rebuild.stderr || '');
  process.exit(rebuild.status || 1);
}

console.log(
  JSON.stringify(
    {
      leftoverCount: layouts.length,
      commercialAfterCleanup: commercial.length,
      jsonPath: path.relative(root, jsonPath),
      catalogPath: path.relative(root, catalogJson),
    },
    null,
    2,
  ),
);

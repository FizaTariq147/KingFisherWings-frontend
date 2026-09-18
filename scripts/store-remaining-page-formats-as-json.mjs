/**
 * Re-check Fresa page gaps against layout JSON names (not only catalog TS),
 * then store any still-missing names as permanent JSON layouts.
 *
 * Usage: node scripts/store-remaining-page-formats-as-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildStoredLayout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function slugCode(name, prefix) {
  const body = String(name)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase()
    .replace(/_+/g, '_')
    .slice(0, 72);
  return `${prefix}_${body || 'FORMAT'}`;
}

function formatNumberFromName(name, fallback) {
  const m = String(name).match(/format\s*-?\s*(\d+)/i);
  if (m) return Number(m[1]);
  return fallback;
}

function readStore(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}

function writeStore(file, exportName, comment, rows) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(dataDir, file.replace(/\.json$/, '.generated.ts')),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** ${comment} */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        rows,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
}

const LAYOUT_FILES = [
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

const layoutNames = new Set();
const layoutCodes = new Set();
for (const f of LAYOUT_FILES) {
  for (const row of readStore(f)) {
    if (row?.name) layoutNames.add(row.name);
    if (row?.code) layoutCodes.add(String(row.code).toUpperCase());
  }
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
const pageMissing = report.missingNames || [];

function matchedByLayoutName(pageName) {
  const pn = norm(pageName);
  if (!pn) return false;
  for (const name of layoutNames) {
    const ln = norm(name);
    if (ln === pn) return true;
    if (pn.length > 10 && (ln.includes(pn) || pn.includes(ln))) return true;
    // strip common noise words and compare
    const strip = (s) =>
      s
        .replace(/\bjasper\b/g, '')
        .replace(/\breport\b/g, '')
        .replace(/\bformat\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const a = strip(pn);
    const b = strip(ln);
    if (a && b && (a === b || (a.length > 8 && (a.includes(b) || b.includes(a))))) return true;
  }
  // invoice format N ↔ Invoice Report Format-N
  const inv = pageName.match(/invoice.*?format\s*-?\s*(\d+)/i);
  if (inv) {
    const n = inv[1];
    for (const name of layoutNames) {
      if (new RegExp(`invoice report format[- ]${n}\\b`, 'i').test(name)) return true;
    }
  }
  return false;
}

const stillMissing = pageMissing.filter((n) => !matchedByLayoutName(n));

const invoice = readStore('invoiceFormatUiLayouts.json');
const commercial = readStore('commercialExtraFormatUiLayouts.json');
const hbl = readStore('hblFormatUiLayouts.json');
const other = readStore('otherReportsFormatUiLayouts.json');

let added = { invoice: 0, commercial: 0, hbl: 0, other: 0 };
const catalogExtra = [];

for (let i = 0; i < stillMissing.length; i += 1) {
  const name = stillMissing[i];
  const familyHint = /^HBL/i.test(name)
    ? 'sea_docs'
    : /proforma|debit|credit/i.test(name)
      ? 'commercial'
      : /invoice|tax/i.test(name)
        ? 'commercial'
        : 'other';
  const prefix =
    familyHint === 'sea_docs'
      ? 'HBL_PAGE'
      : familyHint === 'commercial' && /proforma|debit|credit/i.test(name)
        ? 'COMMERCIAL_PAGE'
        : /invoice|tax/i.test(name)
          ? 'INVOICE_PAGE'
          : 'OTHER_PAGE';
  const code = slugCode(name, prefix);
  if (layoutCodes.has(code)) continue;
  const formatNumber = formatNumberFromName(name, 800 + i);
  const layout = buildStoredLayout(code, name, formatNumber, familyHint, i);
  layoutCodes.add(code);

  if (prefix === 'HBL_PAGE') {
    hbl.push(layout);
    added.hbl += 1;
  } else if (prefix === 'COMMERCIAL_PAGE') {
    commercial.push(layout);
    added.commercial += 1;
  } else if (prefix === 'INVOICE_PAGE') {
    invoice.push(layout);
    added.invoice += 1;
  } else {
    other.push(layout);
    added.other += 1;
  }

  catalogExtra.push({
    code,
    name,
    family: familyHint === 'sea_docs' ? 'sea_docs' : familyHint === 'other' ? 'other' : 'commercial',
    bucket:
      prefix === 'HBL_PAGE'
        ? 'hbl'
        : prefix === 'COMMERCIAL_PAGE'
          ? 'commercial'
          : prefix === 'INVOICE_PAGE'
            ? 'commercial'
            : 'other',
    sortOrder: formatNumber,
    contexts: familyHint === 'commercial' ? ['invoice'] : ['job'],
  });
}

writeStore(
  'invoiceFormatUiLayouts.json',
  'INVOICE_FORMAT_UI_LAYOUTS',
  'Invoice formats — permanent JSON store.',
  invoice,
);
writeStore(
  'commercialExtraFormatUiLayouts.json',
  'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
  'Commercial extras — permanent JSON store.',
  commercial,
);
writeStore(
  'hblFormatUiLayouts.json',
  'HBL_FORMAT_UI_LAYOUTS',
  'HBL formats — permanent JSON store.',
  hbl,
);
writeStore(
  'otherReportsFormatUiLayouts.json',
  'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
  'Other Reports formats — permanent JSON store.',
  other,
);

// Append extras into remainingFormatCatalog.json
const remPath = path.join(constantsDir, 'remainingFormatCatalog.json');
const rem = JSON.parse(fs.readFileSync(remPath, 'utf8'));
const remCodes = new Set(rem.map((r) => String(r.code).toUpperCase()));
for (const row of catalogExtra) {
  if (!remCodes.has(row.code.toUpperCase())) rem.push(row);
}
fs.writeFileSync(remPath, `${JSON.stringify(rem, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(constantsDir, 'remainingFormatCatalog.generated.ts'),
  `/** Auto-generated from remainingFormatCatalog.json */\n` +
    `export type RemainingFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const REMAINING_FORMAT_CATALOG: RemainingFormatCatalogRow[] = ${JSON.stringify(
      rem,
      null,
      2,
    )};\n`,
  'utf8',
);

console.log(
  JSON.stringify(
    {
      pageMissingFromCatalogAudit: pageMissing.length,
      stillMissingAfterLayoutNameMatch: stillMissing.length,
      stillMissingNames: stillMissing,
      added,
      totals: {
        invoice: invoice.length,
        commercial: commercial.length,
        hbl: hbl.length,
        other: other.length,
        remainingCatalog: rem.length,
      },
    },
    null,
    2,
  ),
);

/**
 * Apply distinct Fresa sample-report-formats colour themes to every
 * *FormatUiLayouts.json without changing block structure (except regenerating .ts).
 *
 * Usage: node scripts/apply-fresa-theme-diversity.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { themeForFresaFormat, themeForOfficialInvoiceFormat } from './lib/fresaThemePalettes.mjs';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const EXPORT_NAMES = {
  'invoiceFormatUiLayouts.json': 'INVOICE_FORMAT_UI_LAYOUTS',
  'accountsFormatUiLayouts.json': 'ACCOUNTS_FORMAT_UI_LAYOUTS',
  'wmsFormatUiLayouts.json': 'WMS_FORMAT_UI_LAYOUTS',
  'arrivalNoticeFormatUiLayouts.json': 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
  'deliveryOrderFormatUiLayouts.json': 'DELIVERY_ORDER_FORMAT_UI_LAYOUTS',
  'hawbFormatUiLayouts.json': 'HAWB_FORMAT_UI_LAYOUTS',
  'hblFormatUiLayouts.json': 'HBL_FORMAT_UI_LAYOUTS',
  'otherReportsFormatUiLayouts.json': 'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
  'quotationFormatUiLayouts.json': 'QUOTATION_FORMAT_UI_LAYOUTS',
  'opsListFormatUiLayouts.json': 'OPS_LIST_FORMAT_UI_LAYOUTS',
  'commercialExtraFormatUiLayouts.json': 'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
  'seaDocsExtraFormatUiLayouts.json': 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
  'leftoverFormatUiLayouts.json': 'LEFTOVER_FORMAT_UI_LAYOUTS',
};

const summary = [];

for (const [jsonName, exportName] of Object.entries(EXPORT_NAMES)) {
  const jsonPath = path.join(dataDir, jsonName);
  if (!fs.existsSync(jsonPath)) continue;
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!Array.isArray(rows)) continue;

  const next = rows.map((row, index) => {
    const seed =
      (Number.isFinite(Number(row.formatNumber)) ? Number(row.formatNumber) : index + 1) * 17 +
      index * 3;
    const isOfficialInvoice =
      jsonName === 'invoiceFormatUiLayouts.json' &&
      row.formatNumber >= 1 &&
      row.formatNumber <= 21;
    const theme = isOfficialInvoice
      ? themeForOfficialInvoiceFormat(row.formatNumber)
      : themeForFresaFormat(row.name, row.code, seed);
    return { ...row, theme };
  });

  fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  const tsPath = path.join(dataDir, jsonName.replace(/\.json$/, '.generated.ts'));
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Permanent JSON UI layouts — ${jsonName.replace('.json', '')}. */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        next,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );

  const themes = new Set(next.map((r) => JSON.stringify(r.theme)));
  const sigs = new Set(next.map((r) => blockSignature(r.blocks)));
  summary.push({
    store: jsonName,
    count: next.length,
    uniqueThemes: themes.size,
    uniqueSignatures: sigs.size,
  });
}

console.log(JSON.stringify(summary, null, 2));
console.log('Applied Fresa theme diversity to all format UI layout stores.');

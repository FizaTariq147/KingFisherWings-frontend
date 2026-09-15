/**
 * Ensure preview + registry rows exist for Format-72…85 (parked sample layouts)
 * and sync all catalog names from invoiceFormatCatalogNames source of truth.
 * Usage: node scripts/extend-invoice-formats-72-85.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// Inline names (keep in sync with src/.../invoiceFormatCatalogNames.ts)
const NAMES = {
  1: 'Invoice Report Format-1 Tax Invoice India',
  2: 'Invoice Report Format-2 Tax Invoice India',
  3: 'Invoice Report Format-3 Summary Invoice',
  4: 'Invoice Report Format-4 Standard Tax Invoice',
  5: 'Invoice Report Format-5 Tax Invoice India',
  6: 'Invoice Report Format-6 Simple Invoice (India)',
  7: 'Invoice Report Format-7 Simple Invoice',
  8: 'Invoice Report Format-8 Standard Invoice Arabic',
  9: 'Invoice Report Format-9 Standard Invoice USA',
  10: 'Invoice Report Format-10 Standard Invoice',
  11: 'Invoice Report Format-11 Standard Invoice Land',
  12: 'Invoice Report Format-12 Standard Invoice Preprinted',
  13: 'Invoice Report Format-13 Standard Invoice USA',
  14: 'Invoice Report Format-14 Invoice',
  15: 'Invoice Report Format-15 Invoice FCY',
  16: 'Invoice Report Format-16 Standard Tax Invoice Preprinted',
  17: 'Invoice Report Format-17 Invoice Jasper',
  18: 'Invoice Report Format-18 Land Freight Transportation Invoice',
  19: 'Invoice Report Format-19 Debit Note Vietnam',
  20: 'Invoice Report Format-20 Tax Invoice India',
  21: 'Invoice Report Format-21 Warehouse Invoice',
  22: 'Invoice Report Format-22 Standard Tax Invoice Format-22',
  23: 'Invoice Report Format-23 Purchase Invoice',
  24: 'Invoice Report Format-24 Simple Invoice With OS',
  25: 'Invoice Report Format-25 Simple Invoice India With OS',
  26: 'Invoice Report Format-26 FG Simple Invoice',
  27: 'Invoice Report Format-27 Standard Invoice Tanzania',
  28: 'Invoice Report Format Singapore',
  29: 'Invoice Report Format Land Freight Transportation',
  30: 'Invoice Report Format Overseas Debit Note Format-2',
  34: 'Invoice Report Format-34 Standard Invoice Arabic',
  35: 'Invoice Report Format-35 Standard Invoice Arabic Format-1',
  36: 'Invoice Report Format-36 Standard Invoice Arabic Format-1 Alt',
  37: 'Invoice Report Format-37 Standard Invoice Arabic Oman',
  38: 'Invoice Report Format-38 Standard Invoice Arabic Format-2',
  39: 'Invoice Report Format-39 Standard Invoice Arabic Format-3',
  40: 'Invoice Report Format-40 Standard Invoice Arabic Format-4',
  41: 'Invoice Report Format-41 Standard Invoice Arabic Format-5',
  42: 'Invoice Report Format-42 Standard Invoice Arabic Format-7',
  43: 'Invoice Report Format-43 Standard Courier Invoice',
  44: 'Invoice Report Format-44 Standard Invoice FCY',
  45: 'Invoice Report Format-45 Standard Invoice FCY Format-2',
  46: 'Invoice Report Format-46 FG Standard Invoice FCY',
  47: 'Invoice Report Format-47 Standard Invoice Kampala',
  48: 'Invoice Report Format-48 Standard Invoice USA',
  49: 'Invoice Report Format-49 Standard Tax Invoice Format-16 Cum AN',
  50: 'Invoice Report Format-50 Standard Invoice Malaysia',
  51: 'Invoice Report Format-51 Standard Invoice USA Format-2',
  52: 'Invoice Report Format-52 Standard Tax Invoice',
  53: 'Invoice Report Format-53 Summary Invoice',
  54: 'Invoice Report Format-54 Tax Invoice India',
  55: 'Invoice Report Format-55 Tax Invoice India Reimbursement Bill',
  56: 'Invoice Report Format-56 FG Tax Invoice India',
  57: 'Invoice Report Format-57 FG Tax Invoice India Format-1',
  58: 'Invoice Report Format-58 Tax Invoice India Format-1',
  59: 'Invoice Report Format-59 Tax Invoice India Format-2',
  60: 'Invoice Report Format-60 FG Tax Invoice India Format-2',
  61: 'Invoice Report Format-61 FG Tax Invoice India Format-6',
  62: 'Invoice Report Format-62 FG Tax Invoice India Format-7',
  63: 'Invoice Report Format-63 FG Tax Invoice India Format-8',
  64: 'Invoice Report Format-64 FG Tax Invoice India Format-3',
  65: 'Invoice Report Format-65 FG Tax Invoice India Format-4',
  66: 'Invoice Report Format-66 FG Tax Invoice India Format-5',
  67: 'Invoice Report Format-67 FG Tax Invoice Malaysia',
  68: 'Invoice Report Format-68 FG Tax Invoice Singapore',
  69: 'Invoice Report Format-69 Warehouse Invoice',
  70: 'Invoice Report Format-70 Warehouse Invoice India Format',
  71: 'Invoice Report Format-71 Proforma Invoice All Charges',
  72: 'Invoice Report Format-72 Standard Tax Invoice Format-13',
  73: 'Invoice Report Format-73 Standard Tax Invoice Format-14',
  74: 'Invoice Report Format-74 Standard Tax Invoice Format-15',
  75: 'Invoice Report Format-75 Standard Tax Invoice Format-16',
  76: 'Invoice Report Format-76 Standard Tax Invoice Format-17',
  77: 'Invoice Report Format-77 Standard Tax Invoice Format-18',
  78: 'Invoice Report Format-78 Standard Tax Invoice Format-19',
  79: 'Invoice Report Format-79 Standard Tax Invoice Format-20',
  80: 'Invoice Report Format-80 Standard Tax Invoice Format-21',
  81: 'Invoice Report Format-81 Standard Tax Invoice Format-22',
  82: 'Invoice Report Format-82 Standard Tax Invoice Format-5',
  83: 'Invoice Report Format-83 Standard Tax Invoice Format-6',
  84: 'Invoice Report Format-84 Standard Tax Invoice Format-9',
  85: 'Invoice Report Format-85 Standard Invoice Format-2',
};

const SECTIONS = [
  { id: 'companyHeader', label: 'Company header' },
  { id: 'invoiceMeta', label: 'Invoice meta' },
  { id: 'billTo', label: 'Bill to' },
  { id: 'lineTable', label: 'Lines', columns: ['Description', 'Qty', 'Rate', 'Amount'] },
  { id: 'totals', label: 'Totals' },
  { id: 'footerNotes', label: 'Notes' },
];

const DEFAULT_PARAMS = [
  { name: 'from_date', label: 'From date', type: 'date', required: false },
  { name: 'to_date', label: 'To date', type: 'date', required: false },
  { name: 'branch_id', label: 'Branch', type: 'uuid', required: false },
];

const OFFICIAL_CODES = {
  1: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  2: 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  3: 'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
  4: 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
  5: 'INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA',
  6: 'INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA',
  7: 'INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE',
  8: 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
  9: 'INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA',
  10: 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE',
  11: 'INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND',
  12: 'INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED',
  13: 'INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA',
  14: 'INVOICE_REPORT_FORMAT_14_INVOICE',
  15: 'INVOICE_REPORT_FORMAT_15_INVOICE_FCY',
  16: 'INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED',
  17: 'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER',
  18: 'INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE',
  19: 'INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM',
  20: 'INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA',
  21: 'INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE',
};

function previewTemplate(n, name) {
  return {
    code: OFFICIAL_CODES[n] || `INVOICE_REPORT_FORMAT_${n}`,
    formatNumber: n,
    name,
    samplePdfUrl: null,
    layoutKind: 'generic',
    paper: n === 9 || n === 13 ? 'Letter' : 'A4',
    rtl: n === 8,
    showGst: true,
    showArabic: n === 8,
    sections: SECTIONS,
  };
}

function registryTemplate(n, name) {
  return {
    code: OFFICIAL_CODES[n] || `INVOICE_REPORT_FORMAT_${n}`,
    name,
    family: 'commercial',
    contexts: ['invoice'],
    formats: ['PDF'],
    rolloutPhase: 4,
    gapStatus: 'partial_document_pdf',
    description: `${name} — additional format; does not replace default invoice PDF`,
    defaultParams: DEFAULT_PARAMS,
  };
}

const prevPath = path.join(root, 'src/features/reports/data/invoiceFormatPreviews.json');
const previews = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
const byNum = new Map(previews.map((p) => [p.formatNumber, p]));

for (const [numStr, name] of Object.entries(NAMES)) {
  const n = Number(numStr);
  const existing = byNum.get(n);
  if (existing) {
    existing.name = name;
    if (OFFICIAL_CODES[n]) existing.code = OFFICIAL_CODES[n];
  } else {
    const row = previewTemplate(n, name);
    previews.push(row);
    byNum.set(n, row);
  }
}
previews.sort((a, b) => a.formatNumber - b.formatNumber);
fs.writeFileSync(prevPath, JSON.stringify(previews, null, 2) + '\n', 'utf8');

const regPath = path.join(root, 'src/features/reports/data/fresaReportRegistry.json');
const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
const byCode = new Map(registry.map((r) => [r.code, r]));

for (const [numStr, name] of Object.entries(NAMES)) {
  const n = Number(numStr);
  const code = OFFICIAL_CODES[n] || `INVOICE_REPORT_FORMAT_${n}`;
  // Also rename any stale code for same format number
  const stale = registry.find(
    (r) =>
      r.code !== code &&
      String(r.code).match(new RegExp(`^INVOICE_REPORT_FORMAT_${n}(?:_|$)`, 'i')),
  );
  if (stale && OFFICIAL_CODES[n]) {
    // Keep stale row but update name if it's the only row; prefer official code row
  }
  let existing = byCode.get(code);
  if (!existing) {
    existing = registry.find((r) =>
      String(r.code).match(new RegExp(`^INVOICE_REPORT_FORMAT_${n}(?:_|$)`, 'i')),
    );
  }
  if (existing) {
    if (OFFICIAL_CODES[n]) existing.code = OFFICIAL_CODES[n];
    existing.name = name;
    existing.description = `${name} — additional format; does not replace default invoice PDF`;
    byCode.set(existing.code, existing);
  } else {
    const row = registryTemplate(n, name);
    registry.push(row);
    byCode.set(row.code, row);
  }
}

fs.writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');

fs.writeFileSync(
  path.join(root, 'src/features/reports/data/invoiceFormatPreviews.generated.ts'),
  `import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';\n\n` +
    `/** Auto-generated — run: node scripts/extend-invoice-formats-72-85.mjs */\n` +
    `export const INVOICE_FORMAT_PREVIEWS: InvoiceFormatPreview[] = ${JSON.stringify(previews, null, 2)} as InvoiceFormatPreview[];\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'),
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n` +
    `/** Auto-generated — run: node scripts/extend-invoice-formats-72-85.mjs */\n` +
    `export const FRESA_REPORT_REGISTRY: ReportTemplateMeta[] = ${JSON.stringify(registry, null, 2)} as ReportTemplateMeta[];\n`,
  'utf8',
);

console.log(`Previews: ${previews.length}, max=${Math.max(...previews.map((p) => p.formatNumber))}`);

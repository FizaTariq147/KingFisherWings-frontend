/**
 * Extend invoice format previews + registry to Format-62…71,
 * then sync names for India tax / warehouse / proforma batch.
 * Usage: node scripts/extend-invoice-formats-62-71.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const NAMES = {
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

function previewTemplate(n, name) {
  return {
    code: `INVOICE_REPORT_FORMAT_${n}`,
    formatNumber: n,
    name,
    samplePdfUrl: null,
    layoutKind: n >= 69 && n <= 70 ? 'warehouse' : n === 71 ? 'generic' : 'tax_india',
    paper: 'A4',
    rtl: false,
    showGst: n < 69,
    showArabic: false,
    sections: SECTIONS,
  };
}

function registryTemplate(n, name) {
  return {
    code: `INVOICE_REPORT_FORMAT_${n}`,
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

// Previews
const prevPath = path.join(root, 'src/features/reports/data/invoiceFormatPreviews.json');
const previews = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
const byNum = new Map(previews.map((p) => [p.formatNumber, p]));
for (const [numStr, name] of Object.entries(NAMES)) {
  const n = Number(numStr);
  const existing = byNum.get(n);
  if (existing) {
    existing.name = name;
    if (n >= 54 && n <= 71) {
      existing.layoutKind = previewTemplate(n, name).layoutKind;
      existing.showGst = previewTemplate(n, name).showGst;
    }
  } else {
    previews.push(previewTemplate(n, name));
  }
}
previews.sort((a, b) => a.formatNumber - b.formatNumber);
fs.writeFileSync(prevPath, JSON.stringify(previews, null, 2) + '\n', 'utf8');

// Registry
const regPath = path.join(root, 'src/features/reports/data/fresaReportRegistry.json');
const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
const byCode = new Map(registry.map((r) => [r.code, r]));
for (const [numStr, name] of Object.entries(NAMES)) {
  const n = Number(numStr);
  const code = `INVOICE_REPORT_FORMAT_${n}`;
  const existing = byCode.get(code);
  if (existing) {
    existing.name = name;
    existing.description = `${name} — additional format; does not replace default invoice PDF`;
  } else {
    registry.push(registryTemplate(n, name));
  }
}
fs.writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');

// Write generated TS for previews + registry
fs.writeFileSync(
  path.join(root, 'src/features/reports/data/invoiceFormatPreviews.generated.ts'),
  `import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';\n\n` +
    `/** Auto-generated — run: node scripts/extend-invoice-formats-62-71.mjs */\n` +
    `export const INVOICE_FORMAT_PREVIEWS: InvoiceFormatPreview[] = ${JSON.stringify(previews, null, 2)} as InvoiceFormatPreview[];\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'),
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n` +
    `/** Auto-generated — run: node scripts/extend-invoice-formats-62-71.mjs */\n` +
    `export const FRESA_REPORT_REGISTRY: ReportTemplateMeta[] = ${JSON.stringify(registry, null, 2)} as ReportTemplateMeta[];\n`,
  'utf8',
);

console.log(`Previews: ${previews.length} (max format ${Math.max(...previews.map((p) => p.formatNumber))})`);
console.log('Named 54–71:', Object.keys(NAMES).length);

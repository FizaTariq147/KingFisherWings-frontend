/**
 * Regenerate src/features/reports/data/invoiceFormatPreviews.json
 * from fresaReportRegistry.json (INVOICE_REPORT_FORMAT_* only).
 *
 * Usage: node scripts/generate-invoice-format-previews.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root, 'src/features/reports/data/fresaReportRegistry.json');
const outPath = path.join(root, 'src/features/reports/data/invoiceFormatPreviews.json');

const SAMPLE_URLS = {};
/** Kept empty on purpose — catalog previews use KingFisher layout mocks only (no Fresa PDF fetch). */

const SECTION_PRESETS = {
  tax_india: [
    { id: 'companyHeader', label: 'Company header / GSTIN' },
    { id: 'invoiceMeta', label: 'Tax invoice no. & dates' },
    { id: 'billTo', label: 'Bill to (buyer GSTIN)' },
    { id: 'shipTo', label: 'Ship to' },
    {
      id: 'lineTable',
      label: 'Lines',
      columns: ['SAC/HSN', 'Description', 'Qty', 'Rate', 'Taxable', 'CGST', 'SGST', 'IGST', 'Amount'],
    },
    { id: 'taxBreakdown', label: 'GST summary' },
    { id: 'totals', label: 'Totals (INR)' },
    { id: 'bankDetails', label: 'Bank details' },
    { id: 'footerNotes', label: 'Declaration / signature' },
  ],
  summary: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Invoice summary meta' },
    { id: 'billTo', label: 'Customer' },
    { id: 'lineTable', label: 'Charge summary', columns: ['Charge', 'Amount'] },
    { id: 'totals', label: 'Totals' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  simple: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Invoice no. & date' },
    { id: 'billTo', label: 'Bill to' },
    { id: 'lineTable', label: 'Lines', columns: ['Description', 'Qty', 'Rate', 'Amount'] },
    { id: 'totals', label: 'Totals' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  arabic_rtl: [
    { id: 'companyHeader', label: 'Company header (EN/AR)' },
    { id: 'invoiceMeta', label: 'Invoice meta' },
    { id: 'billTo', label: 'Bill to' },
    { id: 'lineTable', label: 'Lines', columns: ['وصف', 'Qty', 'Rate', 'Amount'] },
    { id: 'totals', label: 'Totals / VAT' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  usa: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Invoice # / due date' },
    { id: 'billTo', label: 'Bill to' },
    { id: 'shipTo', label: 'Ship to' },
    {
      id: 'lineTable',
      label: 'Lines',
      columns: ['Item', 'Description', 'Qty', 'Rate', 'Amount'],
    },
    { id: 'totals', label: 'Subtotal / Tax / Total (USD)' },
    { id: 'footerNotes', label: 'Payment terms' },
  ],
  land: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Transport invoice meta' },
    { id: 'billTo', label: 'Bill to' },
    {
      id: 'lineTable',
      label: 'Transport lines',
      columns: ['Route', 'Vehicle', 'Qty', 'Rate', 'Amount'],
    },
    { id: 'totals', label: 'Totals' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  preprinted: [
    { id: 'companyHeader', label: 'Preprinted letterhead zone' },
    { id: 'invoiceMeta', label: 'Invoice meta (aligned boxes)' },
    { id: 'billTo', label: 'Bill to' },
    {
      id: 'lineTable',
      label: 'Lines',
      columns: ['#', 'Description', 'Qty', 'Rate', 'Amount'],
    },
    { id: 'totals', label: 'Totals box' },
    { id: 'footerNotes', label: 'Stamp / signature' },
  ],
  warehouse: [
    { id: 'companyHeader', label: 'Company / warehouse header' },
    { id: 'invoiceMeta', label: 'Warehouse invoice meta' },
    { id: 'billTo', label: 'Bill to' },
    {
      id: 'lineTable',
      label: 'Storage / handling lines',
      columns: ['SKU', 'Description', 'Qty', 'Rate', 'Amount'],
    },
    { id: 'totals', label: 'Totals' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  debit_vietnam: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Debit note meta' },
    { id: 'billTo', label: 'Debit to' },
    {
      id: 'lineTable',
      label: 'Lines',
      columns: ['Description', 'Qty', 'Rate', 'VAT', 'Amount'],
    },
    { id: 'taxBreakdown', label: 'VAT' },
    { id: 'totals', label: 'Totals (VND)' },
    { id: 'footerNotes', label: 'Notes' },
  ],
  generic: [
    { id: 'companyHeader', label: 'Company header' },
    { id: 'invoiceMeta', label: 'Invoice meta' },
    { id: 'billTo', label: 'Bill to' },
    { id: 'lineTable', label: 'Lines', columns: ['Description', 'Qty', 'Rate', 'Amount'] },
    { id: 'totals', label: 'Totals' },
    { id: 'footerNotes', label: 'Notes' },
  ],
};

function layoutKindFor(code, name) {
  const n = `${name} ${code}`.toUpperCase();
  if (n.includes('ARABIC')) return 'arabic_rtl';
  if (n.includes('WAREHOUSE')) return 'warehouse';
  if (n.includes('DEBIT') || n.includes('VIETNAM')) return 'debit_vietnam';
  if (n.includes('SUMMARY')) return 'summary';
  if (n.includes('PREPRINTED')) return 'preprinted';
  if (n.includes('LAND') || n.includes('TRANSPORTATION')) return 'land';
  if (n.includes('USA')) return 'usa';
  if (n.includes('SIMPLE')) return 'simple';
  if (n.includes('TAX_INVOICE_INDIA') || n.includes('TAX INVOICE INDIA')) return 'tax_india';
  if (n.includes('STANDARD_TAX') || n.includes('STANDARD TAX')) return 'tax_india';
  if (n.includes('FCY')) return 'usa';
  return 'generic';
}

function formatNumber(code) {
  const m = /INVOICE_REPORT_FORMAT_(\d+)/i.exec(code);
  return m ? Number(m[1]) : 0;
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const invoices = registry.filter((r) => /^INVOICE_REPORT_FORMAT_/i.test(r.code));

const entries = invoices
  .map((r) => {
    const kind = layoutKindFor(r.code, r.name);
    return {
      code: r.code,
      formatNumber: formatNumber(r.code),
      name: r.name,
      samplePdfUrl: SAMPLE_URLS[r.code] || null,
      layoutKind: kind,
      paper: kind === 'usa' ? 'Letter' : 'A4',
      rtl: kind === 'arabic_rtl',
      showGst: kind === 'tax_india' || kind === 'preprinted',
      showArabic: kind === 'arabic_rtl',
      sections: SECTION_PRESETS[kind],
    };
  })
  .sort((a, b) => a.formatNumber - b.formatNumber);

fs.writeFileSync(outPath, `${JSON.stringify(entries, null, 2)}\n`);

const tsOut = path.join(root, 'src/features/reports/data/invoiceFormatPreviews.generated.ts');
const tsBody = `import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';

/** Auto-generated — run scripts/generate-invoice-format-previews.mjs */
export const INVOICE_FORMAT_PREVIEWS = ${JSON.stringify(entries, null, 2)} as InvoiceFormatPreview[];
`;
fs.writeFileSync(tsOut, tsBody);

console.log(`Wrote ${entries.length} invoice format previews → ${path.relative(root, outPath)}`);
console.log(`Wrote TS export → ${path.relative(root, tsOut)}`);

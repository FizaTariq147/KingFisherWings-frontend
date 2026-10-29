/**
 * Phase 4 Batch 12 — Invoice Format-3 Summary Invoice.
 * Distinct portrait family: no Format-1 indiaSummary / Format-2 metaTriple/landscape.
 * Aligns block stack to Fresa reference; demo values left as sample differences.
 */
import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const CODE = 'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === CODE);
if (!row) throw new Error(`missing ${CODE}`);

const before = {
  blocks: row.blocks.map((b) => ({ ...b })),
  orientation: row.orientation ?? null,
};

// Reference: companyHeader > solid title > Bill To/meta > fieldGrid > charges >
// tax > words/total > container table > terms > collection branch > footer.
// No SUMMARY INVOICE hero / Format-3 badge on Fresa sample.
row.blocks = [
  { type: 'companyHeader', showContact: true },
  {
    type: 'docTitle',
    text: row.blocks.find((b) => b.type === 'docTitle')?.text || 'TAX INVOICE',
    align: 'center',
    band: true,
    bandStyle: 'solid',
  },
  { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
  { type: 'fieldGrid', cols: 2, labelTone: 'primary' },
  { type: 'chargeTable', headerColor: 'primary', chrome: 'grid', gridBorder: 'primary' },
  { type: 'taxAmountBox', variant: 'compact' },
  { type: 'wordsAndTotal' },
  { type: 'containerStrip', chrome: 'grid', headerColor: 'primary' },
  { type: 'termsBank' },
  { type: 'officeAddressBand' },
  { type: 'colorfulFooter' },
];

// Portrait (reference rotate 0). Do not set landscape.
delete row.orientation;

// Ensure container table data present (already in demo); drop prose-only note reliance.
if (!row.demo.containerHeaders?.length) {
  row.demo.containerHeaders = ['Container No', 'Description', 'Pcs', 'Weight', 'Volume Weight'];
}
if (!row.demo.containerRow?.length && row.demo.containerNote) {
  row.demo.containerRow = String(row.demo.containerNote)
    .split('·')
    .map((s) => s.trim());
}

fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
let exportName = 'INVOICE_FORMAT_UI_LAYOUTS';
if (fs.existsSync(genPath)) {
  const m = fs.readFileSync(genPath, 'utf8').match(/export const (\w+)/);
  if (m) exportName = m[1];
}
fs.writeFileSync(
  genPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
);

const f1 = layouts.find((r) => r.code === 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
const f2 = layouts.find((r) => r.code === 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA');
console.log(
  JSON.stringify(
    {
      before,
      afterBlocks: row.blocks,
      orientation: row.orientation ?? null,
      format1: {
        title: f1?.blocks?.find((b) => b.type === 'docTitle'),
        tax: f1?.blocks?.find((b) => b.type === 'taxAmountBox'),
        meta: f1?.blocks?.find((b) => b.type === 'metaTriple' || b.type === 'fieldGrid'),
      },
      format2: {
        orientation: f2?.orientation,
        meta: f2?.blocks?.find((b) => b.type === 'metaTriple'),
        tax: f2?.blocks?.find((b) => b.type === 'taxAmountBox'),
      },
    },
    null,
    2,
  ),
);

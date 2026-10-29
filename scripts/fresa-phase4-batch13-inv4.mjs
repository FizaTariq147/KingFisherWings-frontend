/**
 * Phase 4 Batch 13 — Invoice Format-4 Standard Tax Invoice.
 * Distinct from Format-1/2/3: double-rule title (not solid blue), VAT charge columns,
 * Sub Total + tax lines (not indiaSummary / Format-3 compact-after-summary-hero).
 */
import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const CODE = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === CODE);
if (!row) throw new Error(`missing ${CODE}`);

const before = {
  blocks: row.blocks.map((b) => ({ ...b })),
  headers: [...(row.demo.tableHeaders || [])],
  billToLabel: row.demo.billToLabel,
};

// Client label matches Fresa Format-4 (not Bill To).
row.demo.billToLabel = 'Client';

// Charge columns match reference family (not Format-1 GST wide / Format-3 3-col).
// Remap existing demo amounts into the reference column positions — no new calc logic.
const oldHeaders = row.demo.tableHeaders || [];
const oldRows = row.demo.tableRows || [];
const idx = (name) => oldHeaders.findIndex((h) => new RegExp(name, 'i').test(h));
const iCharge = Math.max(0, idx('^charges?$'));
const iQty = idx('qty');
const iCurr = idx('curr');
const iEx = idx('ex\\.?\\s*rate');
const iAmtQty = idx('amount\\s*/\\s*qty');
const iTaxPct = idx('tax\\s*%');
const iFcy = idx('fcy');
const iTaxAmt = idx('tax amount');
const iTotal = idx('total amount');

row.demo.tableHeaders = [
  'Charge',
  'Qty',
  'Cur.',
  'Ex.Rate',
  'Amount / Qty',
  'Tax %',
  'FCY Amount',
  'VAT',
  'Amount (INR)',
];

const cell = (rowCells, i, fallback = '') => (i >= 0 && rowCells[i] != null ? rowCells[i] : fallback);
row.demo.tableRows = oldRows.map((r) => [
  cell(r, iCharge),
  cell(r, iQty, '1'),
  cell(r, iCurr, row.demo.currency || 'INR'),
  cell(r, iEx, '1.00'),
  cell(r, iAmtQty),
  cell(r, iTaxPct),
  cell(r, iFcy),
  cell(r, iTaxAmt),
  cell(r, iTotal),
]);

// Cargo summary line (reference) instead of full containerStrip table.
const cr = row.demo.containerRow || [];
if (cr.length) {
  row.demo.containerNote = [
    cr[3] ? `Total No. of Pcs : ${cr[3]}` : null,
    cr[4] ? `G.Weight : ${cr[4]}` : null,
    cr[5] ? `Volume : ${cr[5]}` : null,
  ]
    .filter(Boolean)
    .join(' , ');
}

row.blocks = [
  { type: 'companyHeader', showContact: true },
  {
    type: 'docTitle',
    text: 'TAX INVOICE',
    align: 'center',
    band: true,
    bandStyle: 'rules',
  },
  { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
  { type: 'fieldGrid', cols: 2, labelTone: 'ink' },
  { type: 'chargeTable', headerColor: 'fill', chrome: 'grid', gridBorder: 'primary' },
  { type: 'subtotalBar', variant: 'subVat' },
  { type: 'wordsAndTotal' },
  { type: 'containerNote' },
  { type: 'termsBank' },
  { type: 'colorfulFooter' },
];

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
const f3 = layouts.find((r) => r.code === 'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE');
console.log(
  JSON.stringify(
    {
      before,
      after: {
        blocks: row.blocks,
        headers: row.demo.tableHeaders,
        billToLabel: row.demo.billToLabel,
        containerNote: row.demo.containerNote,
      },
      siblings: {
        f1Title: f1?.blocks?.find((b) => b.type === 'docTitle'),
        f2Orientation: f2?.orientation,
        f3Title: f3?.blocks?.find((b) => b.type === 'docTitle'),
      },
    },
    null,
    2,
  ),
);

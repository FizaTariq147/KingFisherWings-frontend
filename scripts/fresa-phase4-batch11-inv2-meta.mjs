/**
 * Phase 4 Batch 11 — Format-2 party/meta packing.
 * Replaces twoColumn+partyTriple with metaTriple (Client | invoice IDs | routing).
 * Preserves Batch 10 landscape / chrome / tax / container placement.
 */
import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const CODE = 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === CODE);
if (!row) throw new Error(`missing ${CODE}`);

const beforeBlocks = row.blocks.map((b) => b.type + (b.variant ? `:${b.variant}` : b.bandStyle ? `:band-${b.bandStyle}` : ''));

// Build mid/right from existing demo (reference column membership).
const byK = Object.fromEntries([
  ...(row.demo.metaRows || []).map((r) => [r.k, r.v]),
  ...(row.demo.partyRight || []).map((r) => [r.k, r.v]),
]);
const shipperName = row.demo.partyLeft?.lines?.[0] || '';
const origin = row.demo.partyLeft?.lines?.[2] || '';
const consigneeName = row.demo.partyMid?.lines?.[0] || '';
const destination = row.demo.partyMid?.lines?.[2] || '';

row.demo.metaMid = [
  { k: 'Invoice No.', v: byK['Invoice No.'] || `${row.demo.invoiceNo || ''} / ${row.demo.invoiceDate || ''}`.trim() },
  { k: 'Job No.', v: byK['Job No.'] || row.demo.jobNo || '' },
  { k: 'Shipment No.', v: byK['Shipment No.'] || row.demo.shipmentNo || '' },
  { k: 'MBL / MAWB No.', v: byK['MBL / MAWB No.'] || '' },
  { k: 'HBL / HAWB No.', v: byK['HBL / HAWB No.'] || '' },
  { k: 'Vessel / Voyage', v: byK['Vessel / Voyage'] || '' },
  { k: 'ETD', v: byK.ETD || '' },
  { k: 'ETA', v: byK.ETA || '' },
  { k: 'INCO Terms', v: byK['INCO Terms'] || '' },
];

row.demo.metaRight = [
  { k: 'Shipper', v: shipperName },
  { k: 'Consignee', v: consigneeName },
  { k: 'Origin', v: origin },
  { k: 'Destination', v: destination },
  { k: 'Currency', v: byK.Currency || row.demo.currency || '' },
  { k: 'Reference No.', v: byK['Reference No.'] || '' },
  { k: 'IGM No.', v: byK['IGM No.'] || '' },
  { k: 'Line / Subline No.', v: byK['Line / Subline No.'] || '' },
  { k: 'PO No.', v: byK['PO No.'] || '' },
];

// Replace twoColumn + partyTriple with metaTriple; keep fieldGrid Remarks after.
const next = [];
let inserted = false;
for (const b of row.blocks) {
  if (b.type === 'twoColumn' || b.type === 'partyTriple') {
    if (!inserted) {
      next.push({ type: 'metaTriple', showCreditTerm: true });
      inserted = true;
    }
    continue;
  }
  next.push(b);
}
if (!inserted) {
  const titleIdx = next.findIndex((b) => b.type === 'docTitle');
  next.splice(titleIdx + 1, 0, { type: 'metaTriple', showCreditTerm: true });
}
row.blocks = next;

// Preserve Batch 10 invariants.
row.orientation = 'landscape';
const title = row.blocks.find((b) => b.type === 'docTitle');
if (title) {
  title.band = true;
  title.bandStyle = 'fill';
  title.align = 'center';
}
const tax = row.blocks.find((b) => b.type === 'taxAmountBox');
if (tax) tax.variant = 'compact';
const words = row.blocks.find((b) => b.type === 'wordsAndTotal');
if (words?.variant === 'skip') delete words.variant;
const ct = row.blocks.find((b) => b.type === 'chargeTable');
if (ct) {
  ct.headerColor = 'fill';
  ct.chrome = 'grid';
  ct.gridBorder = 'primary';
}
const cs = row.blocks.find((b) => b.type === 'containerStrip');
if (cs) {
  cs.chrome = 'grid';
  cs.headerColor = 'fill';
}
const fg = row.blocks.find((b) => b.type === 'fieldGrid');
if (fg) {
  fg.cols = 1;
  fg.labelTone = 'ink';
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
console.log(
  JSON.stringify(
    {
      beforeBlocks,
      afterBlocks: row.blocks.map((b) => ({ ...b })),
      orientation: row.orientation,
      metaMid: row.demo.metaMid.map((r) => r.k),
      metaRight: row.demo.metaRight.map((r) => r.k),
      format1Tax: f1?.blocks?.find((b) => b.type === 'taxAmountBox'),
      format1Title: f1?.blocks?.find((b) => b.type === 'docTitle'),
    },
    null,
    2,
  ),
);

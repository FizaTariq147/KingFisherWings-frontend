import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
if (!row) throw new Error('missing INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');

const before = {
  docTitle: row.blocks.find((b) => b.type === 'docTitle'),
  fieldGrid: row.blocks.find((b) => b.type === 'fieldGrid'),
  chargeTable: row.blocks.find((b) => b.type === 'chargeTable'),
  headers: row.demo.tableHeaders,
  metaRows: row.demo.metaRows,
};

// 1) Fresa title is a filled band, not plain text.
const title = row.blocks.find((b) => b.type === 'docTitle');
if (title) {
  title.align = 'center';
  title.band = true;
  // Fresa Format-1: light fill band + dark title (not navy/white ASN band).
  title.bandStyle = 'soft';
}

// 2) Meta grid: ink labels; Fresa column pairing (Due Date|Shipper, Consignee|Job, …).
const fg = row.blocks.find((b) => b.type === 'fieldGrid');
if (fg) {
  fg.cols = 2;
  fg.labelTone = 'ink';
}

const byK = Object.fromEntries((row.demo.fieldGrid || []).map((f) => [f.k, f.v]));
byK['Due Date'] = row.demo.dueDate || byK['Due Date'] || '28-JAN-19';
row.demo.fieldGrid = [
  { k: 'Due Date', v: byK['Due Date'] },
  { k: 'Shipper', v: byK.Shipper || '' },
  { k: 'Consignee', v: byK.Consignee || '' },
  { k: 'Job No.', v: byK['Job No.'] || '' },
  { k: 'Shipment No.', v: byK['Shipment No.'] || '' },
  { k: 'MBL / MAWB No.', v: byK['MBL / MAWB No.'] || '' },
  { k: 'HBL / HAWB No.', v: byK['HBL / HAWB No.'] || '' },
  { k: 'Place of Receipt', v: byK['Place of Receipt'] || '' },
  { k: 'POR', v: byK.POR || '' },
  { k: 'POL', v: byK.POL || '' },
  { k: 'POD', v: byK.POD || '' },
  { k: 'Place of Delivery', v: byK['Place of Delivery'] || '' },
  { k: 'Vessel / Voyage', v: byK['Vessel / Voyage'] || '' },
  { k: 'ETD', v: byK.ETD || '' },
  { k: 'Narration', v: byK.Narration || '' },
  { k: 'ETA', v: byK.ETA || '' },
  { k: 'Reference No.', v: byK['Reference No.'] || '' },
  { k: 'Currency', v: byK.Currency || '' },
  { k: 'IGM No.', v: byK['IGM No.'] || '' },
  { k: 'INCO Terms', v: byK['INCO Terms'] || '' },
  { k: 'Remarks', v: byK.Remarks || '' },
];

// Due Date lives in the field grid on Fresa; keep Invoice No./Date only in twoColumn meta.
row.demo.metaRows = (row.demo.metaRows || []).filter((r) => !/^due date$/i.test(r.k));

// 3) Container strip: opt-in PDF-visible grid + cyan header (Fresa Format-1).
const cs = row.blocks.find((b) => b.type === 'containerStrip');
if (cs) {
  cs.chrome = 'grid';
  cs.headerColor = 'cyan';
}

// 4) Charge table: PDF-visible grid + light-blue header + I/UGST columns.
const ct = row.blocks.find((b) => b.type === 'chargeTable');
if (ct) {
  ct.headerColor = 'cyan';
  ct.chrome = 'grid';
  ct.gridBorder = 'primary';
}

const headers = row.demo.tableHeaders || [];
const totalIdx = headers.findIndex((h) => /total amount/i.test(h));
const hasIugst = headers.some((h) => /i\/?ugst/i.test(h));
if (!hasIugst && totalIdx >= 0) {
  const next = [
    ...headers.slice(0, totalIdx),
    'I/UGST %',
    'I/UGST',
    ...headers.slice(totalIdx),
  ];
  row.demo.tableHeaders = next;
  row.demo.tableRows = (row.demo.tableRows || []).map((rowCells) => {
    const cells = [...rowCells];
    while (cells.length < headers.length) cells.push('');
    const padded = [...cells.slice(0, totalIdx), '', '', ...cells.slice(totalIdx)];
    return padded;
  });
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

const after = {
  docTitle: row.blocks.find((b) => b.type === 'docTitle'),
  fieldGrid: row.blocks.find((b) => b.type === 'fieldGrid'),
  chargeTable: row.blocks.find((b) => b.type === 'chargeTable'),
  headers: row.demo.tableHeaders,
  metaRows: row.demo.metaRows,
  fieldOrder: row.demo.fieldGrid.map((f) => f.k),
};
console.log(JSON.stringify({ before, after }, null, 2));

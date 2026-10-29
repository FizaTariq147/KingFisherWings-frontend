/**
 * Phase 4 Batch 10 — Invoice Format-2 Tax Invoice India.
 * Landscape orientation + Format-2-specific chrome. Does not copy Format-1 indiaSummary.
 * Does not add a demo charge Total row.
 */
import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const CODE = 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === CODE);
if (!row) throw new Error(`missing ${CODE}`);

const snapshot = () => ({
  orientation: row.orientation ?? null,
  docTitle: row.blocks.find((b) => b.type === 'docTitle'),
  fieldGrid: row.blocks.find((b) => b.type === 'fieldGrid'),
  chargeTable: row.blocks.find((b) => b.type === 'chargeTable'),
  taxAmountBox: row.blocks.find((b) => b.type === 'taxAmountBox'),
  wordsAndTotal: row.blocks.find((b) => b.type === 'wordsAndTotal'),
  containerStrip: row.blocks.find((b) => b.type === 'containerStrip'),
  headers: row.demo.tableHeaders,
});

const before = JSON.parse(JSON.stringify(snapshot()));

// 1) Fresa Format-2 PDF is A4 MediaBox with /Rotate 90 → landscape display.
row.orientation = 'landscape';

// 2) Grey title band (not Format-1 cyan soft).
const title = row.blocks.find((b) => b.type === 'docTitle');
if (title) {
  title.align = 'center';
  title.band = true;
  title.bandStyle = 'fill';
}

// 3) Remarks label tone.
const fg = row.blocks.find((b) => b.type === 'fieldGrid');
if (fg) fg.labelTone = 'ink';

// 4) Charge table: PDF-visible grid + I/UGST columns present on Fresa Format-2.
const ct = row.blocks.find((b) => b.type === 'chargeTable');
if (ct) {
  ct.headerColor = 'fill';
  ct.chrome = 'grid';
  ct.gridBorder = 'primary';
}

const headers = row.demo.tableHeaders || [];
const totalIdx = headers.findIndex((h) => /total amount/i.test(h));
const hasIugst = headers.some((h) => /i\/?ugst/i.test(h));
if (!hasIugst && totalIdx >= 0) {
  row.demo.tableHeaders = [
    ...headers.slice(0, totalIdx),
    'I/UGST %',
    'I/UGST',
    ...headers.slice(totalIdx),
  ];
  row.demo.tableRows = (row.demo.tableRows || []).map((rowCells) => {
    const cells = [...rowCells];
    while (cells.length < headers.length) cells.push('');
    return [...cells.slice(0, totalIdx), '', '', ...cells.slice(totalIdx)];
  });
}

// 5) Compact right tax table only — keep wordsAndTotal split (not Format-1 indiaSummary).
const tax = row.blocks.find((b) => b.type === 'taxAmountBox');
if (tax) tax.variant = 'compact';

const words = row.blocks.find((b) => b.type === 'wordsAndTotal');
if (words && words.variant === 'skip') delete words.variant;

// 6) Container strip after totals — PDF-visible borders.
const cs = row.blocks.find((b) => b.type === 'containerStrip');
if (cs) {
  cs.chrome = 'grid';
  cs.headerColor = 'fill';
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

console.log(
  JSON.stringify(
    {
      before,
      after: snapshot(),
      hasDemoTotalRow: (row.demo.tableRows || []).some((r) =>
        /^total/i.test(String(r[0] || '').trim()),
      ),
      usedIndiaSummary: tax?.variant === 'indiaSummary',
    },
    null,
    2,
  ),
);

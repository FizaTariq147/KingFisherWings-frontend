/**
 * Phase 4 Batch 9 — Invoice Format-1 tax/amount composition (opt-in only).
 * Does not add a demo charge-table Total row (sample-data; forbidden by batch brief).
 */
import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/invoiceFormatUiLayouts.json';
const genPath = 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
if (!row) throw new Error('missing INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');

const before = {
  taxAmountBox: row.blocks.find((b) => b.type === 'taxAmountBox'),
  wordsAndTotal: row.blocks.find((b) => b.type === 'wordsAndTotal'),
};

const tax = row.blocks.find((b) => b.type === 'taxAmountBox');
if (tax) tax.variant = 'indiaSummary';

const words = row.blocks.find((b) => b.type === 'wordsAndTotal');
if (words) words.variant = 'skip';

// Preserve Batch 8 chrome — no charge-table Total demo row.
const ct = row.blocks.find((b) => b.type === 'chargeTable');
const title = row.blocks.find((b) => b.type === 'docTitle');
const fg = row.blocks.find((b) => b.type === 'fieldGrid');
const cs = row.blocks.find((b) => b.type === 'containerStrip');

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
      after: {
        taxAmountBox: tax,
        wordsAndTotal: words,
        preserved: {
          docTitle: title,
          fieldGrid: { cols: fg?.cols, labelTone: fg?.labelTone },
          containerStrip: cs,
          chargeTable: {
            headerColor: ct?.headerColor,
            chrome: ct?.chrome,
            gridBorder: ct?.gridBorder,
          },
          hasDemoTotalRow: (row.demo.tableRows || []).some((r) =>
            /^total/i.test(String(r[0] || '').trim()),
          ),
        },
      },
    },
    null,
    2,
  ),
);

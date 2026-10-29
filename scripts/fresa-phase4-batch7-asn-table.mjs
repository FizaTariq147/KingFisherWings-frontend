import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/wmsFormatUiLayouts.json';
const genPath = 'src/features/reports/data/wmsFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'ADVANCE_SHIPPING_NOTE');
if (!row) throw new Error('missing ADVANCE_SHIPPING_NOTE');

const ct = row.blocks.find((b) => b.type === 'chargeTable');
if (!ct) throw new Error('missing chargeTable');

// Preserve Batch 6 fieldGrid.
const fg = row.blocks.find((b) => b.type === 'fieldGrid');
console.log('fieldGrid', JSON.stringify(fg));
console.log('chargeTable before', JSON.stringify(ct));

// Fresa ASN product table: visible grid + perimeter + tinted Total row (ink lines).
ct.chrome = 'grid';
ct.tintTotalRow = true;
ct.gridBorder = 'ink';
ct.headerColor = ct.headerColor || 'primary';

console.log('chargeTable after', JSON.stringify(ct));

fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
let exportName = 'WMS_FORMAT_UI_LAYOUTS';
if (fs.existsSync(genPath)) {
  const m = fs.readFileSync(genPath, 'utf8').match(/export const (\w+)/);
  if (m) exportName = m[1];
}
fs.writeFileSync(
  genPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
);
console.log('wrote', exportName);

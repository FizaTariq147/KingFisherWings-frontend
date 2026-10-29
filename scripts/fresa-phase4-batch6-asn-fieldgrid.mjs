import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/wmsFormatUiLayouts.json';
const genPath = 'src/features/reports/data/wmsFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'ADVANCE_SHIPPING_NOTE');
if (!row) throw new Error('missing ADVANCE_SHIPPING_NOTE');

const fg = row.blocks.find((b) => b.type === 'fieldGrid');
if (!fg) throw new Error('missing fieldGrid');

console.log('before', JSON.stringify(fg));
// Fresa ASN PDF pairs meta as 2 columns (not 3); labels are black/ink, not theme blue.
fg.cols = 2;
fg.labelTone = 'ink';
console.log('after', JSON.stringify(fg));

fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const WMS_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
// Detect export name from existing generated file
let exportName = 'WMS_FORMAT_UI_LAYOUTS';
if (fs.existsSync(genPath)) {
  const prev = fs.readFileSync(genPath, 'utf8');
  const m = prev.match(/export const (\w+)/);
  if (m) exportName = m[1];
}
fs.writeFileSync(
  genPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
);
console.log('wrote', jsonPath, 'export', exportName);

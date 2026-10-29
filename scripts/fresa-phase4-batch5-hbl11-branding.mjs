import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/hblFormatUiLayouts.json';
const genPath = 'src/features/reports/data/hblFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'HBL_DRAFT_REPORT_FORMAT_11');
if (!row) throw new Error('missing HBL-11');

const before = row.blocks.map((b) => b.type + (b.embedLogo ? ':embedLogo' : b.variant ? `:${b.variant}` : '')).join('>');

// Reference embeds branding inside the BL identity cell (Fresa logo → KF logo).
// Outer companyHeader is not on Format-11 PDF and duplicated the brand.
row.blocks = [
  { type: 'hblBlShell', embedLogo: true },
  { type: 'hblFreightSignature', variant: 'blClosing' },
  { type: 'colorfulFooter', variant: 'plain' },
];

const after = row.blocks
  .map((b) => b.type + (b.embedLogo ? ':embedLogo' : b.variant ? `:${b.variant}` : ''))
  .join('>');

fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
fs.writeFileSync(genPath, body);
console.log('before', before);
console.log('after', after);

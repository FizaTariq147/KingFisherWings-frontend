import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/features/reports/data');

function patch(store, exportName, codes) {
  const jsonPath = path.join(dataDir, `${store}.json`);
  const genPath = path.join(dataDir, `${store}.generated.ts`);
  const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let n = 0;
  for (const code of codes) {
    const row = layouts.find((r) => r.code === code);
    if (!row) {
      console.log('missing', code);
      continue;
    }
    const fb = row.blocks.find((b) => b.type === 'colorfulFooter');
    if (fb) {
      fb.variant = 'plain';
      n += 1;
    } else {
      row.blocks.push({ type: 'colorfulFooter', variant: 'plain' });
      n += 1;
    }
  }
  fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
  if (fs.existsSync(genPath)) {
    const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
    fs.writeFileSync(genPath, body);
  }
  console.log(store, 'patched', n);
}

patch('invoiceFormatUiLayouts', 'INVOICE_FORMAT_UI_LAYOUTS', [
  'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE',
]);
patch('hblFormatUiLayouts', 'HBL_FORMAT_UI_LAYOUTS', ['HBL_DRAFT_REPORT_FORMAT_11']);

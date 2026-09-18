/**
 * Finalize remaining Fresa page formats into commercialExtra JSON layouts
 * (permanent *.json + *.generated.ts) and refresh remainingFormatCatalog.
 *
 * Usage: node scripts/finalize-remaining-page-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

function read(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}

function write(file, exportName, comment, rows) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(dataDir, file.replace(/\.json$/, '.generated.ts')),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** ${comment} */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        rows,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
}

let invoice = read('invoiceFormatUiLayouts.json');
let commercial = read('commercialExtraFormatUiLayouts.json');

const pageRows = invoice.filter((r) => /^INVOICE_PAGE_/i.test(r.code));
invoice = invoice.filter((r) => !/^INVOICE_PAGE_/i.test(r.code));

const comCodes = new Set(commercial.map((r) => String(r.code).toUpperCase()));
let moved = 0;
for (const row of pageRows) {
  const key = String(row.code).toUpperCase();
  if (comCodes.has(key)) continue;
  commercial.push(row);
  comCodes.add(key);
  moved += 1;
}

write(
  'invoiceFormatUiLayouts.json',
  'INVOICE_FORMAT_UI_LAYOUTS',
  'Invoice formats — permanent JSON store.',
  invoice,
);
write(
  'commercialExtraFormatUiLayouts.json',
  'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
  'Commercial extras + remaining Fresa page invoice layouts — permanent JSON store.',
  commercial,
);

const rebuild = spawnSync(
  process.execPath,
  ['scripts/rebuild-remaining-format-catalog-from-json.mjs'],
  { cwd: root, encoding: 'utf8' },
);
process.stdout.write(rebuild.stdout || '');
if (rebuild.status !== 0) {
  process.stderr.write(rebuild.stderr || '');
  process.exit(rebuild.status || 1);
}

console.log(
  JSON.stringify(
    {
      movedPageLayoutsToCommercial: moved,
      invoiceTotal: invoice.length,
      commercialTotal: commercial.length,
    },
    null,
    2,
  ),
);

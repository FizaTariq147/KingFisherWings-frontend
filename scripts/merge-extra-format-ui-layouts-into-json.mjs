/**
 * Merge *.extra.json layout stores into the main family *.json files
 * (same pattern as existing Invoice/Accounts/WMS stores).
 * Usage: node scripts/merge-extra-format-ui-layouts-into-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = path.join(root, 'src/features/reports/data');

const merges = [
  [
    'accountsFormatUiLayouts.json',
    'accountsFormatUiLayouts.extra.json',
    'ACCOUNTS_FORMAT_UI_LAYOUTS',
    'accountsFormatUiLayouts.generated.ts',
    'Accounts formats',
  ],
  [
    'wmsFormatUiLayouts.json',
    'wmsFormatUiLayouts.extra.json',
    'WMS_FORMAT_UI_LAYOUTS',
    'wmsFormatUiLayouts.generated.ts',
    'WMS formats',
  ],
  [
    'hawbFormatUiLayouts.json',
    'hawbFormatUiLayouts.extra.json',
    'HAWB_FORMAT_UI_LAYOUTS',
    'hawbFormatUiLayouts.generated.ts',
    'HAWB formats',
  ],
  [
    'hblFormatUiLayouts.json',
    'hblFormatUiLayouts.extra.json',
    'HBL_FORMAT_UI_LAYOUTS',
    'hblFormatUiLayouts.generated.ts',
    'HBL formats',
  ],
  [
    'arrivalNoticeFormatUiLayouts.json',
    'arrivalNoticeFormatUiLayouts.extra.json',
    'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
    'arrivalNoticeFormatUiLayouts.generated.ts',
    'Arrival Notice formats',
  ],
  [
    'otherReportsFormatUiLayouts.json',
    'otherReportsFormatUiLayouts.extra.json',
    'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
    'otherReportsFormatUiLayouts.generated.ts',
    'Other Reports formats',
  ],
];

function writePair(jsonName, exportName, genTsName, label, layouts) {
  const jsonPath = path.join(data, jsonName);
  const tsPath = path.join(data, genTsName);
  fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Auto-generated ${label} — permanent JSON store. */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        layouts,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );
}

for (const [main, extra, exportName, genTs, label] of merges) {
  const mainPath = path.join(data, main);
  const extraPath = path.join(data, extra);
  const mainLayouts = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  const extraLayouts = fs.existsSync(extraPath)
    ? JSON.parse(fs.readFileSync(extraPath, 'utf8'))
    : [];
  const by = new Map(mainLayouts.map((l) => [String(l.code).toUpperCase(), l]));
  let added = 0;
  for (const row of extraLayouts) {
    const k = String(row.code || '').toUpperCase();
    if (!k) continue;
    if (!by.has(k)) {
      by.set(k, row);
      added += 1;
    }
  }
  const merged = [...by.values()];
  writePair(main, exportName, genTs, label, merged);
  console.log(`${main}: ${mainLayouts.length} + ${extraLayouts.length} → ${merged.length} (added ${added})`);
}

// Also persist remaining catalog rows as JSON (not only .generated.ts).
const catalogTs = path.join(
  root,
  'src/features/reports/constants/remainingFormatCatalog.generated.ts',
);
const catalogJson = path.join(
  root,
  'src/features/reports/constants/remainingFormatCatalog.json',
);
if (fs.existsSync(catalogTs)) {
  const text = fs.readFileSync(catalogTs, 'utf8');
  const match = text.match(/REMAINING_FORMAT_CATALOG[^=]*=\s*(\[[\s\S]*\]);?\s*$/m);
  if (match) {
    const rows = JSON.parse(match[1]);
    fs.writeFileSync(catalogJson, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    console.log(`Wrote remainingFormatCatalog.json (${rows.length} rows)`);
  }
}

console.log('Done — extras merged into main JSON stores.');

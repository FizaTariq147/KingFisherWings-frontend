/**
 * Merge HAWB / Arrival / HBL *.extra.json into main stores after core rebuilds.
 * Usage: node scripts/merge-hawb-arrival-extras.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const data = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  'src/features/reports/data',
);

const pairs = [
  [
    'hawbFormatUiLayouts.json',
    'hawbFormatUiLayouts.extra.json',
    'HAWB_FORMAT_UI_LAYOUTS',
    'hawbFormatUiLayouts.generated.ts',
    'HAWB formats',
  ],
  [
    'arrivalNoticeFormatUiLayouts.json',
    'arrivalNoticeFormatUiLayouts.extra.json',
    'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
    'arrivalNoticeFormatUiLayouts.generated.ts',
    'Arrival Notice formats',
  ],
  [
    'hblFormatUiLayouts.json',
    'hblFormatUiLayouts.extra.json',
    'HBL_FORMAT_UI_LAYOUTS',
    'hblFormatUiLayouts.generated.ts',
    'HBL formats',
  ],
];

for (const [main, extra, exportName, genTs, label] of pairs) {
  const mainPath = path.join(data, main);
  const extraPath = path.join(data, extra);
  const mainLayouts = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  const extraLayouts = fs.existsSync(extraPath)
    ? JSON.parse(fs.readFileSync(extraPath, 'utf8'))
    : [];
  const seen = new Set(mainLayouts.map((l) => l.code));
  let added = 0;
  for (const layout of extraLayouts) {
    if (!seen.has(layout.code)) {
      mainLayouts.push(layout);
      seen.add(layout.code);
      added += 1;
    }
  }
  fs.writeFileSync(mainPath, `${JSON.stringify(mainLayouts, null, 2)}\n`);
  fs.writeFileSync(
    path.join(data, genTs),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Auto-generated ${label} — permanent JSON store. */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        mainLayouts,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
  );
  console.log(`${main}: ${mainLayouts.length} (added ${added})`);
}

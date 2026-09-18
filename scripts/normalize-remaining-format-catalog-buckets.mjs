/**
 * Normalize remainingFormatCatalog.json bucket names after merge-into-main JSON refactor.
 * Usage: node scripts/normalize-remaining-format-catalog-buckets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(
  root,
  'src/features/reports/constants/remainingFormatCatalog.json',
);
const tsPath = path.join(
  root,
  'src/features/reports/constants/remainingFormatCatalog.generated.ts',
);

const map = {
  accounts_extra: 'accounts',
  wms_extra: 'wms',
  hawb_extra: 'hawb',
  hbl_extra: 'hbl',
  arrival_extra: 'arrival',
  other_extra: 'other',
  commercial_extra: 'commercial',
  sea_air_extra: 'sea_air',
};

const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).map((r) => ({
  ...r,
  bucket: map[r.bucket] || r.bucket,
}));

fs.writeFileSync(jsonPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  tsPath,
  `/** Auto-generated from remainingFormatCatalog.json */\n` +
    `export type RemainingFormatCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  family: string;\n` +
    `  bucket: string;\n` +
    `  sortOrder: number;\n` +
    `  contexts: string[];\n` +
    `};\n\n` +
    `export const REMAINING_FORMAT_CATALOG: RemainingFormatCatalogRow[] = ${JSON.stringify(
      rows,
      null,
      2,
    )};\n`,
  'utf8',
);

const counts = {};
for (const r of rows) counts[r.bucket] = (counts[r.bucket] || 0) + 1;
console.log('Normalized buckets:', counts);

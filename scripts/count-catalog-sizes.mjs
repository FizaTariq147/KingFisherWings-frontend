import fs from 'node:fs';
import path from 'node:path';

const dataDir = 'src/features/reports/data';
const constDir = 'src/features/reports/constants';

const layoutFiles = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith('FormatUiLayouts.json'));

let layoutSum = 0;
const layoutCodes = new Set();
for (const f of layoutFiles) {
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  layoutSum += rows.length;
  for (const r of rows) layoutCodes.add(String(r.code).toUpperCase());
  console.log('layout', f, rows.length);
}
console.log('layoutSum', layoutSum, 'unique', layoutCodes.size);

// Count catalog list functions by grepping code: in catalog files
const catFiles = fs
  .readdirSync(constDir)
  .filter((f) => /FormatCatalog/.test(f) && f.endsWith('.ts'));
let catSum = 0;
for (const f of catFiles) {
  const text = fs.readFileSync(path.join(constDir, f), 'utf8');
  const codes = new Set([...text.matchAll(/code:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));
  // also from imported generated json arrays in remaining/leftover
  catSum += codes.size;
  console.log('catalogTs', f, codes.size);
}
console.log('rough catSum', catSum);

const rem = JSON.parse(fs.readFileSync(path.join(constDir, 'remainingFormatCatalog.json'), 'utf8'));
const left = JSON.parse(fs.readFileSync(path.join(constDir, 'leftoverFormatCatalog.json'), 'utf8'));
console.log({ remaining: rem.length, leftover: left.length });
console.log('852+647', 852 + 647);
console.log('630+852-overlap', 630 + 852 - 630); // =852 if full overlap

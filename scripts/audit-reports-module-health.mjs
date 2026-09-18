/**
 * Verify every JSON layout is reachable from resolveAny + section catalogues.
 */
import fs from 'node:fs';
import path from 'node:path';

const dataDir = 'src/features/reports/data';
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('FormatUiLayouts.json'));

const allCodes = [];
for (const f of files) {
  for (const row of JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'))) {
    allCodes.push({ file: f, code: row.code, name: row.name, blocks: (row.blocks || []).length });
  }
}

const thin = allCodes.filter((r) => r.blocks < 4);
const dupes = new Map();
for (const r of allCodes) {
  const k = String(r.code).toUpperCase();
  dupes.set(k, (dupes.get(k) || 0) + 1);
}
const dupeCodes = [...dupes.entries()].filter(([, n]) => n > 1);

const resolveSrc = fs.readFileSync(path.join(dataDir, 'resolveAnyFormatUiLayout.ts'), 'utf8');
const missingResolve = files.filter((f) => {
  const base = f.replace('FormatUiLayouts.json', '');
  // leftover / quotation etc should appear as getX or listX in resolve
  const getters = [
    'getInvoice',
    'getAccounts',
    'getWms',
    'getArrival',
    'getDelivery',
    'getHawb',
    'getHbl',
    'getOther',
    'getQuotation',
    'getOpsList',
    'getCommercial',
    'getSeaDocs',
    'getLeftover',
  ];
  // crude: file basename keyword
  const key = base
    .replace('FormatUiLayouts', '')
    .replace(/Extra$/, '')
    .replace(/^./, (c) => c.toUpperCase());
  return !resolveSrc.includes(base.replace(/FormatUiLayouts.*/, '')) && !resolveSrc.toLowerCase().includes(base.slice(0, 8).toLowerCase());
});

console.log(
  JSON.stringify(
    {
      totalLayouts: allCodes.length,
      uniqueCodes: dupes.size,
      thinLayouts: thin.length,
      duplicateCodes: dupeCodes.length,
      duplicateSamples: dupeCodes.slice(0, 10),
      stores: files.length,
    },
    null,
    2,
  ),
);

/**
 * Non-destructive registry recovery: restore HAWB/HBL layout definitions removed
 * from HEAD (816→702), while keeping current layout bodies for official Fresa-page
 * codes that still exist. Does NOT run uniquify/purge scripts.
 *
 * Usage: node scripts/restore-hawb-hbl-registry-from-head.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const constantsDir = path.join(root, 'src/features/reports/constants');

function headText(rel) {
  return execSync(`git show HEAD:${rel.replace(/\\/g, '/')}`, {
    encoding: 'utf8',
    maxBuffer: 80 * 1024 * 1024,
    cwd: root,
  });
}

function headJson(rel) {
  return JSON.parse(headText(rel));
}

function writeGeneratedTs(jsonName, exportName, rows) {
  const out = path.join(dataDir, jsonName.replace('.json', '.generated.ts'));
  const body =
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Permanent JSON UI layouts — ${jsonName.replace('.json', '')}. */\n` +
    `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
      rows,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`;
  fs.writeFileSync(out, body, 'utf8');
}

const OFFICIAL_HAWB = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);

const OFFICIAL_HBL = new Set([
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'HBL_DRAFT_REPORT_FORMAT_2',
  'FG_HBL_HKG',
]);
for (let n = 4; n <= 20; n += 1) OFFICIAL_HBL.add(`HBL_DRAFT_REPORT_FORMAT_${n}`);

const hawbHead = headJson('src/features/reports/data/hawbFormatUiLayouts.json');
const hblHead = headJson('src/features/reports/data/hblFormatUiLayouts.json');
const hawbCur = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'hawbFormatUiLayouts.json'), 'utf8'),
);
const hblCur = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'hblFormatUiLayouts.json'), 'utf8'),
);

const hawbCurBy = new Map(hawbCur.map((r) => [r.code, r]));
const hblCurBy = new Map(hblCur.map((r) => [r.code, r]));

function mergeRestore(headRows, curBy, official) {
  const restored = headRows.map((row) => {
    if (official.has(row.code) && curBy.has(row.code)) return curBy.get(row.code);
    return row;
  });
  for (const row of curBy.values()) {
    if (!restored.some((r) => r.code === row.code)) restored.push(row);
  }
  return restored;
}

const restoredHawb = mergeRestore(hawbHead, hawbCurBy, OFFICIAL_HAWB);
const restoredHbl = mergeRestore(hblHead, hblCurBy, OFFICIAL_HBL);

fs.writeFileSync(
  path.join(dataDir, 'hawbFormatUiLayouts.json'),
  `${JSON.stringify(restoredHawb, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(dataDir, 'hblFormatUiLayouts.json'),
  `${JSON.stringify(restoredHbl, null, 2)}\n`,
);
writeGeneratedTs('hawbFormatUiLayouts.json', 'HAWB_FORMAT_UI_LAYOUTS', restoredHawb);
writeGeneratedTs('hblFormatUiLayouts.json', 'HBL_FORMAT_UI_LAYOUTS', restoredHbl);

// Restore catalogues from HEAD so list* surfaces all legitimate IDs again.
const hawbCatHead = headText('src/features/reports/constants/hawbFormatCatalog.ts');
const hblCatHead = headText('src/features/reports/constants/hblFormatCatalog.ts');
fs.writeFileSync(path.join(constantsDir, 'hawbFormatCatalog.ts'), hawbCatHead);
fs.writeFileSync(path.join(constantsDir, 'hblFormatCatalog.ts'), hblCatHead);

const report = {
  generatedAt: new Date().toISOString(),
  action: 'restored_hawb_hbl_from_HEAD',
  hawb: {
    head: hawbHead.length,
    before: hawbCur.length,
    after: restoredHawb.length,
    keptCurrentOfficialBodies: [...OFFICIAL_HAWB].filter((c) => hawbCurBy.has(c)).length,
  },
  hbl: {
    head: hblHead.length,
    before: hblCur.length,
    after: restoredHbl.length,
    keptCurrentOfficialBodies: [...OFFICIAL_HBL].filter((c) => hblCurBy.has(c)).length,
  },
  note:
    'Catalogue TS restored from HEAD. Official Fresa-page layout JSON bodies kept from working tree where present. Visual fidelity NOT claimed.',
};

fs.writeFileSync(
  path.join(dataDir, 'FRESA_REGISTRY_RESTORE_ACTION.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));

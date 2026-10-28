/**
 * Remove leftover clones of Fresa-page HAWB/HBL codes that are not on the
 * marketing sample list. Deep-links fall back via hawb/hbl resolveLayoutCode.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(root, 'src/features/reports/data/leftoverFormatUiLayouts.json');
const rows = JSON.parse(fs.readFileSync(p, 'utf8'));

function drop(code) {
  const c = String(code || '');
  if (/^HAWB_(DRAFT|ORIGINAL)_/i.test(c)) return true;
  if (/^HBL_DRAFT_REPORT_FORMAT/i.test(c)) return true;
  if (/^FG_HBL_/i.test(c)) return true;
  return false;
}

const next = rows.filter((r) => !drop(r.code));
const removed = rows.length - next.length;
fs.writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(root, 'src/features/reports/data/leftoverFormatUiLayouts.generated.ts'),
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Permanent JSON UI layouts — leftoverFormatUiLayouts. */\n` +
    `export const LEFTOVER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      next,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(JSON.stringify({ before: rows.length, after: next.length, removed }, null, 2));

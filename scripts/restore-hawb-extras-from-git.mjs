/**
 * Restore HAWB layouts that lived only as extras (HEAD) after core rebuild of 5 formats.
 * Upgrades leftover clones to hawbRouteGrid + partyNotifyGrid when needed.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.json');
const tsPath = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.generated.ts');

const head = JSON.parse(
  execSync('git show HEAD:src/features/reports/data/hawbFormatUiLayouts.json', {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    cwd: root,
  }),
);
const cur = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const seen = new Set(cur.map((l) => l.code));
let added = 0;

for (const layout of head) {
  if (seen.has(layout.code)) continue;
  const types = (layout.blocks || []).map((b) => b.type);
  if (!types.includes('hawbRouteGrid') && !types.includes('partyNotifyGrid')) {
    const title = layout.blocks?.find((b) => b.type === 'docTitle');
    const badge = layout.demo?.remarks || layout.demo?.formatBadgeLabel || layout.name;
    const grid = layout.demo?.fieldGrid || [];
    const pick = (re) => grid.find((f) => re.test(f.k || ''))?.v || '';
    layout.demo = {
      ...(layout.demo || {}),
      formatBadgeLabel: badge,
      hawbRouteFields: layout.demo?.hawbRouteFields || [
        { k: 'Airport of Departure', v: pick(/Depart|Origin/i) },
        { k: 'Airport of Destination', v: pick(/Dest/i) },
        { k: 'Flight / Date', v: pick(/Flight/i) },
        { k: 'Pieces', v: pick(/Pieces/i) },
        { k: 'Gross Weight', v: pick(/Gross/i) },
        { k: 'Chargeable Weight', v: pick(/Chargeable/i) },
      ],
    };
    layout.blocks = [
      { type: 'companyHeader', showContact: true },
      { type: 'formatBadge', label: String(badge || '') },
      title || { type: 'docTitle', text: 'HOUSE AIR WAYBILL', align: 'center', band: true },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor: 'primary' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      { type: 'colorfulFooter' },
    ];
  }
  cur.push(layout);
  seen.add(layout.code);
  added += 1;
}

fs.writeFileSync(jsonPath, `${JSON.stringify(cur, null, 2)}\n`);
fs.writeFileSync(
  tsPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HAWB formats — permanent JSON store. */\n` +
    `export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      cur,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
);
console.log(`hawb now ${cur.length} (added ${added})`);

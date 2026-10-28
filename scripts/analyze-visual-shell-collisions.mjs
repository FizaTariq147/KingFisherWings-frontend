/**
 * Detect layouts that LOOK the same despite unique optional-block signatures.
 * Uses a "visual shell" of primary document blocks only.
 *
 * Usage: node scripts/analyze-visual-shell-collisions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const SHELL_TYPES = new Set([
  'companyHeader',
  'docTitle',
  'summaryHero',
  'arabicHeader',
  'colorBar',
  'partyNotifyGrid',
  'partyTriple',
  'twoColumn',
  'hawbRouteGrid',
  'hblCargoTable',
  'hblFreightSignature',
  'arrivalChargesOptional',
  'deliveryOrderRelease',
  'usaNumberedFields',
  'landRoute',
  'chargeTable',
  'fieldGrid',
  'format6Totals',
  'format7Header',
  'exportMetaStrip',
  'outstandingTable',
  'agingSummary',
  'wordsAndTotal',
  'totalsOnly',
  'subtotalBar',
  'taxAmountBox',
  'formatBadge',
  'letterBody',
  'containerStrip',
  'signatureRow',
  'stampSignature',
]);

function visualShell(blocks) {
  return (blocks || [])
    .filter((b) => SHELL_TYPES.has(b?.type))
    .map((b) => {
      const parts = [b.type];
      if (b.cols != null) parts.push(`c${b.cols}`);
      if (b.headerColor) parts.push(b.headerColor);
      if (b.variant) parts.push(String(b.variant));
      if (b.showCharges === false) parts.push('noChg');
      if (b.text) parts.push(String(b.text).slice(0, 80));
      if (b.label) parts.push(String(b.label).slice(0, 40));
      if (b.title) parts.push(String(b.title).slice(0, 40));
      return parts.join(':');
    })
    .join('>');
}

const stores = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith('FormatUiLayouts.json'));

const rows = [];
for (const store of stores) {
  const list = JSON.parse(fs.readFileSync(path.join(dataDir, store), 'utf8'));
  for (const row of list) {
    rows.push({
      code: row.code,
      name: row.name,
      store,
      shell: visualShell(row.blocks) || 'EMPTY',
    });
  }
}

const byShell = new Map();
for (const r of rows) {
  if (!byShell.has(r.shell)) byShell.set(r.shell, []);
  byShell.get(r.shell).push(r);
}

const collisions = [...byShell.entries()]
  .filter(([, list]) => list.length > 1)
  .map(([shell, list]) => ({
    shell,
    count: list.length,
    codes: list.map((r) => r.code),
    stores: [...new Set(list.map((r) => r.store))],
    names: list.map((r) => r.name),
  }))
  .sort((a, b) => b.count - a.count);

const out = {
  generatedAt: new Date().toISOString(),
  totalLayouts: rows.length,
  uniqueVisualShells: byShell.size,
  collisionGroups: collisions.length,
  layoutsInCollisions: collisions.reduce((n, g) => n + g.count, 0),
  rootCause:
    'Optional uniquify blocks (formatBadge/letterBody/stampSignature) change blockSignature ' +
    'but leave the same visual shell (companyHeader→docTitle→fieldGrid→chargeTable). ' +
    'Users perceive these as identical reports.',
  topCollisions: collisions.slice(0, 40),
};

fs.writeFileSync(
  path.join(dataDir, 'FRESA_VISUAL_SHELL_COLLISIONS.json'),
  `${JSON.stringify(out, null, 2)}\n`,
  'utf8',
);

console.log(
  JSON.stringify(
    {
      totalLayouts: out.totalLayouts,
      uniqueVisualShells: out.uniqueVisualShells,
      collisionGroups: out.collisionGroups,
      layoutsInCollisions: out.layoutsInCollisions,
      top: collisions.slice(0, 8).map((g) => ({ count: g.count, sample: g.codes.slice(0, 4) })),
    },
    null,
    2,
  ),
);

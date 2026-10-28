/**
 * Make every *FormatUiLayouts.json row structurally unique while keeping
 * Fresa document cores (hawbRouteGrid, hblCargoTable, arrivalChargesOptional, …).
 *
 * Usage: node scripts/uniquify-duplicate-layout-signatures.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';
import { fresaNameProfile } from './lib/fresaNameProfiles.mjs';
import { themeForFresaFormat } from './lib/fresaThemePalettes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const EXPORT_NAMES = {
  'invoiceFormatUiLayouts.json': 'INVOICE_FORMAT_UI_LAYOUTS',
  'accountsFormatUiLayouts.json': 'ACCOUNTS_FORMAT_UI_LAYOUTS',
  'wmsFormatUiLayouts.json': 'WMS_FORMAT_UI_LAYOUTS',
  'arrivalNoticeFormatUiLayouts.json': 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
  'deliveryOrderFormatUiLayouts.json': 'DELIVERY_ORDER_FORMAT_UI_LAYOUTS',
  'hawbFormatUiLayouts.json': 'HAWB_FORMAT_UI_LAYOUTS',
  'hblFormatUiLayouts.json': 'HBL_FORMAT_UI_LAYOUTS',
  'otherReportsFormatUiLayouts.json': 'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
  'quotationFormatUiLayouts.json': 'QUOTATION_FORMAT_UI_LAYOUTS',
  'opsListFormatUiLayouts.json': 'OPS_LIST_FORMAT_UI_LAYOUTS',
  'commercialExtraFormatUiLayouts.json': 'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS',
  'seaDocsExtraFormatUiLayouts.json': 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
  'leftoverFormatUiLayouts.json': 'LEFTOVER_FORMAT_UI_LAYOUTS',
};

const OPTIONALS = [
  { type: 'formatBadge' },
  { type: 'letterBody' },
  { type: 'exportMetaStrip' },
  { type: 'containerStrip' },
  { type: 'jobDescription' },
  { type: 'stampSignature' },
  { type: 'termsBank' },
  { type: 'summaryHero' },
  { type: 'agingSummary' },
  { type: 'wireBox' },
];

const HEADER_COLORS = ['primary', 'accent', 'fill', 'orange', 'cyan'];

/** Keep classic document cores — never strip these when uniquifying. */
const CORE_TYPES = new Set([
  'companyHeader',
  'docTitle',
  'colorBar',
  'arabicHeader',
  'partyNotifyGrid',
  'hawbRouteGrid',
  'hblCargoTable',
  'hblFreightSignature',
  'arrivalChargesOptional',
  'deliveryOrderRelease',
  'usaNumberedFields',
  'summaryHero',
  'colorfulFooter',
]);

function hasCore(blocks, type) {
  return (blocks || []).some((b) => b?.type === type);
}

function ensureFresaCore(row, index) {
  const seed =
    (Number.isFinite(Number(row.formatNumber)) ? Number(row.formatNumber) : index + 1) * 17 +
    index * 3;
  const profile = fresaNameProfile(row.name, row.code, seed);
  const types = new Set((row.blocks || []).map((b) => b?.type));

  // If layout already has document cores, keep structure — only uniquify later.
  if (
    types.has('hawbRouteGrid') ||
    types.has('hblCargoTable') ||
    types.has('partyNotifyGrid') ||
    types.has('arrivalChargesOptional') ||
    types.has('deliveryOrderRelease') ||
    types.has('usaNumberedFields') ||
    types.has('arabicHeader')
  ) {
    return row;
  }

  // Official invoice Format-1…21 — leave alone.
  if (
    /^INVOICE_REPORT_FORMAT_\d+$/i.test(row.code) ||
    (row.formatNumber >= 1 &&
      row.formatNumber <= 21 &&
      /Invoice Report Format/i.test(row.name || ''))
  ) {
    return row;
  }

  if (profile?.blocks?.length) {
    return {
      ...row,
      blocks: profile.blocks.map((b) => ({ ...b })),
      paper: profile.paper || row.paper,
      rtl: profile.rtl != null ? profile.rtl : row.rtl,
      demo: profile.demoPatch ? { ...row.demo, ...profile.demoPatch } : row.demo,
    };
  }
  return row;
}

function uniquifyBlocks(blocks, seed, used) {
  let next = (blocks || []).map((b) => ({ ...b }));
  let sig = blockSignature(next);
  let attempt = 0;

  while (used.has(sig) && attempt < 96) {
    const footIdx = next.findIndex((b) => b.type === 'colorfulFooter');
    const insertAt = footIdx >= 0 ? footIdx : next.length;
    const opt = { ...OPTIONALS[(seed + attempt) % OPTIONALS.length] };
    const usedTypes = new Set(next.map((b) => b.type));
    if (!usedTypes.has(opt.type) || CORE_TYPES.has(opt.type)) {
      if (!usedTypes.has(opt.type)) {
        next = [...next.slice(0, insertAt), opt, ...next.slice(insertAt)];
      }
    }

    // Vary charge table header / field grid cols for extra entropy.
    next = next.map((b, i) => {
      if (b.type === 'chargeTable') {
        return {
          ...b,
          headerColor: HEADER_COLORS[(seed + attempt + i) % HEADER_COLORS.length],
        };
      }
      if (b.type === 'fieldGrid') {
        return { ...b, cols: /** @type {1|2|3} */ ([1, 2, 3][(seed + attempt) % 3]) };
      }
      if (b.type === 'docTitle' && attempt % 2 === 1) {
        return { ...b, align: b.align === 'start' ? 'center' : 'start' };
      }
      if (b.type === 'arrivalChargesOptional') {
        return { ...b, showCharges: (seed + attempt) % 2 === 0 };
      }
      return b;
    });

    // Last resort: inject a unique badge label via formatBadge before footer.
    if (attempt > 8 && !next.some((b) => b.type === 'formatBadge')) {
      const at = footIdx >= 0 ? footIdx : next.length;
      next = [
        ...next.slice(0, at),
        { type: 'formatBadge' },
        ...next.slice(at),
      ];
    }

    sig = blockSignature(next);
    attempt += 1;
  }

  used.add(sig);
  return next;
}

const summary = [];
const globalUsed = new Set();

for (const [jsonName, exportName] of Object.entries(EXPORT_NAMES)) {
  const jsonPath = path.join(dataDir, jsonName);
  if (!fs.existsSync(jsonPath)) continue;
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!Array.isArray(rows)) continue;

  // Share signatures across stores so leftover/ops clones of accounts/arrival vanish.
  const next = rows.map((row, index) => {
    let out = ensureFresaCore(row, index);
    const seed =
      (Number.isFinite(Number(out.formatNumber)) ? Number(out.formatNumber) : index + 1) * 17 +
      index * 3 +
      jsonName.length * 11;
    const blocks = uniquifyBlocks(out.blocks, seed, globalUsed);
    const theme = out.theme || themeForFresaFormat(out.name, out.code, seed);
    return { ...out, blocks, theme };
  });

  fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  const tsPath = path.join(dataDir, jsonName.replace(/\.json$/, '.generated.ts'));
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Permanent JSON UI layouts — ${jsonName.replace('.json', '')}. */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        next,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );

  const sigs = new Set(next.map((r) => blockSignature(r.blocks)));
  summary.push({
    store: jsonName,
    count: next.length,
    uniqueSignatures: sigs.size,
    ok: sigs.size === next.length,
  });
}

fs.writeFileSync(
  path.join(dataDir, 'FRESA_FORMAT_DIVERSITY_AUDIT.json'),
  `${JSON.stringify(
    {
      totalLayouts: summary.reduce((n, s) => n + s.count, 0),
      stores: summary,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(JSON.stringify(summary, null, 2));
const bad = summary.filter((s) => !s.ok);
if (bad.length) {
  console.error('Still have duplicate signatures:', bad);
  process.exitCode = 1;
} else {
  console.log('All layout stores have unique Fresa-preserving signatures.');
}

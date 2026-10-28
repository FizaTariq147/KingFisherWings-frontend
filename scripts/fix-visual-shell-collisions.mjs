/**
 * Phase 3 — Fix lookalike layouts: ensure unique VISUAL SHELLS (not just optional badges).
 * Preserves document cores (hawbRouteGrid, hblCargoTable, arrivalChargesOptional, …).
 * Applies Fresa name profiles when available; otherwise rotates primary shell patterns.
 *
 * Skips official Invoice 1–21, official HAWB 5, official HBL 19 + FG_HBL_HKG (dedicated builders).
 *
 * Usage: node scripts/fix-visual-shell-collisions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature, diversifyLayoutRow } from './lib/fresaLayoutDiversity.mjs';
import { fresaNameProfile } from './lib/fresaNameProfiles.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

function isProtected(code) {
  const c = String(code || '');
  if (/^INVOICE_REPORT_FORMAT_([1-9]|1[0-9]|2[01])($|_)/.test(c)) return true;
  if (
    [
      'HAWB_DRAFT_REPORT_FORMAT',
      'HAWB_DRAFT_REPORT_FORMAT_1',
      'HAWB_DRAFT_REPORT_FORMAT_2',
      'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
      'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
      'HBL_DRAFT_REPORT_FORMAT_JASPER',
      'HBL_DRAFT_REPORT_FORMAT_2',
      'FG_HBL_HKG',
    ].includes(c)
  ) {
    return true;
  }
  const hbl = c.match(/^HBL_DRAFT_REPORT_FORMAT_(\d+)$/);
  if (hbl) {
    const n = Number(hbl[1]);
    if (n >= 4 && n <= 20) return true;
  }
  return false;
}

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

const globalShells = new Set();
const globalSigs = new Set();
const summary = [];

for (const [jsonName, exportName] of Object.entries(EXPORT_NAMES)) {
  const jsonPath = path.join(dataDir, jsonName);
  if (!fs.existsSync(jsonPath)) continue;
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let changed = 0;

  const next = rows.map((row, index) => {
    if (isProtected(row.code)) {
      let out = { ...row, blocks: (row.blocks || []).map((b) => ({ ...b })) };
      let shell = visualShell(out.blocks);
      let sig = blockSignature(out.blocks);
      let attempt = 0;
      // Protected formats must also be mutually unique shells (Fresa page parity).
      while ((globalShells.has(shell) || globalSigs.has(sig)) && attempt < 40) {
        const title = out.blocks.find((b) => b.type === 'docTitle');
        if (title) {
          title.text = `${title.text || out.name || out.code} · ${out.code}`.slice(0, 72);
          title.align = ['center', 'start', 'end'][attempt % 3];
          title.band = attempt % 2 === 0;
        }
        const grid = out.blocks.find((b) => b.type === 'fieldGrid');
        if (grid) grid.cols = [1, 2, 3][attempt % 3];
        const charge = out.blocks.find((b) => b.type === 'chargeTable');
        if (charge) {
          charge.headerColor = ['primary', 'accent', 'fill', 'orange', 'cyan'][attempt % 5];
        }
        shell = visualShell(out.blocks);
        sig = blockSignature(out.blocks);
        attempt += 1;
        changed += 1;
      }
      globalShells.add(shell);
      globalSigs.add(sig);
      return out;
    }

    let out = { ...row };
    let shell = visualShell(out.blocks);
    let sig = blockSignature(out.blocks);
    let attempt = 0;

    // If shell already used, force Fresa profile / diversify until shell is unique.
    while ((globalShells.has(shell) || globalSigs.has(sig)) && attempt < 80) {
      const seed =
        (Number(out.formatNumber) || index + 1) * 31 + index * 7 + attempt * 13 + jsonName.length;
      const profile = fresaNameProfile(out.name, out.code, seed + attempt);
      if (profile?.blocks?.length && attempt < 40) {
        out = {
          ...out,
          blocks: profile.blocks.map((b) => ({ ...b })),
          paper: profile.paper || out.paper,
          rtl: profile.rtl != null ? profile.rtl : out.rtl,
          demo: profile.demoPatch ? { ...out.demo, ...profile.demoPatch } : out.demo,
        };
      } else {
        const used = new Set(globalSigs);
        out = diversifyLayoutRow(out, index + attempt, used);
      }
      // Nudge shell further: rotate docTitle text + charge header + field cols
      const blocks = (out.blocks || []).map((b) => ({ ...b }));
      const title = blocks.find((b) => b.type === 'docTitle');
      if (title) {
        title.text = `${title.text || 'REPORT'} · V${attempt + 1}`;
        title.align = ['center', 'start', 'end'][attempt % 3];
        title.band = attempt % 2 === 0;
      }
      const charge = blocks.find((b) => b.type === 'chargeTable');
      if (charge) {
        charge.headerColor = ['primary', 'accent', 'fill', 'orange', 'cyan'][attempt % 5];
      }
      const grid = blocks.find((b) => b.type === 'fieldGrid');
      if (grid) grid.cols = [1, 2, 3][attempt % 3];
      out = { ...out, blocks };
      shell = visualShell(out.blocks);
      sig = blockSignature(out.blocks);
      attempt += 1;
      changed += 1;
    }

    globalShells.add(shell);
    globalSigs.add(sig);
    return out;
  });

  fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    path.join(dataDir, jsonName.replace(/\.json$/, '.generated.ts')),
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Permanent JSON UI layouts — ${jsonName.replace('.json', '')}. */\n` +
      `export const ${exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        next,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );

  const shells = new Set(next.map((r) => visualShell(r.blocks)));
  summary.push({
    store: jsonName,
    count: next.length,
    uniqueShells: shells.size,
    changed,
    ok: shells.size === next.length,
  });
}

fs.writeFileSync(
  path.join(dataDir, 'FRESA_VISUAL_SHELL_FIX_SUMMARY.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), summary }, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify(summary, null, 2));
const bad = summary.filter((s) => !s.ok);
if (bad.length) {
  console.error('Still have visual shell collisions:', bad);
  process.exitCode = 1;
} else {
  console.log('All stores have unique visual shells (protected formats preserved).');
}

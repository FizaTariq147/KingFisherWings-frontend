/**
 * Rewrite every *FormatUiLayouts.json so each format has a unique block signature
 * (structural Fresa sample-report-formats parity). Regenerates .generated.ts.
 *
 * Usage: node scripts/diversify-all-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockSignature,
  diversifyLayoutRow,
} from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

/**
 * Dedicated Fresa builders own these stores — rebuild via build-*-format-ui-layouts.mjs.
 * Pass --all to force name-profile diversify on every store including invoices.
 * Default: diversify only stores without a rich Fresa builder, or when --profiles-only.
 */
const DEDICATED_BUILDER_STORES = new Set([
  'invoiceFormatUiLayouts.json',
  'arrivalNoticeFormatUiLayouts.json',
  'hawbFormatUiLayouts.json',
  'wmsFormatUiLayouts.json',
  'accountsFormatUiLayouts.json',
  'deliveryOrderFormatUiLayouts.json',
  'quotationFormatUiLayouts.json',
]);

const STORES = [
  { json: 'invoiceFormatUiLayouts.json', exportName: 'INVOICE_FORMAT_UI_LAYOUTS' },
  { json: 'accountsFormatUiLayouts.json', exportName: 'ACCOUNTS_FORMAT_UI_LAYOUTS' },
  { json: 'wmsFormatUiLayouts.json', exportName: 'WMS_FORMAT_UI_LAYOUTS' },
  { json: 'arrivalNoticeFormatUiLayouts.json', exportName: 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS' },
  { json: 'deliveryOrderFormatUiLayouts.json', exportName: 'DELIVERY_ORDER_FORMAT_UI_LAYOUTS' },
  { json: 'hawbFormatUiLayouts.json', exportName: 'HAWB_FORMAT_UI_LAYOUTS' },
  { json: 'hblFormatUiLayouts.json', exportName: 'HBL_FORMAT_UI_LAYOUTS' },
  { json: 'otherReportsFormatUiLayouts.json', exportName: 'OTHER_REPORTS_FORMAT_UI_LAYOUTS' },
  { json: 'quotationFormatUiLayouts.json', exportName: 'QUOTATION_FORMAT_UI_LAYOUTS' },
  { json: 'opsListFormatUiLayouts.json', exportName: 'OPS_LIST_FORMAT_UI_LAYOUTS' },
  { json: 'commercialExtraFormatUiLayouts.json', exportName: 'COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS' },
  { json: 'seaDocsExtraFormatUiLayouts.json', exportName: 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS' },
  { json: 'leftoverFormatUiLayouts.json', exportName: 'LEFTOVER_FORMAT_UI_LAYOUTS' },
];

const forceAll = process.argv.includes('--all');
const profilesOnDedicated = process.argv.includes('--reprofile-dedicated');

function exportConstFromJson(base) {
  // invoiceFormatUiLayouts.json → invoiceFormatUiLayouts.generated.ts
  return base.replace(/\.json$/, '.generated.ts');
}

const globalUsed = new Set();
const summary = [];

for (const store of STORES) {
  const jsonPath = path.join(dataDir, store.json);
  if (!fs.existsSync(jsonPath)) {
    summary.push({ store: store.json, skipped: true });
    continue;
  }
  // Never overwrite official invoice Fresa Format-1…21 mapping unless --all.
  if (store.json === 'invoiceFormatUiLayouts.json' && !forceAll) {
    summary.push({ store: store.json, skipped: true, reason: 'official-fresa-invoice' });
    continue;
  }
  // Keep other dedicated builder stores unless --reprofile-dedicated or --all.
  if (DEDICATED_BUILDER_STORES.has(store.json) && !forceAll && !profilesOnDedicated) {
    summary.push({ store: store.json, skipped: true, reason: 'dedicated-builder' });
    continue;
  }
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!Array.isArray(rows)) {
    summary.push({ store: store.json, error: 'not an array' });
    continue;
  }
  const used = new Set();
  const next = rows.map((row, i) => {
    const diversified = diversifyLayoutRow(row, i, used);
    const sig = blockSignature(diversified.blocks);
    globalUsed.add(sig);
    return diversified;
  });

  fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  const tsPath = path.join(dataDir, exportConstFromJson(store.json));
  fs.writeFileSync(
    tsPath,
    `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
      `/** Permanent JSON UI layouts — ${store.json.replace('.json', '')}. */\n` +
      `export const ${store.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
        next,
        null,
        2,
      )} as InvoiceFormatUiLayout[];\n`,
    'utf8',
  );

  const sigs = new Set(next.map((r) => blockSignature(r.blocks)));
  summary.push({
    store: store.json,
    count: next.length,
    uniqueSignatures: sigs.size,
    ok: sigs.size === next.length,
  });
}

console.log(JSON.stringify(summary, null, 2));
const bad = summary.filter((s) => s.ok === false);
if (bad.length) {
  console.error('Some stores still have duplicate block signatures:', bad);
  process.exitCode = 1;
} else {
  console.log('All layout stores diversified with unique signatures.');
}

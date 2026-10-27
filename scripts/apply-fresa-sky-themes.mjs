/**
 * Apply authentic Fresa sky-blue themes to every *FormatUiLayouts.json,
 * uniquify block signatures (headerColor / title / optionals), regenerate .ts.
 *
 * Usage: node scripts/apply-fresa-sky-themes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';
import {
  themeForFresaFormat,
  themeForOfficialInvoiceFormat,
} from './lib/fresaThemePalettes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

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

const HEADER_COLORS = ['primary', 'accent', 'cyan', 'fill', 'orange'];
const OPTIONALS = [
  { type: 'formatBadge' },
  { type: 'containerStrip' },
  { type: 'exportMetaStrip' },
  { type: 'wireBox' },
  { type: 'stampSignature' },
  { type: 'taxAmountBox' },
  { type: 'jobDescription' },
  { type: 'agingSummary' },
];

function uniquifyBlocks(blocks, seed, used) {
  let next = (blocks || []).map((b) => ({ ...b }));
  const charge = next.find((b) => b.type === 'chargeTable');
  if (charge) charge.headerColor = HEADER_COLORS[seed % HEADER_COLORS.length];

  const title = next.find((b) => b.type === 'docTitle');
  if (title) {
    title.align = seed % 3 === 0 ? 'start' : seed % 3 === 1 ? 'center' : 'end';
    title.band = seed % 2 === 0;
  }

  const grid = next.find((b) => b.type === 'fieldGrid');
  if (grid) grid.cols = [2, 3, 1, 2, 3][seed % 5];

  let sig = blockSignature(next);
  let attempt = 0;
  while (used.has(sig) && attempt < 48) {
    const footIdx = next.findIndex((b) => b.type === 'colorfulFooter');
    const at = footIdx >= 0 ? footIdx : next.length;
    const extra = { ...OPTIONALS[(seed + attempt) % OPTIONALS.length] };
    if (!next.some((b) => b.type === extra.type)) {
      next = [...next.slice(0, at), extra, ...next.slice(at)];
    } else if (charge) {
      charge.headerColor = HEADER_COLORS[(seed + attempt + 1) % HEADER_COLORS.length];
    }
    sig = blockSignature(next);
    attempt += 1;
  }
  used.add(sig);
  return next;
}

const summary = [];

for (const store of STORES) {
  const jsonPath = path.join(dataDir, store.json);
  if (!fs.existsSync(jsonPath)) {
    summary.push({ store: store.json, skipped: true });
    continue;
  }
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!Array.isArray(rows)) {
    summary.push({ store: store.json, error: 'not array' });
    continue;
  }

  const used = new Set();
  const isInvoiceStore = store.json === 'invoiceFormatUiLayouts.json';
  const next = rows.map((row, i) => {
    const n = Number(row.formatNumber) || i + 1;
    const seed = n * 17 + i * 3 + store.json.length;
    const isOfficialInvoice = isInvoiceStore && n >= 1 && n <= 21;
    const theme = isOfficialInvoice
      ? themeForOfficialInvoiceFormat(n)
      : themeForFresaFormat(row.name, row.code, seed);

    // Official Fresa Invoice Format-1…21: theme only — never rewrite blocks
    // (homogenizing chargeTable headers made Format-1≈4 and Format-6≈7).
    const blocks = isOfficialInvoice
      ? row.blocks
      : uniquifyBlocks(row.blocks, seed, used);

    if (isOfficialInvoice && Array.isArray(blocks)) {
      used.add(blockSignature(blocks));
    }

    return {
      ...row,
      theme,
      blocks,
      branding: {
        company: 'KingFisher Wings',
        address: 'Dubai, United Arab Emirates',
        web: 'www.kingfisherwingsgroup.com',
        phone: '+971 55 5355 286',
        email: 'inquiry@kingfishertec.com',
        logo: 'kingfisher',
      },
    };
  });

  try {
    fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    const tsPath = path.join(dataDir, store.json.replace(/\.json$/, '.generated.ts'));
    fs.writeFileSync(
      tsPath,
      `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
        `/** Permanent JSON UI layouts — Fresa sky-blue themes. */\n` +
        `export const ${store.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(
          next,
          null,
          2,
        )} as InvoiceFormatUiLayout[];\n`,
      'utf8',
    );
  } catch (err) {
    summary.push({ store: store.json, error: String(err?.message || err) });
    continue;
  }

  const themes = new Set(next.map((r) => JSON.stringify(r.theme)));
  const sigs = new Set(next.map((r) => blockSignature(r.blocks)));
  summary.push({
    store: store.json,
    count: next.length,
    uniqueThemes: themes.size,
    uniqueSignatures: sigs.size,
    ok: sigs.size === next.length,
  });
}

console.log(JSON.stringify(summary, null, 2));
const bad = summary.filter((s) => s.ok === false);
if (bad.length) {
  console.error('Duplicate signatures remain:', bad);
  process.exitCode = 1;
} else {
  console.log('All stores: unique block signatures + Fresa sky themes applied.');
}

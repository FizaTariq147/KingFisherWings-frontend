/**
 * Complete FRESA report catalog JSON for FE + BE handoff.
 *
 * - Asserts every registry code has a permanent FormatUiLayouts.json layout
 * - Writes fresaReportCatalogComplete.json (852 rows: meta + layoutStore + suggestedPackKey)
 * - Enriches fresaReportRegistry.json with layoutStore / suggestedPackKey / hasClientLayout
 * - Regenerates fresaReportRegistry.generated.ts + REPORT_GAP_MATRIX.md
 *
 * Does NOT modify ReportGeneratePanel, documentPdfPreserve, or live generate APIs.
 *
 * Usage: node scripts/build-complete-report-catalog-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const registryPath = path.join(dataDir, 'fresaReportRegistry.json');
const registryGenPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');
const completePath = path.join(dataDir, 'fresaReportCatalogComplete.json');
const matrixPath = path.join(dataDir, 'REPORT_GAP_MATRIX.md');

/** OpenAPI BindRendererDto allows: ops|sea|air|commercial|finance|wms|quotation */
function suggestPackKey(code, family) {
  const c = String(code || '').toUpperCase();
  const fam = String(family || '').toLowerCase();

  if (/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/i.test(c)) {
    return 'commercial.invoice_tax_india_1';
  }
  if (/^INVOICE_REPORT_FORMAT_|^LEFTOVER_INVOICE_|^LEFTOVER_TAX_|^LEFTOVER_SIMPLE_|^LEFTOVER_STANDARD_/i.test(c)) {
    return 'commercial.invoice_generic';
  }
  if (/PROFORMA_/i.test(c)) return 'commercial.proforma';
  if (/DEBIT_NOTE_/i.test(c)) return 'commercial.debit_note';
  if (/CREDIT_NOTE_/i.test(c)) return 'commercial.credit_note';

  if (/^HBL_|^FG_HBL_|LEFTOVER_HBL_/i.test(c)) return 'sea.hbl_draft';
  if (/ARRIVAL_NOTICE_|CARGO_ARRIVAL_/i.test(c)) {
    return fam === 'air_docs' || /^AIR_/i.test(c) ? 'air.arrival_notice' : 'sea.arrival_notice';
  }
  if (/DELIVERY_ORDER|DELIVERY_NOTE|PROOF_OF_DELIVERY/i.test(c)) {
    return fam === 'air_docs' || /^AIR_/i.test(c) ? 'air.delivery_order' : 'sea.delivery_order';
  }
  if (/CARGO_MANIFEST_/i.test(c)) {
    return fam === 'air_docs' ? 'air.cargo_manifest' : 'sea.cargo_manifest';
  }
  if (/BOOKING_CONFIRMATION_/i.test(c)) return 'sea.booking_confirmation';
  if (/PRE_ALERT_/i.test(c)) return fam === 'air_docs' ? 'air.pre_alert' : 'sea.pre_alert';

  if (/^HAWB_/i.test(c)) return 'air.hawb_draft';
  if (/^MAWB_/i.test(c)) return 'air.mawb_draft';

  if (/^QUOTATION_|AIR_QUOTATION_|FCL_QUOTATION_/i.test(c) || fam === 'quotation') {
    return 'quotation.shell';
  }

  if (/JOURNAL_VOUCHER_/i.test(c)) return 'finance.journal_voucher';
  if (/PAYMENT_VOUCHER_/i.test(c)) return 'finance.payment_voucher';
  if (/RECEIPT_VOUCHER_/i.test(c)) return 'finance.receipt_voucher';
  if (/OUTSTANDING_LETTER_/i.test(c)) return 'finance.outstanding_letter';
  if (/TRIAL_BALANCE|PROFIT_AND_LOSS|STATEMENT_OF_ACCOUNTS|AGING|GL_/i.test(c) || fam === 'finance') {
    return 'finance.gl_listing';
  }

  if (/ADVANCE_SHIPPING_NOTE/i.test(c)) return 'wms.asn';
  if (/WMS_GRN_/i.test(c)) return 'wms.grn';
  if (/WMS_GDO_/i.test(c)) return 'wms.gdo';
  if (fam === 'wms' || /^WMS_/i.test(c)) return 'wms.asn';

  if (
    fam === 'ops_list' ||
    /LIST_REPORT|DAILY_STATUS|PENDING_SHIPMENT|JOB_STATUS|JOB_NOT_CLOSED|DSR_/i.test(c)
  ) {
    return 'ops.list_generic';
  }

  if (fam === 'commercial') return 'commercial.invoice_generic';
  if (fam === 'sea_docs') return 'sea.hbl_draft';
  if (fam === 'air_docs') return 'air.hawb_draft';
  if (fam === 'other') return 'sea.booking_confirmation';
  return 'ops.list_generic';
}

const STORE_META = {
  invoiceFormatUiLayouts: 'invoice',
  accountsFormatUiLayouts: 'accounts',
  wmsFormatUiLayouts: 'wms',
  arrivalNoticeFormatUiLayouts: 'arrival',
  deliveryOrderFormatUiLayouts: 'delivery',
  hawbFormatUiLayouts: 'hawb',
  hblFormatUiLayouts: 'hbl',
  otherReportsFormatUiLayouts: 'other',
  quotationFormatUiLayouts: 'quotation',
  opsListFormatUiLayouts: 'ops_list',
  commercialExtraFormatUiLayouts: 'commercial',
  seaDocsExtraFormatUiLayouts: 'sea_air',
  leftoverFormatUiLayouts: 'leftover',
};

const layoutByCode = new Map();
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  const storeKey = f.replace(/\.json$/, '');
  const bucket = STORE_META[storeKey] || storeKey;
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    const code = String(row.code || '').toUpperCase();
    if (!code) continue;
    if (!layoutByCode.has(code)) {
      layoutByCode.set(code, {
        layoutStore: storeKey,
        layoutBucket: bucket,
        layoutName: row.name || code,
        paper: row.paper || 'A4',
        blockTypes: Array.isArray(row.blocks) ? row.blocks.map((b) => b.type) : [],
      });
    }
  }
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const missingLayouts = [];
const complete = [];
const enriched = [];

for (const t of registry) {
  const code = String(t.code || '').toUpperCase();
  const layout = layoutByCode.get(code);
  if (!layout) missingLayouts.push(code);

  const suggestedPackKey = suggestPackKey(code, t.family);
  const row = {
    ...t,
    code: t.code,
    hasClientLayout: Boolean(layout),
    layoutStore: layout?.layoutStore ?? null,
    layoutBucket: layout?.layoutBucket ?? null,
    suggestedPackKey,
  };
  enriched.push(row);

  complete.push({
    code: t.code,
    name: t.name,
    family: t.family,
    contexts: t.contexts,
    formats: t.formats,
    rolloutPhase: t.rolloutPhase,
    gapStatus: t.gapStatus,
    existingPath: t.existingPath ?? null,
    description: t.description ?? null,
    defaultParams: t.defaultParams ?? [],
    hasClientLayout: Boolean(layout),
    layoutStore: layout?.layoutStore ?? null,
    layoutBucket: layout?.layoutBucket ?? null,
    paper: layout?.paper ?? 'A4',
    blockTypes: layout?.blockTypes ?? [],
    suggestedPackKey,
    pendingRendererKey: `pending.${t.code}`,
  });
}

if (missingLayouts.length) {
  console.error('Missing layouts for', missingLayouts.length, 'codes');
  console.error(missingLayouts.slice(0, 40).join('\n'));
  process.exit(1);
}

enriched.sort((a, b) =>
  String(a.code).localeCompare(String(b.code), undefined, { numeric: true, sensitivity: 'base' }),
);
complete.sort((a, b) =>
  String(a.code).localeCompare(String(b.code), undefined, { numeric: true, sensitivity: 'base' }),
);

fs.writeFileSync(registryPath, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  registryGenPath,
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n` +
    `/** Auto-generated — run scripts/build-complete-report-catalog-json.mjs */\n` +
    `export const FRESA_REPORT_REGISTRY = ${JSON.stringify(enriched, null, 2)} as ReportTemplateMeta[];\n`,
  'utf8',
);

const byFamily = {};
const byStore = {};
const byPack = {};
const byStatus = {};
for (const row of complete) {
  byFamily[row.family] = (byFamily[row.family] || 0) + 1;
  byStore[row.layoutStore] = (byStore[row.layoutStore] || 0) + 1;
  byPack[row.suggestedPackKey] = (byPack[row.suggestedPackKey] || 0) + 1;
  byStatus[row.gapStatus] = (byStatus[row.gapStatus] || 0) + 1;
}

const completeDoc = {
  generatedAt: new Date().toISOString(),
  source: 'fresaReportRegistry.json + *FormatUiLayouts.json',
  apiContract: 'BACKEND_REPORT_CATALOG_API.md / OpenAPI Reports — Catalog',
  preserve: [
    'POST /invoices/:id/pdf',
    'POST /quotations/:id/pdf',
    'POST /reports/generate (when pack bound + active)',
    'ReportGeneratePanel live generate path',
  ],
  totals: {
    reports: complete.length,
    withClientLayout: complete.filter((r) => r.hasClientLayout).length,
    layoutStores: Object.keys(byStore).length,
    suggestedPackKeys: Object.keys(byPack).length,
  },
  byFamily,
  byStatus,
  byLayoutStore: byStore,
  bySuggestedPackKey: byPack,
  reports: complete,
};

fs.writeFileSync(completePath, `${JSON.stringify(completeDoc, null, 2)}\n`, 'utf8');

const familyTable = Object.entries(byFamily)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([f, n]) => `| ${f} | ${n} |`)
  .join('\n');

fs.writeFileSync(
  matrixPath,
  `# FRESA report catalog — gap matrix

Generated from \`fresaReportRegistry.json\` + permanent JSON layouts.
Master index: \`fresaReportCatalogComplete.json\` (${complete.length} reports).

## Architecture preserve rules

- Quotation / invoice **document PDFs** (\`pdf-lib\` + existing \`POST .../pdf\`) stay the default.
- Module analytics screens stay primary for KPIs (\`covered_analytics\`).
- Catalog generate is **additive** via \`/reports/*\` + client layout PDF fallback.
- Do not change \`ReportGeneratePanel\` live generate / bind / activate behaviour.

## Family counts

| Family | Count |
|--------|------:|
${familyTable}
| **Total** | **${complete.length}** |

Gap status: ${Object.entries(byStatus)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ')}.

Client layout PDF: **${complete.length}/${complete.length}** codes have matchable JSON UI layouts (\`*FormatUiLayouts.json\`).

## FE document coverage

\`covered_document_pdf\` means a permanent client JSON layout PDF is available via catalogue Generate.
Default \`POST /invoices|quotations/:id/pdf\` paths stay preserved.

Full store (787 rows + embedded layouts, additive): \`fresaCoveredDocumentReports.json\`.
Runtime layouts remain the 13 \`*FormatUiLayouts.json\` files (**852/852** — do not remove).

## Optional backend (additive)

Live FRESA Puppeteer packs remain optional for print parity. Bind/activate via \`GET /reports/templates/renderers\` + \`suggestedPackKey\` in the complete catalog JSON — do not invent \`renderer_key\` values on the FE.
`,
  'utf8',
);

console.log(
  JSON.stringify(
    {
      reports: complete.length,
      layouts: layoutByCode.size,
      completeJson: path.relative(root, completePath),
      packs: Object.keys(byPack).length,
      byStatus,
    },
    null,
    2,
  ),
);

// Additive: store 787 covered_document_pdf rows with full layouts (does not touch *FormatUiLayouts.json).
await import('./store-covered-document-reports.mjs');

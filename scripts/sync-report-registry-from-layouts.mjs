/**
 * Sync FRESA report registry with all permanent JSON layout stores.
 * - Adds layout codes missing from the registry (importable).
 * - Upgrades net_new → partial_document_pdf when a FE layout exists (client PDF ready).
 * - Never downgrades covered_* or partial_analytics.
 *
 * Usage: node scripts/sync-report-registry-from-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const jsonPath = path.join(dataDir, 'fresaReportRegistry.json');
const tsPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');
const matrixPath = path.join(dataDir, 'REPORT_GAP_MATRIX.md');

const STORE_FAMILY = {
  invoiceFormatUiLayouts: { family: 'commercial', contexts: ['invoice'], phase: 4 },
  accountsFormatUiLayouts: { family: 'finance', contexts: ['gl'], phase: 5 },
  wmsFormatUiLayouts: { family: 'wms', contexts: ['wms'], phase: 6 },
  arrivalNoticeFormatUiLayouts: { family: 'sea_docs', contexts: ['job'], phase: 2 },
  deliveryOrderFormatUiLayouts: { family: 'sea_docs', contexts: ['job'], phase: 2 },
  hawbFormatUiLayouts: { family: 'air_docs', contexts: ['job'], phase: 3 },
  hblFormatUiLayouts: { family: 'sea_docs', contexts: ['job'], phase: 2 },
  otherReportsFormatUiLayouts: { family: 'other', contexts: ['job'], phase: 2 },
  quotationFormatUiLayouts: { family: 'quotation', contexts: ['quotation'], phase: 3 },
  opsListFormatUiLayouts: { family: 'ops_list', contexts: ['list', 'job'], phase: 1 },
  commercialExtraFormatUiLayouts: { family: 'commercial', contexts: ['invoice'], phase: 4 },
  seaDocsExtraFormatUiLayouts: { family: 'sea_docs', contexts: ['job'], phase: 2 },
  leftoverFormatUiLayouts: { family: 'commercial', contexts: ['invoice'], phase: 4 },
};

function inferFamily(code, storeMeta) {
  const c = code.toUpperCase();
  if (/^QUOTATION_|^AIR_QUOTATION_|^FCL_QUOTATION_/.test(c)) {
    return { family: 'quotation', contexts: ['quotation'], phase: 3 };
  }
  if (/^HAWB_|^MAWB_|^AIR_/.test(c)) {
    return { family: 'air_docs', contexts: ['job'], phase: 3 };
  }
  if (/^HBL_|^ARRIVAL_|^CARGO_MANIFEST_|^DELIVERY_ORDER_|^FG_HBL_/.test(c)) {
    return { family: 'sea_docs', contexts: ['job'], phase: 2 };
  }
  if (/LIST_REPORT|DAILY_STATUS|PENDING_SHIPMENT|JOB_STATUS|JOB_NOT_CLOSED/.test(c)) {
    return { family: 'ops_list', contexts: ['list', 'job'], phase: 1 };
  }
  if (/^WMS_|^ADVANCE_SHIPPING/.test(c)) {
    return { family: 'wms', contexts: ['wms'], phase: 6 };
  }
  if (
    /TRIAL_BALANCE|PROFIT_AND_LOSS|STATEMENT_OF_ACCOUNTS|AGING|JOURNAL_VOUCHER|PAYMENT_VOUCHER|RECEIPT_VOUCHER|GL_/.test(
      c,
    )
  ) {
    return { family: 'finance', contexts: ['gl'], phase: 5 };
  }
  if (/^BOOKING_CONFIRMATION_|^PRE_ALERT_/.test(c)) {
    return { family: 'other', contexts: ['job'], phase: 2 };
  }
  if (/INVOICE|PROFORMA|DEBIT_NOTE|CREDIT_NOTE/.test(c)) {
    return { family: 'commercial', contexts: ['invoice'], phase: 4 };
  }
  return storeMeta;
}

const registry = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const byCode = new Map(registry.map((r) => [String(r.code).toUpperCase(), { ...r }]));

const layoutEntries = [];
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  const key = f.replace(/\.json$/, '');
  const storeMeta = STORE_FAMILY[key] || {
    family: 'other',
    contexts: ['job'],
    phase: 2,
  };
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    const code = String(row.code || '').toUpperCase();
    if (!code) continue;
    layoutEntries.push({
      code,
      name: row.name || code,
      ...inferFamily(code, storeMeta),
    });
  }
}

let added = 0;
let upgraded = 0;

for (const layout of layoutEntries) {
  const existing = byCode.get(layout.code);
  if (!existing) {
    byCode.set(layout.code, {
      code: layout.code,
      name: layout.name,
      family: layout.family,
      contexts: layout.contexts,
      formats: ['PDF'],
      rolloutPhase: layout.phase,
      gapStatus: 'partial_document_pdf',
      description: `KingFisher layout PDF: ${layout.name}`,
    });
    added += 1;
    continue;
  }

  // FE layout PDF is ready — upgrade net_new only (do not touch analytics/covered).
  if (existing.gapStatus === 'net_new') {
    existing.gapStatus = 'partial_document_pdf';
    existing.description =
      existing.description || `KingFisher layout PDF ready: ${existing.name}`;
    upgraded += 1;
  }
  // Never downgrade covered_* statuses when re-syncing layouts.
}

const unique = [...byCode.values()].sort((a, b) =>
  a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }),
);

fs.writeFileSync(jsonPath, JSON.stringify(unique, null, 2));
fs.writeFileSync(
  tsPath,
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n/** Auto-generated — run scripts/sync-report-registry-from-layouts.mjs (or generate-fresa-report-registry.mjs) */\nexport const FRESA_REPORT_REGISTRY = ${JSON.stringify(unique, null, 2)} as ReportTemplateMeta[];\n`,
);

const byStatus = {};
const byFamily = {};
for (const t of unique) {
  byStatus[t.gapStatus] = (byStatus[t.gapStatus] || 0) + 1;
  byFamily[t.family] = (byFamily[t.family] || 0) + 1;
}

const matrix = `# FRESA report catalog — gap matrix (Phase 0)

Generated from the local registry in \`src/features/reports/data/fresaReportRegistry.json\`.
Synced with permanent JSON layouts via \`scripts/sync-report-registry-from-layouts.mjs\`.

## Architecture preserve rules

- Quotation / invoice / statement **document PDFs** (\`pdf-lib\` + existing \`POST .../pdf\`) stay the default.
- Module analytics report pages under \`/quotations/reports\`, \`/gl/*\`, etc. stay primary for KPIs.
- Catalog generate is **additive** via \`/reports/*\` APIs.
- Client layout PDF in catalogue Generate is preview/fallback only until a Puppeteer pack is bound.

## Family counts

| Family | Count |
|--------|------:|
${Object.entries(byFamily)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([f, n]) => `| ${f} | ${n} |`)
  .join('\n')}
| **Total** | **${unique.length}** |

Gap status: ${Object.entries(byStatus)
  .map(([k, v]) => `${k} ${v}`)
  .join(' · ')}.

Layout sync: +${added} new registry rows · ${upgraded} net_new upgraded to partial_document_pdf.

See catalog UI **Gap matrix** toggle, or regenerate via \`node scripts/generate-fresa-report-registry.mjs\` then re-run this sync.

## Backend API contract

See plan: \`GET /reports/templates\`, \`GET /reports/templates/:id\`, \`POST /reports/generate\`, \`GET /reports/jobs/:id\`, download.
`;

fs.writeFileSync(matrixPath, matrix);

console.log(
  JSON.stringify(
    {
      total: unique.length,
      added,
      upgraded,
      byStatus,
      byFamily,
    },
    null,
    2,
  ),
);

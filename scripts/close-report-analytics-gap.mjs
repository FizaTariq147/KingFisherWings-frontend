/**
 * Close remaining partial_analytics gap in the local FRESA registry.
 * - Sets existingPath to the live module analytics screen
 * - Upgrades gapStatus → covered_analytics (module screen is primary; catalogue layout PDF remains additive)
 *
 * Does NOT touch covered_document_pdf / live Puppeteer packs.
 * Does NOT change invoice/quotation default PDF paths.
 *
 * Usage: node scripts/close-report-analytics-gap.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const jsonPath = path.join(dataDir, 'fresaReportRegistry.json');
const tsPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');
const matrixPath = path.join(dataDir, 'REPORT_GAP_MATRIX.md');

/** Resolve analytics hub for a template code. */
function analyticsPathFor(code) {
  const c = String(code).toUpperCase();
  if (/^AP_AGING|^AP_OUTSTANDING/.test(c)) return '/gl/ap/aging';
  if (/^AR_AGING|^AR_JOB_NOT_INVOICE/.test(c)) return '/gl/ar/aging';
  if (/OUTSTANDING_LETTER/.test(c)) return '/gl/ar/aging';
  if (/PROFIT_AND_LOSS/.test(c)) return '/gl/reports';
  if (/TRIAL_BALANCE/.test(c)) return '/gl/accounts/trial-balance';
  if (/STATEMENT_OF_ACCOUNTS/.test(c)) return '/gl/ar/open-items';
  if (/CREATED_QUOTATIONS/.test(c)) return '/quotations/reports';
  if (/WMS_STOCK/.test(c)) return '/warehouse/stock';
  return null;
}

const registry = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let upgraded = 0;
let pathsSet = 0;

for (const row of registry) {
  if (row.gapStatus !== 'partial_analytics') continue;
  const hub = analyticsPathFor(row.code);
  if (hub) {
    if (row.existingPath !== hub) {
      row.existingPath = hub;
      pathsSet += 1;
    }
  } else if (!row.existingPath) {
    // Family fallbacks
    if (row.family === 'finance') row.existingPath = '/gl/reports';
    else if (row.family === 'wms') row.existingPath = '/warehouse/stock';
    else if (row.family === 'ops_list') row.existingPath = '/quotations/reports';
    pathsSet += 1;
  }
  row.gapStatus = 'covered_analytics';
  row.description =
    row.description ||
    `Module analytics at ${row.existingPath}; catalogue layout PDF is additive.`;
  upgraded += 1;
}

registry.sort((a, b) =>
  a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }),
);

fs.writeFileSync(jsonPath, JSON.stringify(registry, null, 2));
fs.writeFileSync(
  tsPath,
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n/** Auto-generated — run scripts/sync-report-registry-from-layouts.mjs / close-report-analytics-gap.mjs */\nexport const FRESA_REPORT_REGISTRY = ${JSON.stringify(registry, null, 2)} as ReportTemplateMeta[];\n`,
);

const byStatus = {};
const byFamily = {};
for (const t of registry) {
  byStatus[t.gapStatus] = (byStatus[t.gapStatus] || 0) + 1;
  byFamily[t.family] = (byFamily[t.family] || 0) + 1;
}

const matrix = `# FRESA report catalog — gap matrix (Phase 0)

Generated from the local registry in \`src/features/reports/data/fresaReportRegistry.json\`.

## Architecture preserve rules

- Quotation / invoice / statement **document PDFs** (\`pdf-lib\` + existing \`POST .../pdf\`) stay the default.
- Module analytics report pages under \`/quotations/reports\`, \`/gl/*\`, \`/warehouse/stock\` stay primary for KPIs.
- Catalog generate is **additive** via \`/reports/*\` APIs + client layout PDF fallback.
- \`covered_analytics\` = module screen is the live implementation; catalogue still offers layout preview PDF.

## Family counts

| Family | Count |
|--------|------:|
${Object.entries(byFamily)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([f, n]) => `| ${f} | ${n} |`)
  .join('\n')}
| **Total** | **${registry.length}** |

Gap status: ${Object.entries(byStatus)
  .map(([k, v]) => `${k} ${v}`)
  .join(' · ')}.

Analytics gap close: ${upgraded} → covered_analytics · ${pathsSet} existingPath updates.

## Backend remaining

Live FRESA Puppeteer packs (\`partial_document_pdf\` → \`covered_document_pdf\`) still require backend pack bind/activate.
`;

fs.writeFileSync(matrixPath, matrix);

console.log(
  JSON.stringify({ total: registry.length, upgraded, pathsSet, byStatus, byFamily }, null, 2),
);

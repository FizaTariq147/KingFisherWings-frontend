/**
 * Store all covered_document_pdf reports (787) with full client JSON layouts.
 *
 * Additive only:
 * - Writes fresaCoveredDocumentReports.json (+ .generated.ts index)
 * - Does NOT modify *FormatUiLayouts.json (852/852 runtime layouts stay as-is)
 * - Does NOT change gapStatus or the 852 registry row count
 *
 * Usage: node scripts/store-covered-document-reports.mjs
 * Also invoked from scripts/build-complete-report-catalog-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const registryPath = path.join(dataDir, 'fresaReportRegistry.json');
const storePath = path.join(dataDir, 'fresaCoveredDocumentReports.json');
const storeTsPath = path.join(dataDir, 'fresaCoveredDocumentReports.generated.ts');

const layoutByCode = new Map();
const storeFiles = fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'));
for (const f of storeFiles) {
  const storeKey = f.replace(/\.json$/, '');
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    const code = String(row.code || '').toUpperCase();
    if (!code || layoutByCode.has(code)) continue;
    layoutByCode.set(code, { storeKey, layout: row });
  }
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (registry.length !== 852) {
  console.error(`Expected 852 registry rows, found ${registry.length}`);
  process.exit(1);
}
if (layoutByCode.size !== 852) {
  console.error(`Expected 852 layout codes, found ${layoutByCode.size}`);
  process.exit(1);
}

const missingLayout = [];
const covered = [];
const byFamily = {};
const byLayoutStore = {};

for (const row of registry) {
  if (row.gapStatus !== 'covered_document_pdf') continue;
  const code = String(row.code || '').toUpperCase();
  const hit = layoutByCode.get(code);
  if (!hit) {
    missingLayout.push(row.code);
    continue;
  }
  const layoutStore = row.layoutStore || hit.storeKey;
  byFamily[row.family] = (byFamily[row.family] || 0) + 1;
  byLayoutStore[layoutStore] = (byLayoutStore[layoutStore] || 0) + 1;
  covered.push({
    code: row.code,
    name: row.name,
    family: row.family,
    contexts: row.contexts,
    formats: row.formats,
    rolloutPhase: row.rolloutPhase,
    gapStatus: row.gapStatus,
    description: row.description ?? null,
    existingPath: row.existingPath ?? null,
    defaultParams: row.defaultParams ?? [],
    hasClientLayout: true,
    layoutStore,
    layoutBucket: row.layoutBucket ?? null,
    suggestedPackKey: row.suggestedPackKey ?? null,
    /** Full permanent JSON UI layout (same object as *FormatUiLayouts.json). */
    layout: hit.layout,
  });
}

if (missingLayout.length) {
  console.error('covered_document_pdf missing layouts:', missingLayout.length);
  console.error(missingLayout.slice(0, 40).join('\n'));
  process.exit(1);
}

if (covered.length !== 787) {
  console.error(`Expected 787 covered_document_pdf rows, found ${covered.length}`);
  process.exit(1);
}

covered.sort((a, b) =>
  String(a.code).localeCompare(String(b.code), undefined, { numeric: true, sensitivity: 'base' }),
);

const doc = {
  generatedAt: new Date().toISOString(),
  purpose:
    'Permanent store of all covered_document_pdf catalogue reports with full client JSON layouts.',
  preserve: {
    registryTotal: 852,
    layoutStoresUntouched: storeFiles.slice().sort(),
    note: 'Runtime catalogue still uses the 13 *FormatUiLayouts.json files (852/852). This file is additive.',
  },
  totals: {
    coveredDocumentPdf: covered.length,
    registryTotal: registry.length,
    layoutCodes: layoutByCode.size,
    coveredAnalytics: registry.filter((r) => r.gapStatus === 'covered_analytics').length,
  },
  byFamily,
  byLayoutStore,
  reports: covered,
};

fs.writeFileSync(storePath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');

const indexRows = covered.map((r) => ({
  code: r.code,
  name: r.name,
  family: r.family,
  layoutStore: r.layoutStore,
  suggestedPackKey: r.suggestedPackKey,
}));
fs.writeFileSync(
  storeTsPath,
  `/** Auto-generated — run scripts/store-covered-document-reports.mjs */\n` +
    `export const FRESA_COVERED_DOCUMENT_REPORT_COUNT = ${covered.length} as const;\n` +
    `export const FRESA_COVERED_DOCUMENT_REPORT_INDEX = ${JSON.stringify(indexRows, null, 2)} as const;\n`,
  'utf8',
);

console.log(
  JSON.stringify(
    {
      coveredDocumentPdf: covered.length,
      registryTotal: registry.length,
      layoutCodes: layoutByCode.size,
      store: path.relative(root, storePath),
      index: path.relative(root, storeTsPath),
      byFamily,
    },
    null,
    2,
  ),
);

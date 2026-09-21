/**
 * Close remaining partial_document_pdf gap in the local FRESA registry.
 * - Asserts every partial row has a permanent *FormatUiLayouts.json layout
 * - Upgrades gapStatus → covered_document_pdf (client layout PDF is FE coverage)
 * - Keeps suggestedPackKey / layoutStore so BE Puppeteer bind/activate stays additive
 *
 * Does NOT invent renderer_key values or change invoice/quotation default PDF paths.
 * Does NOT modify ReportGeneratePanel live generate / bind / activate behaviour.
 *
 * Usage: node scripts/close-report-document-pdf-gap.mjs
 * Then:  node scripts/build-complete-report-catalog-json.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const jsonPath = path.join(dataDir, 'fresaReportRegistry.json');
const tsPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');

const layoutByCode = new Map();
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  const storeKey = f.replace(/\.json$/, '');
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    const code = String(row.code || '').toUpperCase();
    if (!code || layoutByCode.has(code)) continue;
    layoutByCode.set(code, storeKey);
  }
}

const registry = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const missingLayouts = [];
let upgraded = 0;

for (const row of registry) {
  const code = String(row.code || '').toUpperCase();
  const layoutStore = layoutByCode.get(code) ?? row.layoutStore ?? null;
  const hasLayout = Boolean(layoutStore);

  if (!hasLayout) {
    missingLayouts.push(row.code);
    continue;
  }

  row.hasClientLayout = true;
  if (!row.layoutStore) row.layoutStore = layoutStore;

  if (row.gapStatus === 'partial_document_pdf') {
    row.gapStatus = 'covered_document_pdf';
    const base =
      typeof row.description === 'string' && row.description.trim()
        ? row.description.trim()
        : `FRESA sample: ${row.name}`;
    if (!/client layout PDF/i.test(base)) {
      row.description = `${base} Client layout PDF is FE coverage; default invoice/quotation PDFs stay preserved. Optional BE Puppeteer pack remains additive.`;
    }
    upgraded += 1;
  }
}

if (missingLayouts.length) {
  console.error('Missing layouts for', missingLayouts.length, 'codes');
  console.error(missingLayouts.slice(0, 40).join('\n'));
  process.exit(1);
}

const remainingPartial = registry.filter((r) => r.gapStatus === 'partial_document_pdf');
if (remainingPartial.length) {
  console.error('Still partial_document_pdf:', remainingPartial.length);
  console.error(remainingPartial.slice(0, 20).map((r) => r.code).join('\n'));
  process.exit(1);
}

registry.sort((a, b) =>
  String(a.code).localeCompare(String(b.code), undefined, { numeric: true, sensitivity: 'base' }),
);

fs.writeFileSync(jsonPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  tsPath,
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n` +
    `/** Auto-generated — run scripts/close-report-document-pdf-gap.mjs / build-complete-report-catalog-json.mjs */\n` +
    `export const FRESA_REPORT_REGISTRY = ${JSON.stringify(registry, null, 2)} as ReportTemplateMeta[];\n`,
  'utf8',
);

const byStatus = {};
for (const t of registry) {
  byStatus[t.gapStatus] = (byStatus[t.gapStatus] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      total: registry.length,
      upgraded,
      layouts: layoutByCode.size,
      byStatus,
      partial_document_pdf: byStatus.partial_document_pdf || 0,
      covered_document_pdf: byStatus.covered_document_pdf || 0,
    },
    null,
    2,
  ),
);

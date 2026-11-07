/**
 * Merge codes from fresaReportCatalogComplete.json into fresaReportRegistry
 * so FE taxonomy matches the 852-format complete index.
 *
 * Usage: node scripts/sync-registry-from-complete-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const jsonPath = path.join(dataDir, 'fresaReportRegistry.json');
const tsPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');
const completePath = path.join(dataDir, 'fresaReportCatalogComplete.json');

const registry = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const complete = JSON.parse(fs.readFileSync(completePath, 'utf8'));
const rCodes = new Set(registry.map((t) => t.code));
const missing = (complete.reports || []).filter((t) => !rCodes.has(t.code));

function toMeta(r) {
  return {
    code: r.code,
    name: r.name,
    family: r.family,
    contexts: r.contexts || ['job'],
    formats: r.formats || ['PDF'],
    rolloutPhase: r.rolloutPhase ?? 3,
    gapStatus: r.gapStatus || 'covered_document_pdf',
    description: r.description || `FRESA sample: ${r.name}`,
    defaultParams: r.defaultParams || [],
    hasClientLayout: Boolean(r.hasClientLayout),
    layoutStore: r.layoutStore || null,
    layoutBucket: r.layoutBucket || null,
    ...(r.suggestedPackKey ? { suggestedPackKey: r.suggestedPackKey } : {}),
    ...(r.existingPath ? { existingPath: r.existingPath } : {}),
  };
}

const merged = [...registry, ...missing.map(toMeta)].sort((a, b) =>
  a.code.localeCompare(b.code),
);

fs.writeFileSync(jsonPath, `${JSON.stringify(merged, null, 2)}\n`);
const ts = `import type { ReportTemplateMeta } from '../types/reportCatalog.types';

/** Auto-generated registry — synced from fresaReportCatalogComplete (${merged.length}). */
export const FRESA_REPORT_REGISTRY: ReportTemplateMeta[] = ${JSON.stringify(
  merged,
  null,
  2,
)} as ReportTemplateMeta[];
`;
fs.writeFileSync(tsPath, ts);
console.log(
  `Synced registry: ${registry.length} → ${merged.length} (+${missing.length} from complete catalog)`,
);

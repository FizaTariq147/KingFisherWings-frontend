/**
 * Phase 1 Step 1 — refresh derived audit metadata under reports/qa/universal/
 * Does NOT overwrite reports/references/layout-counts.json or fresa-system-format-map.csv.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprintPdf } from '../build-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const outDir = path.join(root, 'reports/qa/universal');
const fileDir = path.join(root, 'reports/references/files');

fs.mkdirSync(outDir, { recursive: true });

const diskPdfs = fs
  .readdirSync(fileDir)
  .filter((n) => n.toLowerCase().endsWith('.pdf'))
  .sort();

const strict = new Map();
const detail = new Map();
const failures = [];
for (const name of diskPdfs) {
  try {
    const print = await fingerprintPdf(path.join(fileDir, name));
    if (!strict.has(print.strict)) strict.set(print.strict, []);
    strict.get(print.strict).push(name);
    if (!detail.has(print.detailNormalized)) detail.set(print.detailNormalized, []);
    detail.get(print.detailNormalized).push(name);
  } catch (e) {
    failures.push({ name, error: e instanceof Error ? e.message : String(e) });
  }
}

const staleLayoutCountsPath = path.join(root, 'reports/references/layout-counts.json');
const staleLayoutCounts = fs.existsSync(staleLayoutCountsPath)
  ? JSON.parse(fs.readFileSync(staleLayoutCountsPath, 'utf8'))
  : null;

const layoutsCsvPath = path.join(root, 'reports/references/layouts.csv');
const layoutsCsvRows = fs.existsSync(layoutsCsvPath)
  ? Math.max(0, fs.readFileSync(layoutsCsvPath, 'utf8').split(/\r?\n/).filter(Boolean).length - 1)
  : null;

const refreshed = {
  generatedAt: new Date().toISOString(),
  method: 'fingerprintPdf from tools/reports/build-manifest.mjs over reports/references/files/*.pdf',
  sourceFiles: {
    pinDirectory: 'reports/references/files',
    fingerprintImplementation: 'tools/reports/build-manifest.mjs#fingerprintPdf',
    generatorScript: 'tools/reports/pilot/refresh-universal-metadata.mjs',
    staleProductionArtifactNotModified: 'reports/references/layout-counts.json',
    layoutsCsvNotModified: 'reports/references/layouts.csv',
    formatMapNotModified: 'reports/references/fresa-system-format-map.csv',
  },
  live: {
    pdfs: diskPdfs.length,
    strictLayouts: strict.size,
    detailNormalizedLayouts: detail.size,
    multiMemberStrictClusters: [...strict.values()].filter((f) => f.length > 1).length,
    fingerprintFailures: failures,
  },
  layoutsCsvRowCount: layoutsCsvRows,
  staleLayoutCountsJson: staleLayoutCounts,
  reconciliation: {
    liveMatchesLayoutsCsv: layoutsCsvRows === strict.size,
    staleJsonDrift:
      staleLayoutCounts &&
      (staleLayoutCounts.pdfs !== diskPdfs.length ||
        staleLayoutCounts.strictLayouts !== strict.size),
    note: 'Authoritative live counts are under reports/qa/universal/LAYOUT_COUNTS_REFRESHED.json. Production layout-counts.json left unchanged (stale 402/376).',
  },
  officialHawbRuntimePaths: {
    note: 'Verified runtime — format-map may still say json_shell_fallback (stale).',
    codes: {
      HAWB_DRAFT_REPORT_FORMAT: {
        entry: 'generateHawbOfficialPdf',
        renderer: 'generateOfficialMeasuredPdf',
        verified: true,
      },
      HAWB_DRAFT_REPORT_FORMAT_1: {
        entry: 'generateHawbOfficialPdf',
        renderer: 'generateOfficialMeasuredPdf',
        verified: true,
      },
      HAWB_DRAFT_REPORT_FORMAT_2: {
        entry: 'generateHawbOfficialPdf → optional Playwright then generateOfficialMeasuredPdf',
        renderer: 'generateOfficialMeasuredPdf',
        verified: true,
      },
      HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1: {
        entry: 'generateHawbOfficialPdf',
        renderer: 'generateHawbSparsePdf',
        verified: true,
      },
      HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2: {
        entry: 'generateHawbOfficialPdf',
        renderer: 'generateHawbSparsePdf',
        verified: true,
      },
    },
    staleFormatMapClaim: 'json_shell_fallback / measured_face=no for all five — do not trust for routing',
  },
};

fs.writeFileSync(
  path.join(outDir, 'LAYOUT_COUNTS_REFRESHED.json'),
  JSON.stringify(refreshed, null, 2),
);

const hawbMapNote = {
  generatedAt: refreshed.generatedAt,
  productionFormatMapUntouched: 'reports/references/fresa-system-format-map.csv',
  method: 'Manual verified runtime table (not regenerated production map)',
  verifiedRuntime: refreshed.officialHawbRuntimePaths.codes,
  staleMappingWarning:
    'Production format-map still labels official HAWB five as json_shell_fallback. Use this file + HAWB_IMPLEMENTATION_TRACE.md for verified paths.',
};

fs.writeFileSync(
  path.join(outDir, 'HAWB_FORMAT_MAP_VERIFIED.json'),
  JSON.stringify(hawbMapNote, null, 2),
);

console.log(
  JSON.stringify(
    {
      wrote: [
        'reports/qa/universal/LAYOUT_COUNTS_REFRESHED.json',
        'reports/qa/universal/HAWB_FORMAT_MAP_VERIFIED.json',
      ],
      live: refreshed.live,
      staleDrift: refreshed.reconciliation.staleJsonDrift,
    },
    null,
    2,
  ),
);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'tmp/fresa-references');
const before = JSON.parse(
  fs.readFileSync(path.join(outRoot, 'PHASE3_VISUAL_RESULTS.before-3.1.json'), 'utf8'),
);
const after = JSON.parse(fs.readFileSync(path.join(outRoot, 'PHASE3_VISUAL_RESULTS.json'), 'utf8'));
const by = Object.fromEntries(before.reports.map((r) => [r.formatCode, r]));

const rows = after.reports.map((a) => {
  const b = by[a.formatCode] || {};
  const bSim = b.metrics?.meanSimilarity;
  const aSim = a.metrics?.meanSimilarity;
  const bref = b.metrics?.pages?.[0];
  const aref = a.metrics?.pages?.[0];
  return {
    code: a.formatCode,
    simBefore: bSim != null ? +(bSim * 100).toFixed(2) : null,
    simAfter: aSim != null ? +(aSim * 100).toFixed(2) : null,
    delta: bSim != null && aSim != null ? +((aSim - bSim) * 100).toFixed(2) : null,
    pagesBefore: `${b.referencePageCount}/${b.freightnestPageCount}`,
    pagesAfter: `${a.referencePageCount}/${a.freightnestPageCount}`,
    withTerms: a.freightnestPageCountProductDefault ?? a.freightnestPageCountWithTerms ?? null,
    refOrient: a.referencePageMeta?.[0]?.displayOrientation,
    fnOrient: a.freightnestPageMeta?.[0]?.displayOrientation,
    refDisplay: a.referencePageMeta?.[0]?.displaySize,
    fnMedia: a.freightnestPageMeta?.[0]?.mediaBox,
    rasterBefore: bref
      ? `${bref.referenceSize.width}x${bref.referenceSize.height} vs ${bref.freightnestSize.width}x${bref.freightnestSize.height}`
      : null,
    rasterAfter: aref
      ? `${aref.referenceSize.width}x${aref.referenceSize.height} vs ${aref.freightnestSize.width}x${aref.freightnestSize.height}`
      : null,
  };
});

rows.sort((x, y) => (y.delta ?? -999) - (x.delta ?? -999));

const summary = {
  generatedAt: new Date().toISOString(),
  improved: rows.filter((r) => r.delta > 0).length,
  worsened: rows.filter((r) => r.delta < 0).length,
  unchanged: rows.filter((r) => r.delta === 0).length,
  orientationFixed: rows
    .filter((r) => r.code.includes('AP_AGING') || r.code.includes('GL_LISTING'))
    .map((r) => ({
      code: r.code,
      refOrient: r.refOrient,
      fnOrient: r.fnOrient,
      delta: r.delta,
      rasterAfter: r.rasterAfter,
    })),
  rows,
};

fs.writeFileSync(path.join(outRoot, 'PHASE3_1_BEFORE_AFTER.json'), JSON.stringify(summary, null, 2));

const md = [
  '# Phase 3.1 — Before / After (18-report pilot)',
  '',
  'Baseline: `PHASE3_VISUAL_RESULTS.before-3.1.json`',
  'After shared fixes: `PHASE3_VISUAL_RESULTS.json`',
  '',
  '| Metric | Value |',
  '|--------|------:|',
  `| Similarity improved | ${summary.improved} |`,
  `| Similarity worsened | ${summary.worsened} |`,
  `| Unchanged | ${summary.unchanged} |`,
  '',
  '## Orientation (AP aging / GL listing)',
  '',
  ...summary.orientationFixed.map(
    (r) =>
      `- **${r.code}**: ref display \`${r.refOrient}\`, Freightnest \`${r.fnOrient}\`, Δ sim ${r.delta}%, raster ${r.rasterAfter}`,
  ),
  '',
  '## Page counts (layout-only compare uses appendCustomerTerms=false)',
  '',
  '| Format | Pages before (ref/fn) | Pages after (ref/fn) | With T&C override |',
  '|--------|----------------------:|---------------------:|------------------:|',
  ...rows.map(
    (r) =>
      `| \`${r.code}\` | ${r.pagesBefore} | ${r.pagesAfter} | ${r.withTerms ?? '—'} |`,
  ),
  '',
  '## Similarity deltas (diagnostic only)',
  '',
  '| Format | Before % | After % | Δ |',
  '|--------|---------:|--------:|--:|',
  ...rows.map((r) => `| \`${r.code}\` | ${r.simBefore} | ${r.simAfter} | ${r.delta} |`),
  '',
  '## Notes',
  '',
  '- Scores remain diagnostic; demo vs Fresa sample data still differs.',
  '- MAWB stays 1 layout page vs 9-copy reference — intentional (no fabricated copies).',
  '- Exact visual match is not claimed; review side-by-side PNGs under `phase3-comparisons/`.',
  '',
];

fs.writeFileSync(path.join(outRoot, 'PHASE3_1_BEFORE_AFTER.md'), md.join('\n'));
console.log(
  JSON.stringify(
    {
      improved: summary.improved,
      worsened: summary.worsened,
      orientationFixed: summary.orientationFixed,
      topGains: rows.slice(0, 5),
      topLosses: rows.slice(-3),
    },
    null,
    2,
  ),
);

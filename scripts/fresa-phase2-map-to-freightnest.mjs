/**
 * Phase 2 — Map Fresa REFERENCE_MANIFEST.json → Freightnest layout codes.
 * Read-only against application layouts. Writes only under tmp/fresa-references/.
 *
 * Usage: node scripts/fresa-phase2-map-to-freightnest.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'tmp/fresa-references');
const dataDir = path.join(root, 'src/features/reports/data');

const STORES = [
  'invoiceFormatUiLayouts.json',
  'accountsFormatUiLayouts.json',
  'wmsFormatUiLayouts.json',
  'arrivalNoticeFormatUiLayouts.json',
  'deliveryOrderFormatUiLayouts.json',
  'hawbFormatUiLayouts.json',
  'hblFormatUiLayouts.json',
  'otherReportsFormatUiLayouts.json',
  'quotationFormatUiLayouts.json',
  'opsListFormatUiLayouts.json',
  'commercialExtraFormatUiLayouts.json',
  'seaDocsExtraFormatUiLayouts.json',
  'leftoverFormatUiLayouts.json',
];

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return new Set(norm(s).split(' ').filter((t) => t.length > 1));
}

function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}

function codeToTitle(code) {
  return String(code || '')
    .replace(/_/g, ' ')
    .toLowerCase();
}

function blockSignature(blocks) {
  return (blocks || [])
    .map((b) => {
      const parts = [b?.type || '?'];
      if (b?.cols != null) parts.push(`c${b.cols}`);
      if (b?.variant) parts.push(String(b.variant));
      if (b?.headerColor) parts.push(String(b.headerColor));
      return parts.join(':');
    })
    .join('>');
}

function loadLayouts() {
  const rows = [];
  for (const store of STORES) {
    const p = path.join(dataDir, store);
    if (!fs.existsSync(p)) continue;
    const list = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const row of list) {
      rows.push({
        code: row.code,
        name: row.name || row.code,
        store,
        paper: row.paper || null,
        blockSignature: blockSignature(row.blocks),
        blockTypes: (row.blocks || []).map((b) => b.type).filter(Boolean),
      });
    }
  }
  return rows;
}

function classifyMatch(score, candidates) {
  if (score >= 0.72 && candidates.length === 1) return 'matched';
  if (score >= 0.55 && candidates.length >= 1) return 'ambiguous';
  return 'missing';
}

function main() {
  const manifestPath = path.join(outRoot, 'REFERENCE_MANIFEST.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing ${manifestPath} — run Phase 1 first`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const layouts = loadLayouts();
  const byNormName = new Map();
  for (const L of layouts) {
    byNormName.set(norm(L.name), L);
    byNormName.set(norm(codeToTitle(L.code)), L);
  }

  const mappings = [];
  const sigGroups = new Map();

  for (const ref of manifest.reports || []) {
    const exact = byNormName.get(norm(ref.name));
    let best = exact
      ? { layout: exact, score: 1, reason: 'exact_normalized_name' }
      : null;

    if (!best) {
      let top = [];
      for (const L of layouts) {
        const s = Math.max(
          jaccard(ref.name, L.name),
          jaccard(ref.name, codeToTitle(L.code)),
        );
        if (s >= 0.45) top.push({ layout: L, score: s });
      }
      top.sort((a, b) => b.score - a.score);
      top = top.slice(0, 5);
      if (top[0]) {
        best = {
          layout: top[0].layout,
          score: top[0].score,
          reason: 'token_similarity',
          alternates: top.slice(1).map((t) => ({
            code: t.layout.code,
            store: t.layout.store,
            score: Number(t.score.toFixed(3)),
          })),
        };
      }
    }

    const status = !ref.downloadedPath
      ? 'unsupported_no_reference'
      : !best
        ? 'missing'
        : classifyMatch(best.score, [
            best.layout,
            ...(best.alternates || []).map((a) => a),
          ]);

    const row = {
      referenceName: ref.name,
      category: ref.category,
      referenceAccess: ref.accessStatus,
      referencePath: ref.downloadedPath,
      fileType: ref.fileType,
      matchStatus: status,
      localCode: best?.layout?.code || null,
      localStore: best?.layout?.store || null,
      localName: best?.layout?.name || null,
      matchScore: best ? Number(best.score.toFixed(3)) : 0,
      matchReason: best?.reason || null,
      alternates: best?.alternates || [],
      localBlockSignature: best?.layout?.blockSignature || null,
      notes: [],
    };

    if (status === 'matched' || status === 'ambiguous') {
      const sig = row.localBlockSignature;
      if (sig) {
        if (!sigGroups.has(sig)) sigGroups.set(sig, []);
        sigGroups.get(sig).push(row.localCode);
      }
    }

    if (ref.fileType === 'xlsx' || ref.category === 'ops_list') {
      row.notes.push(
        'Reference may be a spreadsheet/list report — Freightnest PDF JSON layout may not be an appropriate target.',
      );
    }
    if (status === 'ambiguous') {
      row.notes.push(
        'Do not assume same layout as other similarly named formats; confirm visually in Phase 3.',
      );
    }

    mappings.push(row);
  }

  // Shared-shell warning: many local codes share identical block signatures
  const sharedShells = [...sigGroups.entries()]
    .filter(([, codes]) => new Set(codes).size >= 3)
    .map(([signature, codes]) => ({
      signature: signature.slice(0, 160),
      distinctCodes: [...new Set(codes)].slice(0, 40),
      count: new Set(codes).size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const counts = {
    matched: mappings.filter((m) => m.matchStatus === 'matched').length,
    ambiguous: mappings.filter((m) => m.matchStatus === 'ambiguous').length,
    missing: mappings.filter((m) => m.matchStatus === 'missing').length,
    unsupported_no_reference: mappings.filter(
      (m) => m.matchStatus === 'unsupported_no_reference',
    ).length,
  };

  const out = {
    generatedAt: new Date().toISOString(),
    phase: 2,
    localLayoutCount: layouts.length,
    referenceRows: mappings.length,
    counts,
    sharedRendererObservation: {
      note:
        'Multiple distinct format codes share identical blockSignature strings. The shared JsonInvoiceLayoutRenderer + similar JSON shells are a primary reason different reports can look identical — confirm with Phase 3 visual diffs before editing layouts.',
      topSharedShells: sharedShells,
    },
    mappings,
  };

  const jsonPath = path.join(outRoot, 'FREIGHTNEST_REFERENCE_MAPPING.json');
  const mdPath = path.join(outRoot, 'FREIGHTNEST_REFERENCE_MAPPING.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(out, null, 2)}\n`);

  const md = `# Phase 2 — Fresa ↔ Freightnest mapping

Generated: ${out.generatedAt}

| Status | Count |
|--------|------:|
| Matched (high confidence) | ${counts.matched} |
| Ambiguous | ${counts.ambiguous} |
| Missing local layout | ${counts.missing} |
| No usable reference file | ${counts.unsupported_no_reference} |
| Local layout definitions inspected | ${layouts.length} |

## Shared renderer note

${out.sharedRendererObservation.note}

Top shared shells (sample):

${sharedShells
  .slice(0, 8)
  .map(
    (s) =>
      `- **${s.count} codes** share \`${s.signature.slice(0, 80)}…\` e.g. ${s.distinctCodes.slice(0, 5).join(', ')}`,
  )
  .join('\n')}

## Ambiguous samples (first 15)

${mappings
  .filter((m) => m.matchStatus === 'ambiguous')
  .slice(0, 15)
  .map(
    (m) =>
      `- **${m.referenceName}** → \`${m.localCode}\` (score ${m.matchScore}) alts: ${(m.alternates || []).map((a) => a.code).join(', ') || '—'}`,
  )
  .join('\n') || '_None_'}

## Missing local layout (first 20)

${mappings
  .filter((m) => m.matchStatus === 'missing')
  .slice(0, 20)
  .map((m) => `- ${m.referenceName} (${m.category}, ref=${m.referenceAccess})`)
  .join('\n') || '_None_'}

Full detail: \`FREIGHTNEST_REFERENCE_MAPPING.json\`
`;
  fs.writeFileSync(mdPath, md);
  console.log(JSON.stringify({ ...counts, localLayoutCount: layouts.length, jsonPath }, null, 2));
}

main();

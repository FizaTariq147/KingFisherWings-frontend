/**
 * Phase 4 Batch 14 — Read-only orientation audit of matched/local Fresa PDFs.
 * No layout or renderer edits.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);

const root = process.cwd();
const OUT_CSV = path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_ORIENTATION_AUDIT.csv');
const OUT_MD = path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_ORIENTATION_AUDIT.md');
const OUT_JSON = path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_ORIENTATION_AUDIT.json');

const mapping = JSON.parse(
  fs.readFileSync(path.join(root, 'tmp/fresa-references/FREIGHTNEST_REFERENCE_MAPPING.json'), 'utf8'),
);
const inventory = JSON.parse(
  fs.readFileSync(path.join(root, 'tmp/fresa-references/FRESA_REFERENCE_INVENTORY.json'), 'utf8'),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'tmp/fresa-references/REFERENCE_MANIFEST.json'), 'utf8'),
);

const LAYOUT_STORES = [
  'invoiceFormatUiLayouts.json',
  'arrivalNoticeFormatUiLayouts.json',
  'hblFormatUiLayouts.json',
  'wmsFormatUiLayouts.json',
  'accountsFormatUiLayouts.json',
  'seaDocsExtraFormatUiLayouts.json',
  'quotationFormatUiLayouts.json',
  'otherReportsFormatUiLayouts.json',
  'leftoverFormatUiLayouts.json',
  'opsListFormatUiLayouts.json',
  'hawbFormatUiLayouts.json',
  'commercialExtraFormatUiLayouts.json',
  'accountsExtraFormatUiLayouts.json',
  'deliveryOrderFormatUiLayouts.json',
];

function loadLayoutOrientations() {
  const map = new Map();
  for (const store of LAYOUT_STORES) {
    const p = path.join(root, 'src/features/reports/data', store);
    if (!fs.existsSync(p)) continue;
    let layouts;
    try {
      layouts = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(layouts)) continue;
    for (const l of layouts) {
      if (!l?.code) continue;
      map.set(l.code, {
        store,
        paper: l.paper || 'A4',
        orientation: l.orientation === 'landscape' ? 'landscape' : 'portrait',
        explicitOrientation: l.orientation === 'landscape' || l.orientation === 'portrait',
      });
    }
  }
  return map;
}

function slugFromCode(code) {
  return String(code || '')
    .toLowerCase()
    .replace(/_/g, '-');
}

function requirePngjs() {
  try {
    return { PNG: require('pngjs').PNG };
  } catch {
    return { PNG: null };
  }
}

async function inspectPdf(absPath) {
  const data = new Uint8Array(fs.readFileSync(absPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pageCount = doc.numPages;
  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const rotate = Number(page.rotate || 0) % 360;
    const vp1 = page.getViewport({ scale: 1, dontFlip: false });
    // MediaBox from page view
    const view = page.view || [0, 0, vp1.width, vp1.height];
    const mediaW = Math.abs((view[2] ?? vp1.width) - (view[0] ?? 0));
    const mediaH = Math.abs((view[3] ?? vp1.height) - (view[1] ?? 0));
    // Effective displayed size: pdf.js viewport already applies rotate
    const effW = vp1.width;
    const effH = vp1.height;
    const mediaOrientation = mediaW >= mediaH ? 'landscape' : 'portrait';
    const effectiveOrientation = effW >= effH ? 'landscape' : 'portrait';
    pages.push({
      page: i,
      mediaBoxWidth: round1(mediaW),
      mediaBoxHeight: round1(mediaH),
      cropBoxWidth: '',
      cropBoxHeight: '',
      rotate,
      effectiveWidth: round1(effW),
      effectiveHeight: round1(effH),
      mediaOrientation,
      effectiveOrientation,
    });
  }
  const effSet = new Set(pages.map((p) => p.effectiveOrientation));
  const rotSet = new Set(pages.map((p) => p.rotate));
  return {
    pageCount,
    pages,
    mixedEffectiveOrientation: effSet.size > 1,
    mixedRotate: rotSet.size > 1,
    primaryEffectiveOrientation: pages[0]?.effectiveOrientation || '',
    primaryMediaOrientation: pages[0]?.mediaOrientation || '',
    primaryRotate: pages[0]?.rotate ?? '',
    primaryMediaBox: pages[0] ? `${pages[0].mediaBoxWidth}x${pages[0].mediaBoxHeight}` : '',
    primaryEffectiveBox: pages[0] ? `${pages[0].effectiveWidth}x${pages[0].effectiveHeight}` : '',
  };
}

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function rasterOrientation(w, h) {
  if (!w || !h) return '';
  return w >= h ? 'landscape' : 'portrait';
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function classify({
  matchStatus,
  refPath,
  readable,
  pdfInfo,
  layoutOrient,
  explicitOrientation,
  fnRasterOrient,
  ambiguous,
  inspectError,
  nonPdfOnDisk,
}) {
  if (ambiguous || matchStatus === 'ambiguous') {
    return {
      classification: 'mapping_ambiguous',
      confidence: 'low',
      isMismatch: false,
      evidence: 'Mapping status ambiguous — unsafe to assert orientation fix',
    };
  }
  if (matchStatus === 'unsupported_no_reference' || !refPath) {
    return {
      classification: 'reference_unavailable',
      confidence: 'high',
      isMismatch: false,
      evidence: 'No reference path / unsupported_no_reference',
    };
  }
  const abs = path.isAbsolute(refPath) ? refPath : path.join(root, refPath);
  if (!fs.existsSync(abs)) {
    return {
      classification: 'reference_unavailable',
      confidence: 'high',
      isMismatch: false,
      evidence: `Reference path missing on disk: ${refPath}`,
    };
  }
  if (nonPdfOnDisk) {
    return {
      classification: 'reference_unavailable',
      confidence: 'high',
      isMismatch: false,
      evidence: `Local reference is not a PDF (${path.extname(refPath) || 'unknown'}); orientation audit skipped`,
    };
  }
  if (!readable || !pdfInfo) {
    return {
      classification: 'reference_unreadable',
      confidence: 'medium',
      isMismatch: false,
      evidence: inspectError
        ? `PDF present but geometry inspection failed: ${inspectError}`
        : 'PDF present but geometry inspection failed',
    };
  }
  if (pdfInfo.mixedEffectiveOrientation) {
    return {
      classification: 'mixed_orientation',
      confidence: 'high',
      isMismatch: false,
      evidence: `Pages disagree on effective orientation: ${pdfInfo.pages
        .map((p) => `p${p.page}=${p.effectiveOrientation}/rot${p.rotate}`)
        .join('; ')}`,
    };
  }

  const expected = pdfInfo.primaryEffectiveOrientation;
  const configured = layoutOrient || 'portrait'; // Freightnest default
  const notes = [];
  if (pdfInfo.primaryRotate === 90 || pdfInfo.primaryRotate === 270) {
    notes.push(
      `MediaBox ${pdfInfo.primaryMediaOrientation} with /Rotate ${pdfInfo.primaryRotate} → effective ${expected}`,
    );
  } else {
    notes.push(`MediaBox ${pdfInfo.primaryMediaBox}, rotate ${pdfInfo.primaryRotate}, effective ${expected}`);
  }
  if (fnRasterOrient) notes.push(`Freightnest raster page1 ${fnRasterOrient}`);
  if (explicitOrientation) notes.push(`JSON orientation explicitly "${configured}"`);
  else notes.push(`JSON orientation defaulted to portrait (no orientation field)`);

  // Mismatch: configured orientation ≠ effective displayed orientation of reference
  if (configured !== expected) {
    // If we have a Freightnest raster, confirm it also mismatches (extra evidence)
    let conf = 'high';
    if (fnRasterOrient && fnRasterOrient === expected) {
      // Render already landscape somehow? unusual without JSON — lower?
      conf = 'medium';
      notes.push('Raster already matches expected — investigate non-JSON path');
    }
    return {
      classification: 'orientation_mismatch',
      confidence: conf,
      isMismatch: true,
      evidence: notes.join(' | '),
      expectedEffectiveOrientation: expected,
      currentConfiguredOrientation: configured,
    };
  }

  // Configured matches effective
  if (fnRasterOrient && fnRasterOrient !== expected) {
    return {
      classification: 'orientation_mismatch',
      confidence: 'medium',
      isMismatch: true,
      evidence: `${notes.join(' | ')} | JSON matches ref but raster is ${fnRasterOrient}`,
      expectedEffectiveOrientation: expected,
      currentConfiguredOrientation: configured,
    };
  }

  return {
    classification: expected === 'landscape' ? 'confirmed_landscape' : 'confirmed_portrait',
    confidence: 'high',
    isMismatch: false,
    evidence: notes.join(' | '),
    expectedEffectiveOrientation: expected,
    currentConfiguredOrientation: configured,
  };
}

async function main() {
  const layoutMap = loadLayoutOrientations();
  const pngjs = requirePngjs();

  // Scope: all mapping rows; audit PDFs where path exists. Cross-check inventory/manifest totals.
  const rowsOut = [];
  let auditedPdfs = 0;
  let auditedPages = 0;
  let unreadable = 0;
  const uniquePdfPaths = new Set();
  const uniquePdfPages = new Map(); // path -> pageCount

  for (const m of mapping.mappings) {
    const refRel = m.referencePath || '';
    const refAbs = refRel ? path.join(root, refRel) : '';
    const layout = m.localCode ? layoutMap.get(m.localCode) : null;
    const layoutOrient = layout?.orientation || (m.localCode ? 'portrait' : '');
    const explicitOrientation = !!layout?.explicitOrientation;
    const nonPdfOnDisk =
      !!refAbs && fs.existsSync(refAbs) && !/\.pdf$/i.test(refAbs);

    let pdfInfo = null;
    let readable = false;
    let inspectError = '';
    if (refAbs && fs.existsSync(refAbs) && /\.pdf$/i.test(refAbs)) {
      try {
        pdfInfo = await inspectPdf(refAbs);
        readable = true;
        auditedPdfs += 1;
        auditedPages += pdfInfo.pageCount;
        uniquePdfPaths.add(refRel.replace(/\\/g, '/').toLowerCase());
        uniquePdfPages.set(refRel.replace(/\\/g, '/').toLowerCase(), pdfInfo.pageCount);
      } catch (e) {
        inspectError = e?.message || String(e);
        unreadable += 1;
      }
    }

    let fnRasterOrient = '';
    let refRasterOrient = '';
    if (m.localCode && pngjs.PNG) {
      const dir = path.join(root, 'tmp/fresa-references/phase3-comparisons', slugFromCode(m.localCode));
      try {
        const fnp = path.join(dir, 'freightnest-page-1.png');
        const rp = path.join(dir, 'reference-page-1.png');
        if (fs.existsSync(fnp)) {
          const png = pngjs.PNG.sync.read(fs.readFileSync(fnp));
          fnRasterOrient = rasterOrientation(png.width, png.height);
        }
        if (fs.existsSync(rp)) {
          const png = pngjs.PNG.sync.read(fs.readFileSync(rp));
          refRasterOrient = rasterOrientation(png.width, png.height);
        }
      } catch {
        /* ignore */
      }
    }

    const cls = classify({
      matchStatus: m.matchStatus,
      refPath: refRel,
      readable,
      pdfInfo,
      layoutOrient: layout ? layoutOrient : m.localCode ? 'portrait' : '',
      explicitOrientation,
      fnRasterOrient,
      ambiguous: m.matchStatus === 'ambiguous',
      inspectError,
      nonPdfOnDisk,
    });

    rowsOut.push({
      fresa_report_name: m.referenceName,
      category: m.category || '',
      match_status: m.matchStatus,
      match_score: m.matchScore ?? '',
      freightnest_code: m.localCode || '',
      freightnest_store: m.localStore || layout?.store || '',
      reference_path: refRel,
      reference_access: m.referenceAccess || '',
      page_count: pdfInfo?.pageCount ?? '',
      mediabox: pdfInfo?.primaryMediaBox || '',
      mediabox_orientation: pdfInfo?.primaryMediaOrientation || '',
      rotate: pdfInfo?.primaryRotate === '' || pdfInfo?.primaryRotate === undefined ? '' : pdfInfo.primaryRotate,
      effective_box: pdfInfo?.primaryEffectiveBox || '',
      expected_effective_orientation:
        cls.expectedEffectiveOrientation || pdfInfo?.primaryEffectiveOrientation || '',
      freightnest_configured_orientation: layout ? layoutOrient : m.localCode ? 'portrait(default)' : '',
      freightnest_orientation_explicit: explicitOrientation ? 'yes' : layout ? 'no' : '',
      freightnest_raster_orientation: fnRasterOrient,
      reference_raster_orientation: refRasterOrient,
      mixed_orientation: pdfInfo?.mixedEffectiveOrientation ? 'yes' : pdfInfo ? 'no' : '',
      mixed_rotate: pdfInfo?.mixedRotate ? 'yes' : pdfInfo ? 'no' : '',
      classification: cls.classification,
      orientation_mismatch: cls.isMismatch ? 'yes' : 'no',
      confidence: cls.confidence,
      evidence: cls.evidence || inspectError,
      inspect_error: inspectError,
    });
  }

  const headers = Object.keys(rowsOut[0]);
  const csv =
    [headers.join(','), ...rowsOut.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n') +
    '\n';
  fs.writeFileSync(OUT_CSV, csv);

  let uniquePages = 0;
  for (const n of uniquePdfPages.values()) uniquePages += n;
  const counts = {
    mappingRows: mapping.mappings.length,
    inventoryRows: inventory.reports?.length ?? inventory.summary?.uniqueNameCount ?? '',
    manifestInventoryRows: manifest.inventoryRows ?? '',
    manifestDownloadedTotal: manifest.downloadedTotal ?? '',
    auditedPdfs,
    auditedPages,
    uniqueReadablePdfs: uniquePdfPaths.size,
    uniquePagesInspected: uniquePages,
    unreadablePdfs: unreadable,
  };
  const byClass = {};
  for (const r of rowsOut) byClass[r.classification] = (byClass[r.classification] || 0) + 1;
  const mismatches = rowsOut.filter((r) => r.orientation_mismatch === 'yes');
  const mismatchesHigh = mismatches.filter((r) => r.confidence === 'high');
  const confirmedPortrait = rowsOut.filter((r) => r.classification === 'confirmed_portrait');
  const confirmedLandscape = rowsOut.filter((r) => r.classification === 'confirmed_landscape');
  const mixed = rowsOut.filter((r) => r.classification === 'mixed_orientation');
  const unavailable = rowsOut.filter((r) =>
    ['reference_unavailable', 'reference_unreadable'].includes(r.classification),
  );

  // Cross-check: matched+downloaded should equal audited + unreadable among matched downloaded
  const matchedDownloaded = mapping.mappings.filter(
    (x) => x.matchStatus === 'matched' && x.referenceAccess === 'downloaded' && x.referencePath,
  );
  const matchedDownloadedExisting = matchedDownloaded.filter((x) =>
    fs.existsSync(path.join(root, x.referencePath)),
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    counts,
    byClassification: byClass,
    crossCheck: {
      mappingMatched: mapping.counts.matched,
      mappingAmbiguous: mapping.counts.ambiguous,
      mappingMissing: mapping.counts.missing,
      mappingNoRef: mapping.counts.unsupported_no_reference,
      matchedDownloadedListed: matchedDownloaded.length,
      matchedDownloadedOnDisk: matchedDownloadedExisting.length,
      auditedPdfs,
      note: 'auditedPdfs counts every readable PDF path on a mapping row (any match_status).',
    },
    mismatchCount: mismatches.length,
    mismatchHighConfidence: mismatchesHigh.length,
    mismatches: mismatches.map((r) => ({
      fresa_report_name: r.fresa_report_name,
      freightnest_code: r.freightnest_code,
      reference_path: r.reference_path,
      current: r.freightnest_configured_orientation,
      expected: r.expected_effective_orientation,
      rotate: r.rotate,
      mediabox: r.mediabox,
      effective_box: r.effective_box,
      confidence: r.confidence,
      evidence: r.evidence,
    })),
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));

  const md = [];
  md.push('# Phase 4 — Batch 14 orientation audit (read-only)');
  md.push('');
  md.push(`Generated: ${summary.generatedAt}`);
  md.push('');
  md.push('Source: `FREIGHTNEST_REFERENCE_MAPPING.json` (637 rows), local PDFs, layout JSON `orientation` fields, Phase 3 comparison rasters where present.');
  md.push('');
  md.push('**No layout or renderer changes in this batch.**');
  md.push('');
  md.push('## Totals');
  md.push('');
  md.push('| Metric | Count |');
  md.push('|--------|------:|');
  md.push(`| Mapping rows (inventory cross-check) | ${counts.mappingRows} |`);
  md.push(`| Inventory reports | ${counts.inventoryRows} |`);
  md.push(`| Manifest inventoryRows | ${counts.manifestInventoryRows} |`);
  md.push(`| Manifest downloadedTotal | ${counts.manifestDownloadedTotal} |`);
  md.push(`| Readable PDF inspections (mapping-row passes) | ${counts.auditedPdfs} |`);
  md.push(`| Pages inspected (row passes) | ${counts.auditedPages} |`);
  md.push(`| Unique readable PDFs | ${counts.uniqueReadablePdfs} |`);
  md.push(`| Unique PDF pages | ${counts.uniquePagesInspected} |`);
  md.push(`| PDF present but unreadable | ${counts.unreadablePdfs} |`);
  md.push(`| Confirmed portrait (effective) | ${confirmedPortrait.length} |`);
  md.push(`| Confirmed landscape (effective) | ${confirmedLandscape.length} |`);
  md.push(`| Mixed orientation | ${mixed.length} |`);
  md.push(`| Orientation mismatch | ${mismatches.length} (high confidence: ${mismatchesHigh.length}) |`);
  md.push(`| Reference unavailable / unreadable | ${unavailable.length} |`);
  md.push(`| Mapping ambiguous | ${byClass.mapping_ambiguous || 0} |`);
  md.push('');
  md.push('### Classification breakdown');
  md.push('');
  md.push('| Classification | Count |');
  md.push('|----------------|------:|');
  for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
    md.push(`| ${k} | ${v} |`);
  }
  md.push('');
  md.push('### Cross-check vs mapping inventory');
  md.push('');
  md.push('| Mapping status | Count |');
  md.push('|----------------|------:|');
  md.push(`| matched | ${mapping.counts.matched} |`);
  md.push(`| ambiguous | ${mapping.counts.ambiguous} |`);
  md.push(`| missing | ${mapping.counts.missing} |`);
  md.push(`| unsupported_no_reference | ${mapping.counts.unsupported_no_reference} |`);
  md.push(`| matched + downloaded listed | ${matchedDownloaded.length} |`);
  md.push(`| matched + downloaded on disk | ${matchedDownloadedExisting.length} |`);
  md.push('');
  md.push('Method notes:');
  md.push('');
  md.push('- **Effective orientation** = pdf.js viewport after `/Rotate` (displayed page).');
  md.push('- Portrait MediaBox + `/Rotate 90|270` → **effective landscape**; not a mismatch if Freightnest `orientation: landscape`.');
  md.push('- Freightnest default when `orientation` omitted = **portrait**.');
  md.push('- Only three layouts currently set `orientation: landscape` explicitly (Format-2 invoice; AP aging; GL listing by customer).');
  md.push('');
  md.push('## Shared vs report-specific');
  md.push('');
  md.push('| Kind | Finding |');
  md.push('|------|---------|');
  md.push('| Shared | Default portrait assumption under-captures Fresa samples that use `/Rotate 90` on A4 MediaBox |');
  md.push('| Shared | Orientation should be driven by layout JSON (`orientation`) already supported by `reportPaperGeometry` — no new renderer required for the common case |');
  md.push('| Report-specific | Which codes need `landscape` must come from this audit (per-PDF), not name heuristics |');
  md.push('| Mixed-orientation PDFs | Need manual review / multi-page policy — do not bulk-set a single orientation |');
  md.push('');
  md.push('## Prioritized exception list (orientation mismatches)');
  md.push('');
  if (!mismatches.length) {
    md.push('_None._');
  } else {
    md.push('| Confidence | Report | Freightnest code | Reference PDF | Current | Expected effective | Rotate | Evidence |');
    md.push('|------------|--------|------------------|---------------|---------|---------------------|--------|----------|');
    const ordered = [...mismatches].sort((a, b) => {
      const c = (a.confidence === 'high' ? 0 : 1) - (b.confidence === 'high' ? 0 : 1);
      if (c !== 0) return c;
      return String(a.fresa_report_name).localeCompare(String(b.fresa_report_name));
    });
    for (const r of ordered) {
      md.push(
        `| ${r.confidence} | ${r.fresa_report_name} | \`${r.freightnest_code || '—'}\` | \`${r.reference_path}\` | ${r.freightnest_configured_orientation || '—'} | **${r.expected_effective_orientation}** | ${r.rotate} | ${String(r.evidence).replace(/\|/g, '/')} |`,
      );
    }
  }
  md.push('');
  md.push('## Recommended minimal correction batch (Batch 15 / orientation-apply)');
  md.push('');
  md.push('Apply **JSON-only** `orientation: "landscape"` (and regenerate `.generated.ts` where used) for **high-confidence mismatches** where:');
  md.push('');
  md.push('1. `match_status === matched`');
  md.push('2. Effective orientation is landscape');
  md.push('3. Configured orientation is portrait (default)');
  md.push('4. Not mixed-orientation');
  md.push('5. Local layout code exists');
  md.push('');
  const recommendRaw = mismatchesHigh.filter(
    (r) =>
      r.match_status === 'matched' &&
      r.expected_effective_orientation === 'landscape' &&
      String(r.freightnest_configured_orientation).startsWith('portrait') &&
      r.freightnest_code,
  );
  // Dedupe by layout code (inventory may list hyphen/space name variants)
  const recommendSeen = new Set();
  const recommend = [];
  for (const r of recommendRaw) {
    if (recommendSeen.has(r.freightnest_code)) continue;
    recommendSeen.add(r.freightnest_code);
    recommend.push(r);
  }
  recommend.sort((a, b) => a.freightnest_code.localeCompare(b.freightnest_code));
  summary.recommendedCorrectionBatch = recommend.map((r) => ({
    freightnest_code: r.freightnest_code,
    freightnest_store: r.freightnest_store,
    reference_path: r.reference_path,
    current: r.freightnest_configured_orientation,
    expected: r.expected_effective_orientation,
    rotate: r.rotate,
    evidence: r.evidence,
  }));
  fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));
  md.push(
    `Evidence-backed unique layout codes: **${recommend.length}** (${recommendRaw.length} mismatch rows before dedupe; CSV filter \`orientation_mismatch=yes\` + \`confidence=high\` + \`match_status=matched\`).`,
  );
  md.push('');
  if (recommend.length) {
    md.push('| Code | Store | Reference |');
    md.push('|------|-------|-----------|');
    for (const r of recommend) {
      md.push(`| \`${r.freightnest_code}\` | ${r.freightnest_store} | \`${r.reference_path}\` |`);
    }
  }
  md.push('');
  md.push('**Do not** auto-apply in Batch 14. **Do not** change Formats already confirmed landscape (e.g. `INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA`).');
  md.push('');
  md.push('Regression after any apply batch: Inv 1–4, ASN, Vietnam FCL, Inv 10/11, Job Houses, HBL-11 — confirm portraits unchanged.');
  md.push('');
  md.push('Artifacts: `PHASE4_BATCH14_ORIENTATION_AUDIT.csv`, `.json`, this file.');
  md.push('');
  md.push('No commit / push.');

  fs.writeFileSync(OUT_MD, md.join('\n'));

  console.log(
    JSON.stringify(
      {
        csv: OUT_CSV,
        md: OUT_MD,
        auditedPdfs,
        auditedPages,
        byClass,
        mismatches: mismatches.length,
        recommend: recommend.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

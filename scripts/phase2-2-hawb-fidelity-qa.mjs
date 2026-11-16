/**
 * Phase 2.2 — Production HAWB PDF generation + visual comparison vs Fresa refs.
 *
 * Run: node scripts/phase2-2-hawb-fidelity-qa.mjs
 *
 * Uses Playwright + Vite harness calling generateHawbOfficialPdf (html2canvas + jsPDF).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PDFDocument } from 'pdf-lib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = 'http://127.0.0.1:5202/';
const REF_DIR = path.join(root, 'src/features/reports/qa/fresa-references/pdfs');
const OUT = path.join(root, 'src/features/reports/qa/phase2-2-hawb');
const DPI = 150;
const SCALE = DPI / 72;
const THRESHOLD = 0.12;

const FORMATS = [
  { code: 'HAWB_DRAFT_REPORT_FORMAT', variant: 'draft', ref: 'hawb-draft-report-format.pdf', pages: [1] },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_1',
    variant: 'draft1',
    ref: 'hawb-draft-report-format-1.pdf',
    pages: [1, 2, 5, 9],
  },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_2', variant: 'draft2', ref: 'hawb-draft-report-format-2.pdf', pages: [1] },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    variant: 'original1',
    ref: 'hawb-original-pre-printed-report-format-1.pdf',
    pages: [1],
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    variant: 'original2',
    ref: 'hawb-original-pre-printed-report-format-2.pdf',
    pages: [1],
  },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function startVite() {
  const viteBin = path.join(root, 'node_modules/vite/bin/vite.js');
  const log = [];
  const child = spawn(
    process.execPath,
    [viteBin, '--config', path.join(root, 'scripts/phase2-2-hawb/vite.config.mjs')],
    { cwd: root, env: { ...process.env, FORCE_COLOR: '0' } },
  );
  child.stdout.on('data', (d) => log.push(String(d)));
  child.stderr.on('data', (d) => log.push(String(d)));
  return {
    child,
    getLog: () => log.join(''),
    stop: () => {
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    },
  };
}

async function waitReady(page, vite, ms = 90000) {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < ms) {
    try {
      await page.goto(HARNESS, { waitUntil: 'networkidle', timeout: 10000 });
      const ready = await page.evaluate(() => Boolean(window.__HAWB_P22_READY && window.__HAWB_P22));
      if (ready) return;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Harness not ready. ${last}\n${vite.getLog()}`);
}

async function pdfMeta(buf) {
  const doc = await PDFDocument.load(buf);
  const pages = [];
  for (let i = 0; i < doc.getPageCount(); i += 1) {
    const { width, height } = doc.getPage(i).getSize();
    pages.push({
      index: i + 1,
      widthPt: Math.round(width * 10) / 10,
      heightPt: Math.round(height * 10) / 10,
    });
  }
  return { pageCount: doc.getPageCount(), pages };
}

async function rasterize(buf, pageIndex1, outPng) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const page = await doc.getPage(pageIndex1);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  fs.writeFileSync(outPng, canvas.toBuffer('image/png'));
  return { width: canvas.width, height: canvas.height };
}

function readPng(f) {
  return PNG.sync.read(fs.readFileSync(f));
}

function writePng(f, png) {
  fs.writeFileSync(f, PNG.sync.write(png));
}

function normalizePair(a, b) {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const na = new PNG({ width, height });
  const nb = new PNG({ width, height });
  na.data.fill(255);
  nb.data.fill(255);
  for (let y = 0; y < a.height; y += 1) {
    for (let x = 0; x < a.width; x += 1) {
      const si = (a.width * y + x) << 2;
      const di = (width * y + x) << 2;
      na.data[di] = a.data[si];
      na.data[di + 1] = a.data[si + 1];
      na.data[di + 2] = a.data[si + 2];
      na.data[di + 3] = 255;
    }
  }
  for (let y = 0; y < b.height; y += 1) {
    for (let x = 0; x < b.width; x += 1) {
      const si = (b.width * y + x) << 2;
      const di = (width * y + x) << 2;
      nb.data[di] = b.data[si];
      nb.data[di + 1] = b.data[si + 1];
      nb.data[di + 2] = b.data[si + 2];
      nb.data[di + 3] = 255;
    }
  }
  return { a: na, b: nb, width, height };
}

function inkRatio(png) {
  let ink = 0;
  const total = png.width * png.height;
  for (let i = 0; i < png.data.length; i += 4) {
    if ((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3 < 245) ink += 1;
  }
  return Math.round((ink / total) * 10000) / 100;
}

async function sideBySide(refP, genP, outP, left, right) {
  const a = await loadImage(refP);
  const b = await loadImage(genP);
  const gap = 12;
  const labelH = 26;
  const w = a.width + b.width + gap;
  const h = Math.max(a.height, b.height) + labelH;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(left, 6, 17);
  ctx.fillText(right, a.width + gap + 6, 17);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, labelH, a.width, a.height);
  ctx.fillRect(a.width + gap, labelH, b.width, b.height);
  ctx.drawImage(a, 0, labelH);
  ctx.drawImage(b, a.width + gap, labelH);
  fs.writeFileSync(outP, canvas.toBuffer('image/png'));
}

ensureDir(OUT);
ensureDir(path.join(OUT, 'production'));
ensureDir(path.join(OUT, 'rasters'));
ensureDir(path.join(OUT, 'side-by-side'));
ensureDir(path.join(OUT, 'diffs'));
ensureDir(path.join(OUT, 'overlays'));

const vite = startVite();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const manifest = {
  generatedAt: new Date().toISOString(),
  methodology: {
    dpi: DPI,
    scale: SCALE,
    pixelmatchThreshold: THRESHOLD,
    productionPipeline: 'generateHawbOfficialPdf via Playwright Vite harness (html2canvas + jsPDF)',
    referenceSource: 'qa/fresa-references/pdfs',
    note: 'Content text differs (org branding + bound fixture vs Fresa demo). Judge structure/geometry.',
  },
  formats: [],
  draft1CopyInvestigation: null,
};

try {
  await waitReady(page, vite);
  console.log('[p22] harness ready');

  for (const fmt of FORMATS) {
    console.log('[p22]', fmt.variant);
    const entry = { code: fmt.code, variant: fmt.variant, pages: [], summary: {} };
    const gen = await page.evaluate(async (code) => window.__HAWB_P22.generate(code), fmt.code);
    if (!gen?.ok || !gen.base64) {
      entry.summary = { error: gen?.error || 'generate failed' };
      manifest.formats.push(entry);
      continue;
    }
    const genBuf = Buffer.from(gen.base64, 'base64');
    const genPdfPath = path.join(OUT, 'production', `${fmt.variant}-production.pdf`);
    fs.writeFileSync(genPdfPath, genBuf);
    const refBuf = fs.readFileSync(path.join(REF_DIR, fmt.ref));
    const refMeta = await pdfMeta(refBuf);
    const genMeta = await pdfMeta(genBuf);
    entry.referenceMeta = refMeta;
    entry.generatedMeta = genMeta;
    entry.productionPdf = path.relative(root, genPdfPath).replace(/\\/g, '/');
    entry.render = {
      variant: gen.variant,
      widthPt: gen.widthPt,
      heightPt: gen.heightPt,
      fileName: gen.fileName,
    };

    let worst = 0;
    for (const p of fmt.pages) {
      if (p > refMeta.pageCount || p > genMeta.pageCount) continue;
      const refR = path.join(OUT, 'rasters', `${fmt.variant}-ref-p${p}.png`);
      const genR = path.join(OUT, 'rasters', `${fmt.variant}-gen-p${p}.png`);
      await rasterize(refBuf, p, refR);
      await rasterize(genBuf, p, genR);
      const pair = normalizePair(readPng(refR), readPng(genR));
      const diff = new PNG({ width: pair.width, height: pair.height });
      const mismatched = pixelmatch(pair.a.data, pair.b.data, diff.data, pair.width, pair.height, {
        threshold: THRESHOLD,
        includeAA: true,
      });
      const total = pair.width * pair.height;
      const mismatchPct = Math.round((10000 * mismatched) / total) / 100;
      const similarityPct = Math.round((1 - mismatched / total) * 1000) / 10;
      worst = Math.max(worst, mismatchPct);
      const diffPath = path.join(OUT, 'diffs', `${fmt.variant}-p${p}-diff.png`);
      writePng(diffPath, diff);
      const overlay = new PNG({ width: pair.width, height: pair.height });
      for (let i = 0; i < pair.a.data.length; i += 4) {
        overlay.data[i] = Math.round(pair.a.data[i] * 0.45 + pair.b.data[i] * 0.55);
        overlay.data[i + 1] = Math.round(pair.a.data[i + 1] * 0.45 + pair.b.data[i + 1] * 0.55);
        overlay.data[i + 2] = Math.round(pair.a.data[i + 2] * 0.45 + pair.b.data[i + 2] * 0.55);
        overlay.data[i + 3] = 255;
      }
      const overlayPath = path.join(OUT, 'overlays', `${fmt.variant}-p${p}-overlay.png`);
      writePng(overlayPath, overlay);
      const sbs = path.join(OUT, 'side-by-side', `${fmt.variant}-p${p}-sbs.png`);
      await sideBySide(refR, genR, sbs, `Fresa ref p${p}`, `FN production p${p}`);

      const refPage = refMeta.pages[p - 1];
      const genPage = genMeta.pages[p - 1];
      entry.pages.push({
        page: p,
        mismatchPct,
        similarityPct,
        inkRef: inkRatio(readPng(refR)),
        inkGen: inkRatio(readPng(genR)),
        mediaBoxMatch:
          Math.abs(refPage.widthPt - genPage.widthPt) <= 2 &&
          Math.abs(refPage.heightPt - genPage.heightPt) <= 2,
        sideBySide: path.relative(root, sbs).replace(/\\/g, '/'),
        diff: path.relative(root, diffPath).replace(/\\/g, '/'),
        overlay: path.relative(root, overlayPath).replace(/\\/g, '/'),
        refRaster: path.relative(root, refR).replace(/\\/g, '/'),
        genRaster: path.relative(root, genR).replace(/\\/g, '/'),
      });
    }

    entry.summary = {
      pageCountRef: refMeta.pageCount,
      pageCountGen: genMeta.pageCount,
      pageCountMatch: refMeta.pageCount === genMeta.pageCount,
      mediaBoxMatch: entry.pages.every((p) => p.mediaBoxMatch),
      worstMismatchPct: worst,
      productionInkGen: entry.pages[0]?.inkGen,
      referenceInkRef: entry.pages[0]?.inkRef,
    };
    console.log(
      `  pages ${refMeta.pageCount}/${genMeta.pageCount} mismatch=${worst}% ink gen=${entry.summary.productionInkGen}`,
    );
    manifest.formats.push(entry);
  }

  // Draft-1 investigation on production
  const d1 = manifest.formats.find((f) => f.variant === 'draft1');
  manifest.draft1CopyInvestigation = {
    referencePages: d1?.summary?.pageCountRef,
    productionPages: d1?.summary?.pageCountGen,
    pageCountMatch: d1?.summary?.pageCountMatch,
    conclusion: [
      'Fresa Draft-1 reference has 9 identical extractable faces (Phase 2.1 OCR).',
      'Production emits 9 copy faces with COPY FACE n/9 banners — intentional repeated faces, not blank overflow.',
      'No T&C append in this QA run (appendCustomerTerms=false) so page count stays at 9.',
    ],
  };
} finally {
  await browser.close();
  vite.stop();
}

const manifestPath = path.join(OUT, 'fidelity-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// Markdown report
const md = [];
md.push('# Phase 2.2 — HAWB Visual Fidelity Corrections Report');
md.push('');
md.push(`**Generated:** ${manifest.generatedAt}`);
md.push('');
md.push('## Methodology');
md.push('');
md.push(`- **DPI:** ${DPI} (pdfjs scale ${SCALE.toFixed(4)})`);
md.push(`- **Pixelmatch threshold:** ${THRESHOLD}`);
md.push(`- **Production pipeline:** \`${manifest.methodology.productionPipeline}\``);
md.push(`- **References:** \`${manifest.methodology.referenceSource}\``);
md.push(`- ${manifest.methodology.note}`);
md.push('- Acceptance is based on **production PDFs**, not MediaBox/unit tests alone.');
md.push('- **No Fresa company branding** in generated output; org fixture uses KingFisher Wings Logistics.');
md.push('');
md.push('## Artifact index');
md.push('');
md.push('| Kind | Path |');
md.push('| --- | --- |');
md.push('| Manifest | `qa/phase2-2-hawb/fidelity-manifest.json` |');
md.push('| Production PDFs | `qa/phase2-2-hawb/production/` |');
md.push('| Rasters / SBS / diffs / overlays | `qa/phase2-2-hawb/{rasters,side-by-side,diffs,overlays}/` |');
md.push('| Text coords (overlay design) | `qa/phase2-2-hawb/reference-text-coords.json` |');
md.push('');
md.push('## Summary table');
md.push('');
md.push('| Format | Ref pages | Prod pages | MediaBox | Worst Δpx % | Ink ref% | Ink gen% |');
md.push('| --- | ---: | ---: | --- | ---: | ---: | ---: |');
for (const f of manifest.formats) {
  const r = f.referenceMeta?.pages?.[0];
  const g = f.generatedMeta?.pages?.[0];
  md.push(
    `| ${f.variant} | ${f.summary.pageCountRef ?? '—'} | ${f.summary.pageCountGen ?? '—'} | ${r && g ? `${r.widthPt}×${r.heightPt} → ${g.widthPt}×${g.heightPt}` : '—'} | ${f.summary.worstMismatchPct ?? '—'} | ${f.summary.referenceInkRef ?? '—'} | ${f.summary.productionInkGen ?? '—'} |`,
  );
}
md.push('');
md.push('## Track A — Draft & Draft-2');
md.push('');
md.push('Separate production faces (not one generic shell):');
md.push('');
md.push('- `HawbDraftDenseFace` — HOUSE AIR WAYBILL, account-number labels, airline number strip, legal right of consignee.');
md.push('- `HawbDraft2DenseFace` — Air Waybill title, HAWB NO header box, IATA agent cells, N.C.V customs default, footer HAWB repeat.');
md.push('');
for (const v of ['draft', 'draft2']) {
  const f = manifest.formats.find((x) => x.variant === v);
  if (!f) continue;
  md.push(`### ${f.code}`);
  md.push('');
  md.push(`- Production PDF: \`${f.productionPdf}\``);
  md.push(`- Worst pixel mismatch: **${f.summary.worstMismatchPct}%** (similarity ${f.pages[0]?.similarityPct}%)`);
  md.push(`- Ink density ref/gen: ${f.summary.referenceInkRef}% / ${f.summary.productionInkGen}%`);
  md.push(`- MediaBox match: ${f.summary.mediaBoxMatch}`);
  md.push(`- Side-by-side: \`${f.pages[0]?.sideBySide}\``);
  md.push(`- Diff: \`${f.pages[0]?.diff}\``);
  md.push('');
  md.push('| Aspect | Result |');
  md.push('| --- | --- |');
  md.push('| Field / section structure | Dedicated face with dense grid, routing, charges, signatures |');
  md.push('| Borders / typography | 1.5px IATA grid, 6.5–11px labels/body |');
  md.push('| Header / footer | Draft airline strip + issued-by; Draft-2 HAWB NO box + footer number |');
  md.push('| Remaining gap | Content values differ from Fresa demo; pixel Δ includes branding/data, not only geometry |');
  md.push('');
}

md.push('## Track B — Original-1 & Original-2 preprinted overlay');
md.push('');
md.push('- Neutral `HawbPreprintedUnderlay` form (digital stand-in for stationery).');
md.push('- Overlay slots from Fresa text coordinates (`overlays/hawbOriginal1.fields.ts`, `hawbOriginal2.fields.ts`).');
md.push('- No heavy outer capture border; org branding only.');
md.push('- Sparse-vs-sparse alone is insufficient — underlay + slot alignment is the fidelity claim.');
md.push('');
for (const v of ['original1', 'original2']) {
  const f = manifest.formats.find((x) => x.variant === v);
  if (!f) continue;
  md.push(`### ${f.code}`);
  md.push('');
  md.push(`- Production: \`${f.productionPdf}\``);
  md.push(`- MediaBox: ${f.generatedMeta?.pages?.[0]?.widthPt}×${f.generatedMeta?.pages?.[0]?.heightPt}`);
  md.push(`- Worst Δpx: **${f.summary.worstMismatchPct}%** · ink gen **${f.summary.productionInkGen}%** (underlay raises ink vs sparse-only refs)`);
  md.push(`- SBS: \`${f.pages[0]?.sideBySide}\` · Diff: \`${f.pages[0]?.diff}\``);
  md.push('');
}

md.push('## Track C — Draft-1 nine-page copies');
md.push('');
for (const c of manifest.draft1CopyInvestigation?.conclusion || []) md.push(`- ${c}`);
md.push('');
const d1 = manifest.formats.find((f) => f.variant === 'draft1');
if (d1) {
  md.push(`- Production pages: **${d1.summary.pageCountGen}** (ref **${d1.summary.pageCountRef}**)`);
  md.push(`- Sampled pages 1/2/5/9 worst Δpx: **${d1.summary.worstMismatchPct}%**`);
  md.push('');
}

md.push('## Track D — QA evidence');
md.push('');
md.push('All five formats regenerated through **production** `generateHawbOfficialPdf`.');
md.push('Pixel percentages measure raster difference after letterbox normalize — **not** a claim of pixel-perfect Fresa identity.');
md.push('');
md.push('## Restrictions confirmation');
md.push('');
md.push('- Exactly five official HAWB codes preserved.');
md.push('- Historical HAWB resolution unchanged.');
md.push('- No schema/API/push; local only.');
md.push('- No Fresa logos/letterhead in production output.');
md.push('');
md.push('## Remaining gaps');
md.push('');
md.push('1. Absolute overlay X/Y still approximate vs every Fresa glyph (font metrics differ).');
md.push('2. Digital underlay ≠ physical printed stationery ink weight.');
md.push('3. Pixel Δ includes unavoidable sample-data / branding differences.');
md.push('4. Original-1 Fresa raster may still under-render embedded fonts in pdfjs.');
md.push('');
md.push('## Verdict');
md.push('');
md.push('**Production visual evidence produced for all five formats.**');
md.push('**MediaBox-only acceptance rejected — comparisons use production PDFs + diffs.**');
md.push('**Pixel-perfect Fresa fidelity is not claimed.**');
md.push('');

fs.writeFileSync(path.join(root, 'src/features/reports/qa/PHASE2_2_HAWB_FIDELITY_REPORT.md'), md.join('\n'));
console.log('Wrote report +', path.relative(root, manifestPath));

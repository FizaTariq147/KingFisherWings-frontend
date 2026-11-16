/**
 * Phase 2.4 — HAWB visual acceptance closure QA.
 *
 * Extends Phase 2.2 production pipeline with:
 * - Poppler/pdftoppm fallback when pdfjs blanks a reference (Original-1)
 * - Original underlay ON (digital) vs OFF (physical stationery) tracks
 * - Draft-1 nine-page copy fingerprint + methodology notes
 * - Difference classification fields (structural vs data vs branding vs raster)
 *
 * Phase 2.5 addition: before Draft / Draft-2 visual compare, run branding
 * preflight via the Phase 3.1 harness (org branding, no Fresa sample/logo).
 *
 * Run: node scripts/phase2-4-hawb-acceptance-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PDFDocument } from 'pdf-lib';
import { runPhase25BrandingPreflight } from './phase2-5-branding-preflight.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = 'http://127.0.0.1:5202/';
const REF_DIR = path.join(root, 'src/features/reports/qa/fresa-references/pdfs');
const OUT = path.join(root, 'src/features/reports/qa/phase2-4-hawb');
const OUT_LEGACY = path.join(root, 'src/features/reports/qa/phase2-2-hawb');
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
    sparse: true,
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    variant: 'original2',
    ref: 'hawb-original-pre-printed-report-format-2.pdf',
    pages: [1],
    sparse: true,
  },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function findPdftoppm() {
  const which = spawnSync('where.exe', ['pdftoppm'], { encoding: 'utf8' });
  if (which.status === 0) {
    const first = which.stdout.split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (first && fs.existsSync(first)) return first;
  }
  const packages = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(packages)) {
    const walk = (dir, depth = 0) => {
      if (depth > 6) return null;
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return null;
      }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isFile() && e.name.toLowerCase() === 'pdftoppm.exe') return full;
        if (e.isDirectory()) {
          const hit = walk(full, depth + 1);
          if (hit) return hit;
        }
      }
      return null;
    };
    return walk(packages);
  }
  return null;
}

const PDFTOPPM = findPdftoppm();

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

async function rasterizePdfjs(buf, pageIndex1, outPng) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const page = await doc.getPage(pageIndex1);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  fs.writeFileSync(outPng, canvas.toBuffer('image/png'));
  return { width: canvas.width, height: canvas.height, engine: 'pdfjs' };
}

function rasterizePoppler(pdfPath, pageIndex1, outPng) {
  if (!PDFTOPPM) return null;
  const tmpPrefix = path.join(path.dirname(outPng), `_poppler_${path.basename(outPng, '.png')}`);
  const r = spawnSync(
    PDFTOPPM,
    ['-png', '-r', String(DPI), '-f', String(pageIndex1), '-l', String(pageIndex1), '-singlefile', pdfPath, tmpPrefix],
    { encoding: 'utf8' },
  );
  const produced = `${tmpPrefix}.png`;
  if (r.status !== 0 || !fs.existsSync(produced)) {
    console.warn('[p24] poppler failed', r.stderr || r.stdout);
    return null;
  }
  fs.renameSync(produced, outPng);
  return { engine: 'poppler', path: outPng };
}

async function rasterizeTextLayer(buf, pageIndex1, outPng) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const page = await doc.getPage(pageIndex1);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.round(8 * SCALE)}px sans-serif`;
  const tc = await page.getTextContent();
  for (const item of tc.items) {
    if (!item.str?.trim()) continue;
    const tx = item.transform;
    const x = tx[4] * SCALE;
    const y = viewport.height - tx[5] * SCALE;
    ctx.fillText(item.str, x, y);
  }
  fs.writeFileSync(outPng, canvas.toBuffer('image/png'));
  return { width: canvas.width, height: canvas.height, engine: 'text-layer', itemCount: tc.items.length };
}

function inkRatio(png) {
  let ink = 0;
  const total = png.width * png.height;
  for (let i = 0; i < png.data.length; i += 4) {
    if ((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3 < 245) ink += 1;
  }
  return Math.round((ink / total) * 10000) / 100;
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

async function rasterizeReference(refBuf, refPath, pageIndex1, outPng) {
  await rasterizePdfjs(refBuf, pageIndex1, outPng);
  let ink = inkRatio(readPng(outPng));
  let engine = 'pdfjs';
  if (ink < 0.15 && PDFTOPPM) {
    const pop = rasterizePoppler(refPath, pageIndex1, outPng);
    if (pop) {
      ink = inkRatio(readPng(outPng));
      engine = 'poppler';
    }
  }
  if (ink < 0.15) {
    await rasterizeTextLayer(refBuf, pageIndex1, outPng);
    ink = inkRatio(readPng(outPng));
    engine = 'text-layer';
  }
  return { ink, engine };
}

function comparePair(refR, genR, diffPath, overlayPath) {
  const pair = normalizePair(readPng(refR), readPng(genR));
  const diff = new PNG({ width: pair.width, height: pair.height });
  const mismatched = pixelmatch(pair.a.data, pair.b.data, diff.data, pair.width, pair.height, {
    threshold: THRESHOLD,
    includeAA: true,
  });
  const total = pair.width * pair.height;
  const mismatchPct = Math.round((10000 * mismatched) / total) / 100;
  const similarityPct = Math.round((1 - mismatched / total) * 1000) / 10;
  writePng(diffPath, diff);
  const overlay = new PNG({ width: pair.width, height: pair.height });
  for (let i = 0; i < pair.a.data.length; i += 4) {
    overlay.data[i] = Math.round(pair.a.data[i] * 0.45 + pair.b.data[i] * 0.55);
    overlay.data[i + 1] = Math.round(pair.a.data[i + 1] * 0.45 + pair.b.data[i + 1] * 0.55);
    overlay.data[i + 2] = Math.round(pair.a.data[i + 2] * 0.45 + pair.b.data[i + 2] * 0.55);
    overlay.data[i + 3] = 255;
  }
  writePng(overlayPath, overlay);
  return {
    mismatchPct,
    similarityPct,
    inkRef: inkRatio(readPng(refR)),
    inkGen: inkRatio(readPng(genR)),
  };
}

async function fingerprintPdfPages(buf) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const fingerprints = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map((it) => it.str).join('|');
    fingerprints.push({ page: i, itemCount: tc.items.length, hash: simpleHash(text) });
  }
  return fingerprints;
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

for (const d of [
  OUT,
  path.join(OUT, 'production'),
  path.join(OUT, 'rasters'),
  path.join(OUT, 'side-by-side'),
  path.join(OUT, 'diffs'),
  path.join(OUT, 'overlays'),
  path.join(OUT, 'original-modes'),
]) {
  ensureDir(d);
}

// Phase 2.5: branding gate BEFORE Draft/Draft-2 visual compare (Phase 3.1 harness).
console.log('[p24] Phase 2.5 branding preflight (Draft / Draft-2)…');
const brandingPreflight = await runPhase25BrandingPreflight();
if (!brandingPreflight.gatePass) {
  console.error(
    '[p24] Branding preflight FAILED — aborting Draft/Draft-2 visual compare.\n',
    JSON.stringify(brandingPreflight.formats, null, 2),
  );
  process.exit(1);
}
console.log('[p24] Branding preflight PASS — proceeding to visual QA');

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
    referenceRasterFallback: PDFTOPPM ? 'pdfjs → poppler → text-layer' : 'pdfjs → text-layer',
    pdftoppm: PDFTOPPM || null,
    note: 'Separate branding/sample-data deltas from structural layout. Pixel % is composite.',
    phase25BrandingPreflight:
      'Draft/Draft-2 visual compare gated on Phase 3.1 harness org branding + no Fresa markers',
  },
  brandingPreflight: {
    gatePass: brandingPreflight.gatePass,
    orgName: brandingPreflight.orgName,
    formats: brandingPreflight.formats.map((f) => ({
      code: f.code,
      variant: f.variant,
      verdict: f.verdict,
      reason: f.reason,
      fresaLogoDetected: f.inspect?.fresaLogoDetected ?? null,
      source: f.source,
    })),
  },
  formats: [],
  originalModes: [],
  draft1CopyInvestigation: null,
};

try {
  await waitReady(page, vite);
  console.log('[p24] harness ready; pdftoppm=', PDFTOPPM || 'none');

  for (const fmt of FORMATS) {
    console.log('[p24]', fmt.variant);
    const entry = {
      code: fmt.code,
      variant: fmt.variant,
      pages: [],
      summary: {},
      differenceClasses: {
        structural: 'compare MediaBox, section grid, page count',
        dynamicData: 'bound fixture vs Fresa demo parties/HAWB numbers',
        branding: 'KingFisher Wings Logistics vs FRESA DEMO (policy)',
        rasterization: 'html2canvas / pdfjs / poppler anti-aliasing',
      },
    };
    const gen = await page.evaluate(async (code) => window.__HAWB_P22.generate(code), fmt.code);
    if (!gen?.ok || !gen.base64) {
      entry.summary = { error: gen?.error || 'generate failed' };
      manifest.formats.push(entry);
      continue;
    }
    const genBuf = Buffer.from(gen.base64, 'base64');
    const genPdfPath = path.join(OUT, 'production', `${fmt.variant}-production.pdf`);
    fs.writeFileSync(genPdfPath, genBuf);
    // Keep Phase 2.2 folder in sync for existing acceptance tests
    ensureDir(path.join(OUT_LEGACY, 'production'));
    fs.writeFileSync(path.join(OUT_LEGACY, 'production', `${fmt.variant}-production.pdf`), genBuf);

    const refPath = path.join(REF_DIR, fmt.ref);
    const refBuf = fs.readFileSync(refPath);
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

    // Phase 2.5: Draft / Draft-2 visual pages only after branding preflight (already gated).
    const isDraftVisual = fmt.variant === 'draft' || fmt.variant === 'draft2';
    if (isDraftVisual && !brandingPreflight.gatePass) {
      entry.summary = { skippedVisualCompare: true, reason: 'branding_preflight_failed' };
      manifest.formats.push(entry);
      continue;
    }

    let worst = 0;
    for (const p of fmt.pages) {
      if (p > refMeta.pageCount || p > genMeta.pageCount) continue;
      const refR = path.join(OUT, 'rasters', `${fmt.variant}-ref-p${p}.png`);
      const genR = path.join(OUT, 'rasters', `${fmt.variant}-gen-p${p}.png`);
      const refInfo = await rasterizeReference(refBuf, refPath, p, refR);
      await rasterizePdfjs(genBuf, p, genR);
      const diffPath = path.join(OUT, 'diffs', `${fmt.variant}-p${p}-diff.png`);
      const overlayPath = path.join(OUT, 'overlays', `${fmt.variant}-p${p}-overlay.png`);
      const cmp = comparePair(refR, genR, diffPath, overlayPath);
      worst = Math.max(worst, cmp.mismatchPct);
      const sbs = path.join(OUT, 'side-by-side', `${fmt.variant}-p${p}-sbs.png`);
      await sideBySide(refR, genR, sbs, `Fresa ref p${p} (${refInfo.engine})`, `FN production p${p}`);

      const refPage = refMeta.pages[p - 1];
      const genPage = genMeta.pages[p - 1];
      entry.pages.push({
        page: p,
        mismatchPct: cmp.mismatchPct,
        similarityPct: cmp.similarityPct,
        inkRef: cmp.inkRef,
        inkGen: cmp.inkGen,
        refRasterEngine: refInfo.engine,
        mediaBoxMatch:
          Math.abs(refPage.widthPt - genPage.widthPt) <= 2 &&
          Math.abs(refPage.heightPt - genPage.heightPt) <= 2,
        sideBySide: path.relative(root, sbs).replace(/\\/g, '/'),
        diff: path.relative(root, diffPath).replace(/\\/g, '/'),
        overlay: path.relative(root, overlayPath).replace(/\\/g, '/'),
        refRaster: path.relative(root, refR).replace(/\\/g, '/'),
        genRaster: path.relative(root, genR).replace(/\\/g, '/'),
      });

      // Mirror key SBS into legacy folder for phase2_3 tests
      ensureDir(path.join(OUT_LEGACY, 'side-by-side'));
      fs.copyFileSync(sbs, path.join(OUT_LEGACY, 'side-by-side', `${fmt.variant}-p${p}-sbs.png`));
    }

    entry.summary = {
      pageCountRef: refMeta.pageCount,
      pageCountGen: genMeta.pageCount,
      pageCountMatch: refMeta.pageCount === genMeta.pageCount,
      mediaBoxMatch: entry.pages.every((pg) => pg.mediaBoxMatch),
      worstMismatchPct: worst,
      productionInkGen: entry.pages[0]?.inkGen,
      referenceInkRef: entry.pages[0]?.inkRef,
      refRasterEngine: entry.pages[0]?.refRasterEngine,
    };
    console.log(
      `  pages ${refMeta.pageCount}/${genMeta.pageCount} mismatch=${worst}% ink gen=${entry.summary.productionInkGen} refEngine=${entry.summary.refRasterEngine}`,
    );
    manifest.formats.push(entry);
  }

  // Original underlay ON/OFF modes
  for (const fmt of FORMATS.filter((f) => f.sparse)) {
    for (const showUnderlay of [true, false]) {
      const mode = showUnderlay ? 'digital-underlay' : 'physical-sparse';
      console.log('[p24]', fmt.variant, mode);
      const gen = await page.evaluate(
        async ({ code, showUnderlay: su }) => window.__HAWB_P22.generate(code, undefined, { showUnderlay: su }),
        { code: fmt.code, showUnderlay },
      );
      if (!gen?.ok || !gen.base64) continue;
      const genBuf = Buffer.from(gen.base64, 'base64');
      const pdfPath = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}.pdf`);
      fs.writeFileSync(pdfPath, genBuf);
      const refPath = path.join(REF_DIR, fmt.ref);
      const refBuf = fs.readFileSync(refPath);
      const refR = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}-ref.png`);
      const genR = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}-gen.png`);
      const refInfo = await rasterizeReference(refBuf, refPath, 1, refR);
      await rasterizePdfjs(genBuf, 1, genR);
      const diffPath = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}-diff.png`);
      const overlayPath = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}-overlay.png`);
      const cmp = comparePair(refR, genR, diffPath, overlayPath);
      const sbs = path.join(OUT, 'original-modes', `${fmt.variant}-${mode}-sbs.png`);
      await sideBySide(refR, genR, sbs, `Fresa sparse (${refInfo.engine})`, `FN ${mode}`);
      manifest.originalModes.push({
        variant: fmt.variant,
        mode,
        showUnderlay,
        mismatchPct: cmp.mismatchPct,
        inkRef: cmp.inkRef,
        inkGen: cmp.inkGen,
        refRasterEngine: refInfo.engine,
        productionPdf: path.relative(root, pdfPath).replace(/\\/g, '/'),
        sideBySide: path.relative(root, sbs).replace(/\\/g, '/'),
        note: showUnderlay
          ? 'Digital preview with neutral underlay — expect higher ink vs sparse Fresa'
          : 'Physical stationery mode — sparse overlay only; apples-to-apples vs Fresa sparse',
      });
    }
  }

  // Draft-1 nine-page investigation
  const d1Prod = path.join(OUT, 'production', 'draft1-production.pdf');
  const d1Ref = path.join(REF_DIR, 'hawb-draft-report-format-1.pdf');
  const d1ProdFp = await fingerprintPdfPages(fs.readFileSync(d1Prod));
  const d1RefFp = await fingerprintPdfPages(fs.readFileSync(d1Ref));
  const prodUnique = new Set(d1ProdFp.map((f) => f.hash)).size;
  const refUnique = new Set(d1RefFp.map((f) => f.hash)).size;
  manifest.draft1CopyInvestigation = {
    referencePages: d1RefFp.length,
    productionPages: d1ProdFp.length,
    pageCountMatch: d1RefFp.length === d1ProdFp.length && d1ProdFp.length === 9,
    referenceUniqueTextHashes: refUnique,
    productionUniqueTextHashes: prodUnique,
    productionFingerprints: d1ProdFp,
    referenceFingerprints: d1RefFp.slice(0, 3),
    methodology: [
      'Fresa Draft-1 is a filled nine-page HOUSE AWB sample (labels + demo data), not blank stationery.',
      'Low pdfjs ink on some pages is form-art / font rendering — not absence of content (text items exist).',
      'Production emits 9 intentional identical faces differing by COPY FACE n/9 banner only.',
      'Gate acceptance on MediaBox, page count=9, notify, copy banners — not raw pixel % alone.',
      'appendCustomerTerms=false in harness prevents unintended pagination past 9.',
    ],
    conclusion:
      d1ProdFp.length === 9 && prodUnique <= 2
        ? 'PASS copy-set semantics: nine pages, near-identical faces'
        : 'REVIEW copy-set fingerprints',
  };
} finally {
  await browser.close();
  vite.stop();
}

const manifestPath = path.join(OUT, 'acceptance-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(OUT_LEGACY, 'fidelity-manifest.json'), JSON.stringify({
  generatedAt: manifest.generatedAt,
  methodology: manifest.methodology,
  formats: manifest.formats,
  draft1CopyInvestigation: manifest.draft1CopyInvestigation,
}, null, 2));

console.log('Wrote', path.relative(root, manifestPath));
console.log('Original modes:', manifest.originalModes.length);
console.log('Draft-1:', manifest.draft1CopyInvestigation?.conclusion);
for (const f of manifest.formats) {
  console.log(f.variant, f.summary);
}

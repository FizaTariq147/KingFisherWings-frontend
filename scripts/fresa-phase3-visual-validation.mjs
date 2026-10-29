/**
 * Phase 3 — Visual validation pilot (Fresa reference PDF ↔ Freightnest layout PDF).
 *
 * - Does not modify production layouts / renderer.
 * - Uses catalog demo data (documented) via generateCatalogLayoutPdf.
 * - Logo region masked only in similarity score.
 *
 * Usage: node scripts/fresa-phase3-visual-validation.mjs
 * Optional: --limit=N  --codes=CODE1,CODE2
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PDFDocument } from 'pdf-lib';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'tmp/fresa-references');
const compareRoot = path.join(outRoot, 'phase3-comparisons');
const harnessDir = path.join(root, 'scripts/fresa-phase3');
const HARNESS_URL = 'http://127.0.0.1:5199/';
const SCALE = 2;

/** Top-left logo exclusion (CSS ~ h-11 logo + padding), at raster scale. */
const LOGO_MASK = { x: 16 * SCALE, y: 12 * SCALE, w: 200 * SCALE, h: 56 * SCALE };

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const codesArg = args.find((a) => a.startsWith('--codes='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : 18;
const ONLY_CODES = codesArg
  ? new Set(codesArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean))
  : null;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function keySig(row) {
  return `${row.localStore || ''}|${String(row.localBlockSignature || '')
    .split('>')
    .slice(0, 5)
    .join('>')}`;
}

/** Structurally diverse high-confidence PDF matches only (no ambiguous). */
function selectPilot(mappings) {
  const matched = mappings.filter(
    (x) =>
      x.matchStatus === 'matched' &&
      x.fileType === 'pdf' &&
      x.referenceAccess === 'downloaded' &&
      x.referencePath &&
      fs.existsSync(path.join(root, x.referencePath)),
  );

  if (ONLY_CODES) {
    const seen = new Set();
    const uniq = [];
    for (const m of matched) {
      if (!ONLY_CODES.has(m.localCode) || seen.has(m.localCode)) continue;
      seen.add(m.localCode);
      uniq.push(m);
    }
    return uniq.slice(0, LIMIT);
  }

  const prefer = [
    'invoice',
    'hbl_sea',
    'hawb_air',
    'arrival_notice',
    'delivery_order',
    'quotation',
    'accounts',
    'ops_list',
    'other',
  ];
  const used = new Set();
  const pilot = [];

  const pushUnique = (row) => {
    const k = keySig(row);
    if (used.has(k)) return false;
    used.add(k);
    pilot.push(row);
    return true;
  };

  // Prefer one true HBL draft early.
  const hbl = matched.find((m) => m.localCode === 'HBL_DRAFT_REPORT_FORMAT_11');
  if (hbl) pushUnique(hbl);

  for (const cat of prefer) {
    const cands = matched
      .filter((x) => x.category === cat)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    let added = 0;
    const maxForCat = cat === 'invoice' || cat === 'hbl_sea' ? 3 : 2;
    for (const row of cands) {
      if (pilot.length >= LIMIT) break;
      if (pushUnique(row)) added += 1;
      if (added >= maxForCat) break;
    }
  }

  for (const row of matched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))) {
    if (pilot.length >= LIMIT) break;
    pushUnique(row);
  }

  return pilot.slice(0, LIMIT);
}

async function waitForHarness(page, vite, timeoutMs = 180_000) {
  const start = Date.now();
  let lastErr = '';
  while (Date.now() - start < timeoutMs) {
    if (vite.child.exitCode != null) {
      throw new Error(
        `Phase 3 Vite exited early (code ${vite.child.exitCode}). Log:\n${vite.getLog()}`,
      );
    }
    try {
      await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      await page.waitForFunction(() => window.__FRESA_PHASE3_READY === true, null, {
        timeout: 20_000,
      });
      return;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
      await sleep(2000);
    }
  }
  throw new Error(
    `Phase 3 harness not ready at ${HARNESS_URL}. Last error: ${lastErr}\nVite log:\n${vite.getLog()}`,
  );
}

function ensureRolldownBinding() {
  const nestedDir = path.join(root, 'node_modules/vite/node_modules/@rolldown');
  const nestedBinding = path.join(nestedDir, 'binding-win32-x64-msvc');
  const topBinding = path.join(root, 'node_modules/@rolldown/binding-win32-x64-msvc');
  const nestedPkg = path.join(nestedBinding, 'package.json');
  const want = '1.0.3';
  try {
    if (fs.existsSync(nestedPkg)) {
      const ver = JSON.parse(fs.readFileSync(nestedPkg, 'utf8')).version;
      if (ver === want) return;
    }
  } catch {
    /* repair below */
  }
  if (!fs.existsSync(topBinding)) {
    console.warn('[phase3] Missing @rolldown/binding-win32-x64-msvc — Vite may fail to start.');
    return;
  }
  fs.mkdirSync(nestedDir, { recursive: true });
  fs.rmSync(nestedBinding, { recursive: true, force: true });
  fs.cpSync(topBinding, nestedBinding, { recursive: true });
  console.log('[phase3] Restored vite nested Rolldown Windows binding');
}

function startVite() {
  ensureRolldownBinding();
  const viteBin = path.join(root, 'node_modules/vite/bin/vite.js');
  const child = spawn(
    process.execPath,
    [viteBin, '--config', path.join(harnessDir, 'vite.config.mjs')],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' },
      shell: false,
    },
  );
  let log = '';
  child.stdout.on('data', (d) => {
    log += d.toString();
  });
  child.stderr.on('data', (d) => {
    log += d.toString();
  });
  return {
    child,
    getLog: () => log,
    stop: () => {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        } else {
          child.kill('SIGTERM');
        }
      } catch {
        /* ignore */
      }
    },
  };
}

function decodePng(base64) {
  return PNG.sync.read(Buffer.from(base64, 'base64'));
}

function encodePng(png) {
  return PNG.sync.write(png);
}

function applyLogoMask(img) {
  const { x, y, w, h } = LOGO_MASK;
  for (let py = y; py < Math.min(img.height, y + h); py += 1) {
    for (let px = x; px < Math.min(img.width, x + w); px += 1) {
      const i = (img.width * py + px) << 2;
      img.data[i] = 255;
      img.data[i + 1] = 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
}

function fitToSize(src, width, height) {
  if (src.width === width && src.height === height) return src;
  const out = new PNG({ width, height });
  out.data.fill(255);
  const copyW = Math.min(src.width, width);
  const copyH = Math.min(src.height, height);
  for (let y = 0; y < copyH; y += 1) {
    for (let x = 0; x < copyW; x += 1) {
      const si = (src.width * y + x) << 2;
      const di = (width * y + x) << 2;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}

function sideBySide(a, b) {
  const h = Math.max(a.height, b.height);
  const out = new PNG({ width: a.width + b.width + 8, height: h });
  out.data.fill(240);
  const blit = (src, ox) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (src.width * y + x) << 2;
        const di = (out.width * y + (x + ox)) << 2;
        out.data[di] = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = src.data[si + 3];
      }
    }
  };
  blit(a, 0);
  blit(b, a.width + 8);
  return out;
}

function overlayBlend(a, b) {
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);
  const A = fitToSize(a, w, h);
  const B = fitToSize(b, w, h);
  const out = new PNG({ width: w, height: h });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = Math.round(A.data[i] * 0.5 + B.data[i] * 0.5);
    out.data[i + 1] = Math.round(A.data[i + 1] * 0.45 + B.data[i + 1] * 0.55);
    out.data[i + 2] = Math.round(A.data[i + 2] * 0.55 + B.data[i + 2] * 0.45);
    out.data[i + 3] = 255;
  }
  return out;
}

function comparePages(refPng, fnPng) {
  const width = Math.max(refPng.width, fnPng.width);
  const height = Math.max(refPng.height, fnPng.height);
  const a = fitToSize(refPng, width, height);
  const b = fitToSize(fnPng, width, height);
  const aMasked = fitToSize(refPng, width, height);
  const bMasked = fitToSize(fnPng, width, height);
  applyLogoMask(aMasked);
  applyLogoMask(bMasked);

  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(aMasked.data, bMasked.data, diff.data, width, height, {
    threshold: 0.12,
    includeAA: true,
  });
  const total = width * height;
  const similarity = total > 0 ? 1 - mismatched / total : 0;

  const dimMismatch =
    refPng.width !== fnPng.width || refPng.height !== fnPng.height
      ? {
          reference: { width: refPng.width, height: refPng.height },
          freightnest: { width: fnPng.width, height: fnPng.height },
        }
      : null;

  return {
    width,
    height,
    mismatchedPixels: mismatched,
    totalPixels: total,
    similarity,
    dimensionMismatch: dimMismatch,
    diffPng: diff,
    sideBySidePng: sideBySide(a, b),
    overlayPng: overlayBlend(a, b),
  };
}

async function pdfPageCount(buf) {
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function pdfPageMeta(buf) {
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pages = doc.getPages();
  return {
    pageCount: pages.length,
    pages: pages.map((p, i) => {
      const { width, height } = p.getSize();
      const rotation = p.getRotation().angle;
      const displayW = rotation % 180 === 90 ? height : width;
      const displayH = rotation % 180 === 90 ? width : height;
      return {
        page: i + 1,
        mediaBox: { width: +width.toFixed(2), height: +height.toFixed(2) },
        rotation,
        displayOrientation: displayW >= displayH ? 'landscape' : 'portrait',
        displaySize: { width: +displayW.toFixed(2), height: +displayH.toFixed(2) },
      };
    }),
  };
}

/** Keep first N pages when KF appends T&C beyond the reference. */
async function truncatePdf(buf, maxPages) {
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const total = src.getPageCount();
  if (total <= maxPages) return { bytes: buf, truncated: false, originalPages: total };
  const out = await PDFDocument.create();
  const pages = await out.copyPages(
    src,
    Array.from({ length: maxPages }, (_, i) => i),
  );
  for (const p of pages) out.addPage(p);
  return {
    bytes: Buffer.from(await out.save()),
    truncated: true,
    originalPages: total,
  };
}

function verdictFrom(row) {
  if (row.renderStatus !== 'ok' || row.compareStatus !== 'ok') return 'blocked';
  if (row.manualReviewRequired) return 'needs_manual_review';
  const sim = row.metrics?.meanSimilarity;
  if (sim == null) return 'needs_manual_review';
  if (sim >= 0.97 && !row.metrics?.pageCountMismatch) return 'close_layout_candidate';
  if (sim >= 0.9) return 'partial_match_review';
  return 'significant_mismatch';
}

function toMd(results) {
  const lines = [
    '# Phase 3 — Visual validation (pilot)',
    '',
    `Generated: ${results.generatedAt}`,
    '',
    '| Metric | Value |',
    '|--------|------:|',
    `| Pilot size | ${results.pilotSize} |`,
    `| Rendered OK | ${results.counts.renderedOk} |`,
    `| Compare OK | ${results.counts.compareOk} |`,
    `| Blocked / failed | ${results.counts.blocked} |`,
    `| Needs manual review | ${results.counts.needsManualReview} |`,
    '',
    '## Method notes',
    '',
    ...results.methodNotes.map((n) => `- ${n}`),
    '',
    '## Pilot results',
    '',
  ];

  for (const r of results.reports) {
    lines.push(`### ${r.formatCode}`);
    lines.push('');
    lines.push(`- Reference: \`${r.referencePath}\``);
    lines.push(`- Local layout store: \`${r.localStore}\``);
    lines.push(`- Category: ${r.category}`);
    lines.push(`- Render: **${r.renderStatus}**${r.renderError ? ` — ${r.renderError}` : ''}`);
    lines.push(`- Compare: **${r.compareStatus}**${r.compareError ? ` — ${r.compareError}` : ''}`);
    lines.push(
      `- Pages ref/fn/compared: ${r.referencePageCount ?? '—'} / ${r.freightnestPageCount ?? '—'} / ${r.comparedPageCount ?? '—'}`,
    );
    if (r.metrics) {
      lines.push(
        `- Mean similarity (logo masked): **${(r.metrics.meanSimilarity * 100).toFixed(2)}%**`,
      );
      lines.push(`- Verdict: **${r.verdict}** (score alone ≠ fidelity claim)`);
    } else {
      lines.push(`- Verdict: **${r.verdict}**`);
    }
    if (r.dataNotes?.length) {
      for (const n of r.dataNotes) lines.push(`- Data note: ${n}`);
    }
    if (r.differences?.length) {
      for (const d of r.differences.slice(0, 8)) lines.push(`- Diff: ${d}`);
    }
    if (r.outputDir) lines.push(`- Artifacts: \`${r.outputDir}\``);
    lines.push('');
  }

  if (results.recommendedCorrections?.length) {
    lines.push('## Recommended corrections (before expanding pilot)');
    lines.push('');
    for (const c of results.recommendedCorrections) lines.push(`- ${c}`);
    lines.push('');
  }

  lines.push('Full detail: `PHASE3_VISUAL_RESULTS.json`');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  ensureDir(compareRoot);
  const mapping = readJson(path.join(outRoot, 'FREIGHTNEST_REFERENCE_MAPPING.json'));
  const pilot = selectPilot(mapping.mappings || []);
  if (!pilot.length) {
    throw new Error('No pilot reports selected — check mapping + reference PDF paths.');
  }

  console.log(`[phase3] Pilot size: ${pilot.length}`);
  const vite = startVite();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const reports = [];
  try {
    await waitForHarness(page, vite);
    console.log('[phase3] Harness ready');

    for (const row of pilot) {
      const code = row.localCode;
      const slug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
      const dir = path.join(compareRoot, slug);
      ensureDir(dir);
      console.log(`[phase3] ${code}`);

      const entry = {
        formatCode: code,
        referenceName: row.referenceName,
        category: row.category,
        matchStatus: row.matchStatus,
        matchScore: row.matchScore,
        localStore: row.localStore,
        localName: row.localName,
        localBlockSignature: row.localBlockSignature,
        referencePath: row.referencePath,
        outputDir: path.relative(root, dir).replace(/\\/g, '/'),
        renderStatus: 'pending',
        compareStatus: 'pending',
        dataNotes: [
          'Freightnest PDF generated with catalog demo / DEMO_LINES (entityBound=false).',
          'Reference PDF uses Fresa sample shipment/invoice values — content text is not expected to match.',
          'Only layout geometry/chrome should be judged; textual sample mismatches are recorded separately.',
        ],
        differences: [],
        manualReviewRequired: true,
      };

      try {
        const refAbs = path.join(root, row.referencePath);
        const refBuf = fs.readFileSync(refAbs);
        fs.writeFileSync(path.join(dir, 'reference.pdf'), refBuf);
        const refMeta = await pdfPageMeta(refBuf);
        entry.referencePageCount = refMeta.pageCount;
        entry.referencePageMeta = refMeta.pages;

        const gen = await page.evaluate(async (formatCode) => {
          // Layout-only PDF for geometry compare (Fresa samples lack KF T&C pages).
          return window.__FRESA_PHASE3.generate(formatCode, { appendCustomerTerms: false });
        }, code);

        // Product-default PDF (heuristic / layout.appendCustomerTerms — no override).
        const genDefault = await page.evaluate(async (formatCode) => {
          const layout = window.__FRESA_PHASE3.hasLayout(formatCode);
          if (!layout) return { ok: false };
          // Call generateCatalogLayoutPdf path without forcing false/true:
          // temporarily use override only when we need layout-only; default uses heuristics.
          // Implemented below via a second generate API that omits appendCustomerTerms.
          return window.__FRESA_PHASE3.generateDefault
            ? window.__FRESA_PHASE3.generateDefault(formatCode)
            : window.__FRESA_PHASE3.generate(formatCode, {});
        }, code);
        if (genDefault?.ok && genDefault.base64) {
          const defaultBuf = Buffer.from(genDefault.base64, 'base64');
          fs.writeFileSync(path.join(dir, 'freightnest-product-default.pdf'), defaultBuf);
          entry.freightnestPageCountProductDefault = await pdfPageCount(defaultBuf);
          entry.dataNotes.push(
            `Product-default page count (heuristic T&C): ${entry.freightnestPageCountProductDefault}; layout-only compare uses appendCustomerTerms=false.`,
          );
        }

        if (!gen?.ok || !gen.base64) {
          entry.renderStatus = 'failed';
          entry.renderError = gen?.error || 'Unknown generate failure';
          entry.compareStatus = 'skipped';
          entry.verdict = 'blocked';
          reports.push(entry);
          continue;
        }

        let fnBuf = Buffer.from(gen.base64, 'base64');
        fs.writeFileSync(path.join(dir, 'freightnest-full.pdf'), fnBuf);
        const fnMeta = await pdfPageMeta(fnBuf);
        entry.freightnestPageCount = fnMeta.pageCount;
        entry.freightnestPageMeta = fnMeta.pages;
        entry.freightnestName = gen.name;
        entry.paper = gen.paper;
        entry.usedDemoData = Boolean(gen.usedDemoData);
        entry.contentDifferenceNotes = [
          'Catalog demo / DEMO_LINES vs Fresa sample field values — content text is not comparable.',
          'MAWB_DRAFT_REPORT_FORMAT: Fresa reference is a multi-copy IATA set (9 pages); Freightnest layout is a single sheet (evidence-only; not fabricated).',
        ];
        entry.renderStatus = 'ok';

        if (entry.freightnestPageCount > entry.referencePageCount) {
          const trunc = await truncatePdf(fnBuf, entry.referencePageCount);
          if (trunc.truncated) {
            fnBuf = Buffer.from(trunc.bytes);
            fs.writeFileSync(path.join(dir, 'freightnest-compared.pdf'), fnBuf);
            entry.differences.push(
              `Freightnest had ${trunc.originalPages} pages vs reference ${entry.referencePageCount}; compared first ${entry.referencePageCount} only (likely appended KingFisher T&C).`,
            );
            entry.termsPagesLikelyAppended = trunc.originalPages - entry.referencePageCount;
          }
        } else {
          fs.writeFileSync(path.join(dir, 'freightnest-compared.pdf'), fnBuf);
        }

        if (entry.freightnestPageCount < entry.referencePageCount) {
          entry.differences.push(
            `Freightnest page count (${entry.freightnestPageCount}) < reference (${entry.referencePageCount}).`,
          );
        }

        const refB64 = refBuf.toString('base64');
        const fnB64 = fnBuf.toString('base64');

        const refRaster = await page.evaluate(
          async ({ b64, scale }) => window.__FRESA_PHASE3.rasterizePdf(b64, scale),
          { b64: refB64, scale: SCALE },
        );
        const fnRaster = await page.evaluate(
          async ({ b64, scale }) => window.__FRESA_PHASE3.rasterizePdf(b64, scale),
          { b64: fnB64, scale: SCALE },
        );

        if (!refRaster?.ok || !fnRaster?.ok) {
          entry.compareStatus = 'failed';
          entry.compareError = `Rasterize failed — ref: ${refRaster?.error || 'ok'}; fn: ${fnRaster?.error || 'ok'}`;
          entry.verdict = 'blocked';
          reports.push(entry);
          continue;
        }

        entry.comparedPageCount = Math.min(refRaster.pageCount, fnRaster.pageCount);
        const pageMetrics = [];
        for (let i = 0; i < entry.comparedPageCount; i += 1) {
          const rp = refRaster.pages[i];
          const fp = fnRaster.pages[i];
          fs.writeFileSync(path.join(dir, `reference-page-${i + 1}.png`), Buffer.from(rp.pngBase64, 'base64'));
          fs.writeFileSync(path.join(dir, `freightnest-page-${i + 1}.png`), Buffer.from(fp.pngBase64, 'base64'));

          const cmp = comparePages(decodePng(rp.pngBase64), decodePng(fp.pngBase64));
          fs.writeFileSync(path.join(dir, `diff-page-${i + 1}.png`), encodePng(cmp.diffPng));
          fs.writeFileSync(path.join(dir, `side-by-side-page-${i + 1}.png`), encodePng(cmp.sideBySidePng));
          fs.writeFileSync(path.join(dir, `overlay-page-${i + 1}.png`), encodePng(cmp.overlayPng));

          pageMetrics.push({
            page: i + 1,
            similarity: cmp.similarity,
            mismatchedPixels: cmp.mismatchedPixels,
            totalPixels: cmp.totalPixels,
            referenceSize: { width: rp.width, height: rp.height },
            freightnestSize: { width: fp.width, height: fp.height },
            dimensionMismatch: cmp.dimensionMismatch,
          });

          if (cmp.dimensionMismatch) {
            entry.differences.push(
              `Page ${i + 1} dimension mismatch: ref ${rp.width}x${rp.height} vs fn ${fp.width}x${fp.height}`,
            );
          }
          if (cmp.similarity < 0.97) {
            entry.differences.push(
              `Page ${i + 1} similarity ${(cmp.similarity * 100).toFixed(2)}% after logo mask (sample data + layout deltas).`,
            );
          }
        }

        const meanSimilarity =
          pageMetrics.reduce((s, p) => s + p.similarity, 0) / Math.max(1, pageMetrics.length);

        entry.metrics = {
          meanSimilarity,
          pageCountMismatch: entry.referencePageCount !== entry.freightnestPageCount,
          logoMask: LOGO_MASK,
          pages: pageMetrics,
        };
        entry.compareStatus = 'ok';
        entry.manualReviewRequired = meanSimilarity < 0.985 || entry.metrics.pageCountMismatch;
        entry.verdict = verdictFrom(entry);
      } catch (err) {
        entry.renderStatus = entry.renderStatus === 'ok' ? 'ok' : 'failed';
        entry.compareStatus = 'failed';
        entry.compareError = err instanceof Error ? err.message : String(err);
        entry.verdict = 'blocked';
      }

      reports.push(entry);
      writeJson(path.join(dir, 'result.json'), entry);
    }
  } finally {
    await browser.close().catch(() => {});
    vite.stop();
  }

  const counts = {
    renderedOk: reports.filter((r) => r.renderStatus === 'ok').length,
    compareOk: reports.filter((r) => r.compareStatus === 'ok').length,
    blocked: reports.filter((r) => r.verdict === 'blocked').length,
    needsManualReview: reports.filter((r) => r.manualReviewRequired).length,
  };

  const recommendedCorrections = [];
  const failedRenders = reports.filter((r) => r.renderStatus !== 'ok');
  if (failedRenders.length) {
    recommendedCorrections.push(
      `Fix PDF generation failures for: ${failedRenders.map((r) => r.formatCode).join(', ')}.`,
    );
  }
  const lowSim = reports
    .filter((r) => r.metrics && r.metrics.meanSimilarity < 0.9)
    .sort((a, b) => a.metrics.meanSimilarity - b.metrics.meanSimilarity);
  if (lowSim.length) {
    recommendedCorrections.push(
      `Inspect shared renderer / JSON shells for lowest similarity pilots: ${lowSim
        .slice(0, 5)
        .map((r) => `${r.formatCode} (${(r.metrics.meanSimilarity * 100).toFixed(1)}%)`)
        .join(', ')}.`,
    );
  }
  const pageMismatches = reports.filter((r) => r.metrics?.pageCountMismatch);
  if (pageMismatches.length) {
    recommendedCorrections.push(
      `Reconcile pagination / T&C append behavior for ${pageMismatches.length} formats before trusting page-level diffs.`,
    );
  }
  recommendedCorrections.push(
    'Do not treat similarity % as exact fidelity — re-check side-by-side PNGs; sample text/logo differ by design.',
  );
  recommendedCorrections.push(
    'Phase 4 should fix shared shell defects first (identical blockSignature clusters from Phase 2), then batch layout edits with re-run of this script.',
  );

  const results = {
    generatedAt: new Date().toISOString(),
    phase: 3,
    mode: 'pilot',
    pilotSize: reports.length,
    harnessUrl: HARNESS_URL,
    comparisonDir: path.relative(root, compareRoot).replace(/\\/g, '/'),
    counts,
    methodNotes: [
      'Freightnest PDFs produced via generateCatalogLayoutPdf in an isolated Vite harness (Playwright) — same React + html2canvas + jsPDF path as the report catalog.',
      'Controlled sample data = layout demo fields + DEMO_LINES; not live entity data and not Fresa sample values.',
      'Reference PDFs rasterized with pdfjs-dist; compared with pixelmatch (threshold 0.12).',
      `Logo exclusion mask applied only to score: x=${LOGO_MASK.x}, y=${LOGO_MASK.y}, w=${LOGO_MASK.w}, h=${LOGO_MASK.h} (scale=${SCALE}).`,
      'When Freightnest page count exceeds the reference, only the first N pages are compared (extra pages often KingFisher T&C).',
      'Similarity scores are diagnostic only — never a claim of 100% visual fidelity.',
    ],
    recommendedCorrections,
    reports,
    deps: {
      playwright: require('playwright/package.json').version,
      'pdfjs-dist': require('pdfjs-dist/package.json').version,
      pixelmatch: require('pixelmatch/package.json').version,
      pngjs: require('pngjs/package.json').version,
      'pdf-lib': require('pdf-lib/package.json').version,
    },
  };

  const jsonPath = path.join(outRoot, 'PHASE3_VISUAL_RESULTS.json');
  const mdPath = path.join(outRoot, 'PHASE3_VISUAL_RESULTS.md');
  writeJson(jsonPath, results);
  fs.writeFileSync(mdPath, toMd(results));

  console.log(
    JSON.stringify(
      {
        pilotSize: results.pilotSize,
        counts: results.counts,
        jsonPath: path.relative(root, jsonPath),
        mdPath: path.relative(root, mdPath),
        comparisonDir: results.comparisonDir,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('[phase3] FATAL', err);
  process.exit(1);
});

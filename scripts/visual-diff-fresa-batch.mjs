/**
 * Real page-image visual-diff: app pipeline PDF vs Fresa reference PDF.
 *
 * Requires: running Vite (PLAYWRIGHT_BASE_URL, default http://localhost:5173),
 * Playwright browsers, pixelmatch + pngjs.
 *
 * Usage:
 *   node scripts/visual-diff-fresa-batch.mjs
 *   node scripts/visual-diff-fresa-batch.mjs --codes=INVOICE_REPORT_FORMAT_1,HAWB_DRAFT_REPORT_FORMAT
 *
 * Does NOT claim pass without writing comparison images + metrics.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import simplePixelmatch from './lib/simplePixelmatch.mjs';

const require = createRequire(import.meta.url);
const PNG = require('pngjs').PNG;
const pixelmatch = simplePixelmatch;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const outRoot = path.join(root, 'tmp/fresa-visual-diff');
const rasterHtml = path.join(root, 'scripts/visual-diff-assets/pdf-raster-page.html');
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

const DEFAULT_BATCH = [
  {
    code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    refHint: /invoice-report-format-1/i,
  },
  {
    code: 'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
    refHint: /invoice-report-format-3/i,
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT',
    refHint: /hawb-draft-report-format\.pdf$/i,
  },
  {
    code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
    refHint: /hbl-draft-report-fomat-jasper|hbl-draft-report-format-jasper/i,
  },
];

function parseCodesArg() {
  const arg = process.argv.find((a) => a.startsWith('--codes='));
  if (!arg) return null;
  return arg
    .slice('--codes='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function findReference(inv, code, hint) {
  const reports = inv.reports || [];
  const byCode = reports.filter(
    (r) =>
      r.localCode === code &&
      r.accessStatus === 'downloaded' &&
      r.downloadedPath &&
      /\.pdf$/i.test(r.downloadedPath),
  );
  if (byCode.length) {
    const preferred = hint
      ? byCode.find((r) => hint.test(r.downloadedPath) || (r.candidateUrls || []).some((u) => hint.test(u)))
      : null;
    return preferred || byCode[0];
  }
  // Fallback: path match under pdfs dir
  const pdfDir = path.join(root, 'tmp/fresa-references/pdfs');
  if (!fs.existsSync(pdfDir)) return null;
  const files = fs.readdirSync(pdfDir);
  const hit = files.find((f) => (hint ? hint.test(f) : false));
  if (!hit) return null;
  return {
    localCode: code,
    downloadedPath: path.join('tmp/fresa-references/pdfs', hit),
    accessStatus: 'downloaded',
    name: hit,
  };
}

function resolveRefAbs(row) {
  if (!row?.downloadedPath) return null;
  const p = path.isAbsolute(row.downloadedPath)
    ? row.downloadedPath
    : path.join(root, row.downloadedPath);
  return fs.existsSync(p) ? p : null;
}

async function waitForVite() {
  const url = baseURL.replace(/\/$/, '') + '/dev/report-visual-diff';
  for (let i = 0; i < 40; i += 1) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else reject(new Error(`status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(
    `Vite not reachable at ${baseURL}. Start with: npm run dev`,
  );
}

async function generateAppPdf(browser, code) {
  const page = await browser.newPage();
  try {
    await page.goto(`${baseURL}/dev/report-visual-diff?code=${encodeURIComponent(code)}`, {
      waitUntil: 'networkidle',
      timeout: 120_000,
    });
    await page.waitForFunction(
      () => {
        const p = window.__KF_VISUAL_DIFF__;
        return p && (p.ok === true || p.ok === false);
      },
      undefined,
      { timeout: 180_000 },
    );
    const payload = await page.evaluate(() => window.__KF_VISUAL_DIFF__);
    if (!payload?.ok) {
      throw new Error(payload?.error || 'Harness failed');
    }
    return payload;
  } finally {
    await page.close();
  }
}

async function rasterizePdfBase64(browser, base64, pageNumber = 1, scale = 2) {
  const page = await browser.newPage();
  try {
    await page.goto(`file://${rasterHtml.replace(/\\/g, '/')}`, {
      waitUntil: 'load',
      timeout: 60_000,
    });
    const result = await page.evaluate(
      async ({ base64: b64, pageNumber: pn, scale: sc }) => {
        return window.renderPdfBytes(b64, pn, sc);
      },
      { base64, pageNumber, scale },
    );
    return result;
  } finally {
    await page.close();
  }
}

function dataUrlToPng(dataUrl) {
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return PNG.sync.read(Buffer.from(b64, 'base64'));
}

function comparePngs(imgA, imgB) {
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
  const a = new PNG({ width, height });
  const b = new PNG({ width, height });
  PNG.bitblt(imgA, a, 0, 0, imgA.width, imgA.height, 0, 0);
  PNG.bitblt(imgB, b, 0, 0, imgB.width, imgB.height, 0, 0);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.12,
    includeAA: false,
  });
  const total = width * height;
  return {
    width,
    height,
    mismatched,
    mismatchRatio: mismatched / total,
    diffPng: diff,
    sideBySide: stackSideBySide(a, b, diff),
  };
}

function stackSideBySide(a, b, diff) {
  const width = a.width * 3;
  const height = a.height;
  const out = new PNG({ width, height });
  PNG.bitblt(a, out, 0, 0, a.width, a.height, 0, 0);
  PNG.bitblt(b, out, 0, 0, b.width, b.height, a.width, 0);
  PNG.bitblt(diff, out, 0, 0, diff.width, diff.height, a.width * 2, 0);
  return out;
}

/** Pass threshold: branding/T&C differences expected — keep honest & strict-ish. */
const PASS_RATIO = Number(process.env.FRESA_VISUAL_PASS_RATIO || 0.08);

async function main() {
  ensureDir(outRoot);
  const inv = loadJson(path.join(dataDir, 'FRESA_REFERENCE_INVENTORY.json'));
  const codeFilter = parseCodesArg();
  const batch = codeFilter
    ? codeFilter.map((code) => ({
        code,
        refHint: DEFAULT_BATCH.find((b) => b.code === code)?.refHint || null,
      }))
    : DEFAULT_BATCH;

  await waitForVite();
  const browser = await chromium.launch({ headless: true });

  const passed = [];
  const failed = [];
  const skipped = [];
  const results = [];

  try {
    for (const item of batch) {
      const dir = path.join(outRoot, item.code);
      ensureDir(dir);
      const refRow = findReference(inv, item.code, item.refHint);
      const refAbs = resolveRefAbs(refRow);
      if (!refAbs) {
        const row = {
          code: item.code,
          status: 'skipped_no_reference',
          reason: 'No downloaded PDF reference matched',
        };
        skipped.push(row);
        results.push(row);
        continue;
      }

      // Skip known stubs (<10KB)
      const refSize = fs.statSync(refAbs).size;
      if (refSize < 10_000) {
        const row = {
          code: item.code,
          status: 'skipped_stub_reference',
          referencePath: path.relative(root, refAbs),
          byteSize: refSize,
        };
        skipped.push(row);
        results.push(row);
        continue;
      }

      let genPayload;
      try {
        genPayload = await generateAppPdf(browser, item.code);
      } catch (err) {
        const row = {
          code: item.code,
          status: 'failed_generate',
          error: err instanceof Error ? err.message : String(err),
          referencePath: path.relative(root, refAbs),
        };
        failed.push(row);
        results.push(row);
        continue;
      }

      const genPath = path.join(dir, 'generated.pdf');
      fs.writeFileSync(genPath, Buffer.from(genPayload.pdfBase64, 'base64'));
      fs.copyFileSync(refAbs, path.join(dir, 'reference.pdf'));

      const refB64 = fs.readFileSync(refAbs).toString('base64');
      let refRaster;
      let genRaster;
      try {
        refRaster = await rasterizePdfBase64(browser, refB64, 1, 2);
        genRaster = await rasterizePdfBase64(browser, genPayload.pdfBase64, 1, 2);
      } catch (err) {
        const row = {
          code: item.code,
          status: 'failed_rasterize',
          error: err instanceof Error ? err.message : String(err),
          referencePath: path.relative(root, refAbs),
          generatedPath: path.relative(root, genPath),
        };
        failed.push(row);
        results.push(row);
        continue;
      }

      fs.writeFileSync(
        path.join(dir, 'reference-page1.png'),
        Buffer.from(refRaster.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'),
      );
      fs.writeFileSync(
        path.join(dir, 'generated-page1.png'),
        Buffer.from(genRaster.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'),
      );

      const cmp = comparePngs(dataUrlToPng(refRaster.dataUrl), dataUrlToPng(genRaster.dataUrl));
      fs.writeFileSync(path.join(dir, 'diff-page1.png'), PNG.sync.write(cmp.diffPng));
      fs.writeFileSync(path.join(dir, 'side-by-side-page1.png'), PNG.sync.write(cmp.sideBySide));

      const pageMeta = {
        referencePages: refRaster.pageCount,
        generatedPages: genRaster.pageCount,
        referenceSize: { w: refRaster.width, h: refRaster.height },
        generatedSize: { w: genRaster.width, h: genRaster.height },
        pageCountMatch: refRaster.pageCount === genRaster.pageCount,
        dimensionDelta: {
          w: Math.abs(refRaster.width - genRaster.width),
          h: Math.abs(refRaster.height - genRaster.height),
        },
      };

      const pass =
        cmp.mismatchRatio <= PASS_RATIO &&
        pageMeta.dimensionDelta.w < 80 &&
        pageMeta.dimensionDelta.h < 120;

      const row = {
        code: item.code,
        status: pass ? 'passed' : 'failed_visual',
        referencePath: path.relative(root, refAbs),
        generatedPath: path.relative(root, genPath),
        comparisonDir: path.relative(root, dir),
        mismatchRatio: Number(cmp.mismatchRatio.toFixed(6)),
        mismatchedPixels: cmp.mismatched,
        passThreshold: PASS_RATIO,
        pageMeta,
        note: pass
          ? 'Within threshold (branding/T&C differences may remain).'
          : 'Layout differs from reference — do not claim Fresa fidelity.',
      };
      if (pass) passed.push(row);
      else failed.push(row);
      results.push(row);
      console.log(
        JSON.stringify({
          code: row.code,
          status: row.status,
          mismatchRatio: row.mismatchRatio,
        }),
      );
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseURL,
    passThreshold: PASS_RATIO,
    batchSize: batch.length,
    passed,
    failed,
    skipped,
    results,
    honesty:
      'Only entries in passed[] are visually verified. Structural uniqueness is irrelevant here.',
  };

  fs.writeFileSync(
    path.join(dataDir, 'FRESA_VISUAL_DIFF_MANIFEST.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outRoot, 'MANIFEST.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(
    JSON.stringify(
      {
        passed: passed.length,
        failed: failed.length,
        skipped: skipped.length,
        outRoot: path.relative(root, outRoot),
        manifest: 'src/features/reports/data/FRESA_VISUAL_DIFF_MANIFEST.json',
      },
      null,
      2,
    ),
  );

  // Non-zero if any failed_visual / failed_generate (skipped OK for batch tooling)
  if (failed.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

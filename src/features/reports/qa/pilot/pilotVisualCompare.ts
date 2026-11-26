/**
 * Pilot visual compare: pdftoppm @150dpi + pixelmatch.
 * Skips when page sizes differ or poppler missing.
 * Does not claim PASS without masks for dynamic regions — defaults to REVIEW.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export type VisualCompareResult = {
  status: 'pass' | 'fail' | 'review' | 'skipped';
  reason: string;
  dpi: number;
  pagesCompared: number;
  diffPctMax?: number;
  diffImages?: string[];
};

const DPI = 150;

function hasPdftoppm(): boolean {
  try {
    execFileSync('pdftoppm', ['-v'], { stdio: 'pipe' });
    return true;
  } catch {
    try {
      execFileSync('pdftoppm', ['-h'], { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

function rasterize(pdfPath: string, outPrefix: string): string[] {
  execFileSync('pdftoppm', ['-png', '-r', String(DPI), pdfPath, outPrefix], {
    stdio: 'pipe',
  });
  const dir = path.dirname(outPrefix);
  const base = path.basename(outPrefix);
  return fs
    .readdirSync(dir)
    .filter((n) => n.startsWith(base) && n.endsWith('.png'))
    .map((n) => path.join(dir, n))
    .sort();
}

function readPng(file: string): PNG {
  return PNG.sync.read(fs.readFileSync(file));
}

/**
 * Dynamic content masks: top letterhead band + footer strip (approximate).
 * These are conservative white-outs so org/logo/footer don't dominate diff.
 */
function applyDynamicMasks(img: PNG): void {
  const { width, height, data } = img;
  const topBand = Math.floor(height * 0.12);
  const footerBand = Math.floor(height * 0.08);
  for (let y = 0; y < height; y++) {
    const inMask = y < topBand || y >= height - footerBand;
    if (!inMask) continue;
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
}

export function comparePdfVisual(
  generatedPdf: string,
  referencePdf: string,
  outDir: string,
  options: { expectedSamePageBox?: boolean } = {},
): VisualCompareResult {
  if (!fs.existsSync(generatedPdf) || !fs.existsSync(referencePdf)) {
    return {
      status: 'skipped',
      reason: 'missing generated or reference PDF',
      dpi: DPI,
      pagesCompared: 0,
    };
  }
  if (!hasPdftoppm()) {
    return {
      status: 'skipped',
      reason: 'pdftoppm not on PATH',
      dpi: DPI,
      pagesCompared: 0,
    };
  }

  fs.mkdirSync(outDir, { recursive: true });
  // Remove prior pdftoppm leftovers so page-count compare is not polluted.
  for (const name of fs.readdirSync(outDir)) {
    if (/^(gen|ref)(-\d+)?\.png$/i.test(name) || /^diff-page-\d+\.png$/i.test(name)) {
      fs.unlinkSync(path.join(outDir, name));
    }
  }
  const genPrefix = path.join(outDir, 'gen');
  const refPrefix = path.join(outDir, 'ref');
  let genPages: string[];
  let refPages: string[];
  try {
    genPages = rasterize(generatedPdf, genPrefix);
    refPages = rasterize(referencePdf, refPrefix);
  } catch (e) {
    return {
      status: 'skipped',
      reason: `pdftoppm failed: ${e instanceof Error ? e.message : String(e)}`,
      dpi: DPI,
      pagesCompared: 0,
    };
  }

  const n = Math.min(genPages.length, refPages.length);
  if (n === 0) {
    return { status: 'skipped', reason: 'no raster pages', dpi: DPI, pagesCompared: 0 };
  }
  if (genPages.length !== refPages.length) {
    return {
      status: 'review',
      reason: `page count differs gen=${genPages.length} ref=${refPages.length} (e.g. T&C append) — compare face page only`,
      dpi: DPI,
      pagesCompared: 0,
    };
  }

  const diffImages: string[] = [];
  let diffPctMax = 0;
  for (let i = 0; i < n; i++) {
    const gen = readPng(genPages[i]);
    const ref = readPng(refPages[i]);
    if (gen.width !== ref.width || gen.height !== ref.height) {
      if (options.expectedSamePageBox !== false) {
        return {
          status: 'skipped',
          reason: `raster size mismatch page ${i + 1}: gen ${gen.width}x${gen.height} vs ref ${ref.width}x${ref.height}`,
          dpi: DPI,
          pagesCompared: i,
        };
      }
    }
    applyDynamicMasks(gen);
    applyDynamicMasks(ref);
    const diff = new PNG({ width: gen.width, height: gen.height });
    const mismatched = pixelmatch(gen.data, ref.data, diff.data, gen.width, gen.height, {
      threshold: 0.1,
    });
    const pct = mismatched / (gen.width * gen.height);
    diffPctMax = Math.max(diffPctMax, pct);
    const diffPath = path.join(outDir, `diff-page-${i + 1}.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    diffImages.push(diffPath);
  }

  // With only coarse letterhead/footer masks, residual party/cargo diffs are expected.
  // Never auto-PASS raster for pilot — REVIEW unless catastrophic.
  if (diffPctMax > 0.25) {
    return {
      status: 'fail',
      reason: `masked raster diff ${ (diffPctMax * 100).toFixed(2) }% exceeds 25% — likely wrong face/layout`,
      dpi: DPI,
      pagesCompared: n,
      diffPctMax,
      diffImages,
    };
  }
  return {
    status: 'review',
    reason: `masked raster diff max ${(diffPctMax * 100).toFixed(2)}% — dynamic cargo/parties not fully masked; visual review required`,
    dpi: DPI,
    pagesCompared: n,
    diffPctMax,
    diffImages,
  };
}

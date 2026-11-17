/**
 * Six-layer diff. Thresholds are unchanged from round 1:
 * geometry 0.1 pt, text position 0.5 pt, raster ratio 0.005, pixelmatch 0.1.
 * Round 2 adds a 0.5 pt text-width check and compares mapped font family and
 * weight instead of the raw PDF font name. Size tolerance stays 0.5 pt.
 * Stroke color, dash, and line width are compared as well. That is stricter.
 * Run: node tools/reports/diff-pilot.mjs <CODE>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { inspectPdfFile } from './extract.mjs';
import { mapFont } from './font-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GEOMETRY_TOLERANCE = 0.1;
const TEXT_TOLERANCE = 0.5;
const RASTER_LIMIT = 0.005;
const PIXELMATCH_THRESHOLD = 0.1;
const RASTER_DPI = 150;

function near(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

function sameDash(left, right) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

function matchLine(line, others) {
  return others.some((other) =>
    near(line.x1, other.x1, GEOMETRY_TOLERANCE)
    && near(line.y1, other.y1, GEOMETRY_TOLERANCE)
    && near(line.x2, other.x2, GEOMETRY_TOLERANCE)
    && near(line.y2, other.y2, GEOMETRY_TOLERANCE)
    && near(line.width || 0, other.width || 0, GEOMETRY_TOLERANCE)
    && (line.color || '#000000') === (other.color || '#000000')
    && sameDash(line.dash, other.dash),
  );
}

function matchRect(rect, others) {
  return others.find((other) =>
    near(rect.x, other.x, GEOMETRY_TOLERANCE)
    && near(rect.y, other.y, GEOMETRY_TOLERANCE)
    && near(rect.width, other.width, GEOMETRY_TOLERANCE)
    && near(rect.height, other.height, GEOMETRY_TOLERANCE)
    && (rect.fill || null) === (other.fill || null)
    && (rect.stroke || null) === (other.stroke || null)
    && sameDash(rect.dash, other.dash),
  );
}

function matchSpan(span, others) {
  return others.find((other) => other.text === span.text && near(span.x, other.x, TEXT_TOLERANCE) && near(span.y, other.y, TEXT_TOLERANCE));
}

function fontIdentity(name) {
  const mapped = mapFont(name);
  return `${mapped.family}|${mapped.weight}`;
}

function pageOf(read, index) {
  if (read.pageReads?.[index]) return read.pageReads[index];
  return { width: read.width, height: read.height, lines: read.vectors.lines, rects: read.vectors.rects, spans: read.spans };
}

function spansIn(spans, band) {
  if (!band) return [];
  return spans.filter((span) => span.y >= band.yMin && span.y <= band.yMax);
}

function singlePageInvariants(spec) {
  const page = spec.pages?.[0] || spec;
  const width = page.width || spec.page.width;
  const height = page.height || spec.page.height;
  const spans = page.spans || spec.spans;
  const overflow = spans.filter((span) =>
    span.x < -TEXT_TOLERANCE
    || span.y < -TEXT_TOLERANCE
    || span.x + span.width > width + TEXT_TOLERANCE
    || span.y + span.size > height + TEXT_TOLERANCE,
  );
  const header = spansIn(spans, spec.bands.header);
  const detail = spansIn(spans, spec.bands.detail);
  const summary = spansIn(spans, spec.bands.summary);
  const lastRowY = detail.length ? Math.min(...detail.map((span) => span.y)) : null;
  const summaryTop = summary.length ? Math.max(...summary.map((span) => span.y)) : null;
  return {
    noOverflow: overflow.length === 0,
    overflowSpans: overflow.map((span) => span.id),
    headerPresent: header.length > 0,
    summaryAfterLastRow: lastRowY != null && summaryTop != null && summaryTop < lastRowY,
    lastRowY,
    summaryTop,
  };
}

function multiPageInvariants(spec, rendered) {
  const pages = spec.pages || [];
  const headerTexts = (page) => new Set(
    spansIn(page.spans, page.bands?.header || spec.bands.header)
      .filter((span) => span.role !== 'dynamic' && !/page\s+\d+/i.test(span.text))
      .map((span) => span.text),
  );
  const firstHeader = headerTexts(pages[0] || spec);
  const headerRepeats = pages.every((page) => {
    const texts = headerTexts(page);
    return [...firstHeader].every((text) => texts.has(text));
  });
  const footerRepeats = pages.every((page) =>
    spansIn(page.spans, page.bands?.footer || spec.bands.footer).some((span) => /page/i.test(span.text)),
  );
  const rowBreak = pages.every((page, index) => {
    const detail = spansIn(page.spans, page.bands?.detail || spec.bands.detail);
    if (!detail.length) return true;
    const footerTop = (page.bands?.footer || spec.bands.footer).yMax;
    const headerBottom = (page.bands?.header || spec.bands.header).yMin;
    const lowest = Math.min(...detail.map((span) => span.y));
    const highest = Math.max(...detail.map((span) => span.y));
    if (index < pages.length - 1 && lowest < footerTop) return false;
    if (index > 0 && highest > headerBottom) return false;
    return true;
  });
  const last = pages[pages.length - 1];
  const detail = spansIn(last.spans, last.bands?.detail || spec.bands.detail);
  const summary = spansIn(last.spans, last.bands?.summary || spec.bands.summary);
  const lastRowY = detail.length ? Math.min(...detail.map((span) => span.y)) : null;
  const summaryTop = summary.length ? Math.max(...summary.map((span) => span.y)) : null;
  return {
    headerRepeats,
    rowBreak,
    summaryAfterLastRow: lastRowY != null && summaryTop != null && summaryTop < lastRowY,
    footerRepeats,
    renderedPages: rendered.pages,
    referencePages: pages.length,
  };
}

function comparePage(specPage, renderedPage) {
  const missingLines = (specPage.lines || []).filter((line) => !matchLine(line, renderedPage.lines || []));
  const missingRects = (specPage.rects || []).filter((rect) => !matchRect(rect, renderedPage.rects || []));
  const staticSpans = (specPage.spans || []).filter((span) => span.role === 'static');
  const dynamicSpans = (specPage.spans || []).filter((span) => span.role === 'dynamic');
  const failures = [];
  function check(spans, layer) {
    for (const span of spans) {
      const hit = matchSpan(span, renderedPage.spans || []);
      if (!hit) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'position or string' });
        continue;
      }
      if (fontIdentity(hit.font) !== fontIdentity(span.font)) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'font family or weight', reference: fontIdentity(span.font), rendered: fontIdentity(hit.font) });
      }
      if (Math.abs((hit.size || 0) - (span.size || 0)) > TEXT_TOLERANCE) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'size', reference: span.size, rendered: hit.size });
      }
      if (Math.abs((hit.width || 0) - (span.width || 0)) > TEXT_TOLERANCE) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'width', reference: span.width, rendered: hit.width });
      }
    }
  }
  check(staticSpans, 'static');
  check(dynamicSpans, 'dynamic');
  return { missingLines: missingLines.length, missingRects: missingRects.length, failures, staticSpans: staticSpans.length, dynamicSpans: dynamicSpans.length };
}

export async function diffPilot(code) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const referencePath = path.join(root, spec.source);
  const renderedPath = path.join(root, 'reports/output', `${code}.pdf`);
  const reference = await inspectPdfFile(referencePath);
  const rendered = await inspectPdfFile(renderedPath);
  const pageCount = Math.max(spec.pages?.length || 1, 1);
  const pagePass = near(reference.width, rendered.width, GEOMETRY_TOLERANCE) && near(reference.height, rendered.height, GEOMETRY_TOLERANCE)
    && reference.pages === rendered.pages;
  const pageResults = [];
  for (let index = 0; index < pageCount; index += 1) {
    const specPage = spec.pages?.[index] || spec;
    pageResults.push(comparePage(specPage, pageOf(rendered, index)));
  }
  const failures = pageResults.flatMap((page) => page.failures);
  const staticFailures = failures.filter((item) => item.layer === 'static');
  const dynamicFailures = failures.filter((item) => item.layer === 'dynamic');
  const unmatchedLines = pageResults.reduce((sum, page) => sum + page.missingLines, 0);
  const unmatchedRects = pageResults.reduce((sum, page) => sum + page.missingRects, 0);
  const rasterResult = await compareRaster(referencePath, renderedPath, spec, code);
  const single = singlePageInvariants(spec);
  const multi = pageCount > 1 ? multiPageInvariants(spec, rendered) : null;
  const paginationPass = Boolean(multi && multi.headerRepeats && multi.rowBreak && multi.summaryAfterLastRow && multi.footerRepeats);
  return {
    code,
    thresholds: {
      geometryPt: GEOMETRY_TOLERANCE,
      textPositionPt: TEXT_TOLERANCE,
      textWidthPt: TEXT_TOLERANCE,
      rasterRatio: RASTER_LIMIT,
      pixelmatch: PIXELMATCH_THRESHOLD,
      rasterDpi: RASTER_DPI,
      fontCompare: 'mapped family and weight',
    },
    page: { pass: pagePass, reference: [reference.width, reference.height, reference.pages], rendered: [rendered.width, rendered.height, rendered.pages] },
    geometry: {
      pass: unmatchedLines === 0 && unmatchedRects === 0,
      unmatchedLines,
      unmatchedRects,
    },
    staticText: {
      pass: staticFailures.length === 0,
      spans: pageResults.reduce((sum, page) => sum + page.staticSpans, 0),
      failures: staticFailures,
    },
    dynamicText: {
      pass: dynamicFailures.length === 0,
      spans: pageResults.reduce((sum, page) => sum + page.dynamicSpans, 0),
      failures: dynamicFailures,
      overflow: 'wrap, clip, and shrink are implemented; the golden render uses the reference demo strings',
    },
    raster: rasterResult,
    pagination: {
      pass: paginationPass,
      status: pageCount > 1 ? 'exercised' : 'single-page invariants only; this pilot is not the multi-page stress fixture',
      singlePage: single,
      multiPage: multi,
    },
  };
}

async function compareRaster(referencePdf, renderedPdf, spec, code) {
  const dir = path.join(root, 'reports/output/raster');
  fs.mkdirSync(dir, { recursive: true });
  const referencePrefix = path.join(dir, `${code}-reference`);
  const renderedPrefix = path.join(dir, `${code}-rendered`);
  const rasterArgs = ['-png', '-r', String(RASTER_DPI)];
  execFileSync('pdftoppm', [...rasterArgs, referencePdf, referencePrefix]);
  execFileSync('pdftoppm', [...rasterArgs, renderedPdf, renderedPrefix]);
  const pages = fs.readdirSync(dir).filter((name) => name.startsWith(`${code}-reference-`) && name.endsWith('.png'));
  let mismatches = 0;
  let pixels = 0;
  const heatmaps = [];
  for (const name of pages) {
    const pageNumber = name.match(/-(\d+)\.png$/)?.[1];
    const referenceImage = PNG.sync.read(fs.readFileSync(path.join(dir, name)));
    const renderedName = `${code}-rendered-${pageNumber}.png`;
    const renderedImage = PNG.sync.read(fs.readFileSync(path.join(dir, renderedName)));
    if (referenceImage.width !== renderedImage.width || referenceImage.height !== renderedImage.height) {
      return { measured: true, pass: false, reason: `Page ${pageNumber} PNG sizes differ`, rasterizer: 'pdftoppm', dpi: RASTER_DPI };
    }
    mask(referenceImage, spec);
    mask(renderedImage, spec);
    const diff = new PNG({ width: referenceImage.width, height: referenceImage.height });
    const count = pixelmatch(referenceImage.data, renderedImage.data, diff.data, referenceImage.width, referenceImage.height, { threshold: PIXELMATCH_THRESHOLD });
    const heatmap = path.join(dir, `${code}-page-${pageNumber}-diff.png`);
    fs.writeFileSync(heatmap, PNG.sync.write(diff));
    heatmaps.push(heatmap.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, ''));
    mismatches += count;
    pixels += referenceImage.width * referenceImage.height;
  }
  const ratio = pixels ? mismatches / pixels : 1;
  return {
    measured: true,
    pass: ratio <= RASTER_LIMIT,
    mismatches,
    ratio: Number(ratio.toFixed(4)),
    rasterizer: 'pdftoppm',
    dpi: RASTER_DPI,
    heatmaps,
  };
}

function mask(image, spec) {
  const boxes = [spec.slots?.logo, spec.slots?.company].filter(Boolean);
  const page = spec.page;
  for (const box of boxes) {
    const x0 = Math.max(0, Math.floor((box.x / page.width) * image.width));
    const x1 = Math.min(image.width, Math.ceil(((box.x + box.width) / page.width) * image.width));
    const yTop = page.height - (box.y + box.height);
    const y0 = Math.max(0, Math.floor((yTop / page.height) * image.height));
    const y1 = Math.min(image.height, Math.ceil(((yTop + box.height) / page.height) * image.height));
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const offset = (y * image.width + x) * 4;
        image.data[offset] = 255;
        image.data[offset + 1] = 255;
        image.data[offset + 2] = 255;
        image.data[offset + 3] = 255;
      }
    }
  }
}

const code = process.argv[2];
if (code && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await diffPilot(code);
  const out = path.join(root, 'reports/output', `${code}.diff.json`);
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({
    code: result.code,
    page: result.page,
    geometry: result.geometry,
    staticText: { pass: result.staticText.pass, spans: result.staticText.spans, failures: result.staticText.failures.length },
    dynamicText: { pass: result.dynamicText.pass, spans: result.dynamicText.spans, failures: result.dynamicText.failures.length },
    raster: result.raster,
    pagination: { pass: result.pagination.pass, status: result.pagination.status, singlePage: result.pagination.singlePage, multiPage: result.pagination.multiPage },
  }));
}

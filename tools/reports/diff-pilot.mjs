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
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';
import { inspectPdfFile } from './extract.mjs';
import { fontFile, mapFont } from './font-map.mjs';

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
    && (line.lineCap || 0) === (other.lineCap || 0)
    && (line.lineJoin || 0) === (other.lineJoin || 0)
    && sameDash(line.dash, other.dash),
  );
}

function pathBox(path) {
  const points = [];
  for (const command of path?.commands || []) {
    if (command.op === 'c') points.push(...command.p);
    else if (command.p) points.push(command.p);
  }
  if (!points.length) return null;
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), path };
}

function matchPath(path, others) {
  const box = pathBox(path);
  if (!box) return false;
  return others.some((other) => {
    const candidate = pathBox(other);
    return candidate
      && near(box.x, candidate.x, GEOMETRY_TOLERANCE)
      && near(box.y, candidate.y, GEOMETRY_TOLERANCE)
      && near(box.width, candidate.width, GEOMETRY_TOLERANCE)
      && near(box.height, candidate.height, GEOMETRY_TOLERANCE)
      && (path.stroke || null) === (other.stroke || null)
      && (path.fill || null) === (other.fill || null)
      && (path.lineCap || 0) === (other.lineCap || 0)
      && (path.lineJoin || 0) === (other.lineJoin || 0);
  });
}

function visualUncaptured(page) {
  const item = page?.uncaptured || {};
  const unknown = Object.values(item.unknownOps || {}).reduce((sum, count) => sum + count, 0);
  return {
    curves: item.curves || 0,
    nonAxisPaths: item.nonAxisPaths || 0,
    xobjects: item.xobjects || 0,
    shading: item.shading || 0,
    opacity: item.opacity || 0,
    undecodedText: item.undecodedText || 0,
    textRenderMode: item.textRenderMode || 0,
    unknown,
    total: (item.curves || 0) + (item.nonAxisPaths || 0) + (item.xobjects || 0) + (item.shading || 0) + (item.opacity || 0) + (item.undecodedText || 0) + (item.textRenderMode || 0) + unknown,
  };
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

function fontAccepted(referenceFont, renderedFont, text) {
  const reference = fontIdentity(referenceFont);
  const rendered = fontIdentity(renderedFont);
  if (reference === rendered) return true;
  const latin = /^[\u0000-\u024F]*$/.test(text || '');
  return reference.startsWith('Arimo|') && rendered.startsWith('Noto Sans|') && !latin;
}

function expectedSpans(specPage) {
  const spans = [...(specPage.spans || [])];
  for (const row of specPage.table?.rows || []) {
    for (const cell of row) if (cell) spans.push({ ...cell, role: 'dynamic' });
  }
  return spans;
}

function paintedParts(span) {
  const parts = span.segments?.length ? span.segments : [{ text: span.text, x: span.x, y: span.y, width: span.width }];
  return parts.filter((part) => String(part.text || '').trim());
}

function findPainted(part, others) {
  return others.find((other) => {
    const text = other.text === part.text || other.segments?.some((segment) => segment.text === part.text);
    return text && near(part.x, other.x, TEXT_TOLERANCE) && near(part.y, other.y, TEXT_TOLERANCE);
  });
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
  const page = contentPages(spec.pages || [spec])[0] || spec;
  const width = page.width || spec.page.width;
  const height = page.height || spec.page.height;
  const spans = expectedSpans(page);
  const overflow = spans.filter((span) =>
    span.x < -TEXT_TOLERANCE
    || span.y < -TEXT_TOLERANCE
    || span.x > width + TEXT_TOLERANCE
    || span.y > height + TEXT_TOLERANCE,
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
    summaryAfterLastRow: summaryAfter(spec, page),
    lastRowY,
    summaryTop,
    layoutKind: spec.layoutKind || 'form',
  };
}

function isValueText(text) {
  const value = String(text || '').trim();
  if (/^\(?[0-9][0-9,.\s()/-]*\)?$/.test(value) && /\d/.test(value)) return true;
  if (/^(inr|aed|usd|eur|gbp|sar|qar|omr|bhd|kwd)$/i.test(value)) return true;
  return false;
}

function headerTextsOf(page, spec) {
  return new Set(
    spansIn(expectedSpans(page), page.bands?.header || spec.bands.header)
      .filter((span) => span.role === 'static' && !isValueText(span.text) && !/page\s+\d+/i.test(span.text))
      .map((span) => span.text),
  );
}

function summaryAfter(spec, page) {
  if (!tableLayout(spec)) return null;
  const detail = spansIn(expectedSpans(page), page.bands?.detail || spec.bands.detail);
  const summary = spansIn(expectedSpans(page), page.bands?.summary || spec.bands.summary);
  const lastRowY = detail.length ? Math.min(...detail.map((span) => span.y)) : null;
  const summaryTop = summary.length ? Math.max(...summary.map((span) => span.y)) : null;
  return summaryTop == null || (lastRowY != null && summaryTop < lastRowY);
}

function tableLayout(spec) {
  return spec.layoutKind === 'table';
}

function isBlankPage(page) {
  return !(page?.spans || []).length && !(page?.lines || []).length && !(page?.rects || []).length && !(page?.paths || []).length && !(page?.images || []).length && !(page?.table?.rows || []).length;
}

function contentPages(pages) {
  const copy = [...(pages || [])];
  while (copy.length > 1 && isBlankPage(copy.at(-1))) copy.pop();
  return copy;
}

function multiPageInvariants(spec, rendered) {
  const pages = contentPages(spec.pages || []);
  const firstHeader = headerTextsOf(pages[0] || spec, spec);
  const headerMissing = [];
  const headerRepeats = pages.every((page, index) => {
    const texts = headerTextsOf(page, spec);
    const missing = [...firstHeader].filter((text) => !texts.has(text));
    missing.forEach((text) => headerMissing.push({ page: index + 1, text }));
    return missing.length === 0;
  });
  const footerRepeats = pages.every((page) =>
    spansIn(expectedSpans(page), page.bands?.footer || spec.bands.footer).some((span) => /page/i.test(span.text)),
  );
  const rowBreak = !tableLayout(spec) || pages.every((page, index) => {
    const detail = spansIn(expectedSpans(page), page.bands?.detail || spec.bands.detail);
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
  const detail = spansIn(expectedSpans(last), last.bands?.detail || spec.bands.detail);
  const summary = spansIn(expectedSpans(last), last.bands?.summary || spec.bands.summary);
  const lastRowY = detail.length ? Math.min(...detail.map((span) => span.y)) : null;
  const summaryTop = summary.length ? Math.max(...summary.map((span) => span.y)) : null;
  return {
    headerRepeats,
    rowBreak,
    summaryAfterLastRow: summaryAfter(spec, last),
    layoutKind: spec.layoutKind || 'form',
    ignoredTrailingBlankPages: (spec.pages || []).length - pages.length,
    footerRepeats,
    headerMissing,
    renderedPages: rendered.pages,
    referencePages: pages.length,
  };
}

function comparePage(specPage, renderedPage) {
  const missingLines = (specPage.lines || []).filter((line) => !matchLine(line, renderedPage.lines || []));
  const missingRects = (specPage.rects || []).filter((rect) => !matchRect(rect, renderedPage.rects || []));
  const missingPaths = (specPage.paths || []).filter((path) => !matchPath(path, renderedPage.paths || []));
  const spans = expectedSpans(specPage);
  const staticSpans = spans.filter((span) => span.role === 'static');
  const dynamicSpans = spans.filter((span) => span.role === 'dynamic');
  const failures = [];
  function check(list, layer) {
    for (const span of list) {
      const parts = paintedParts(span);
      if (!parts.length) continue;
      const hits = parts.map((part) => findPainted(part, renderedPage.spans || []));
      if (hits.some((hit) => !hit)) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'position or string' });
        continue;
      }
      if (hits.some((hit) => !fontAccepted(span.font, hit.font, hit.text))) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'font family or weight', reference: fontIdentity(span.font), rendered: hits.map((hit) => fontIdentity(hit.font)).join(',') });
      }
      if (hits.some((hit) => Math.abs((hit.size || 0) - (span.size || 0)) > TEXT_TOLERANCE)) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'size', reference: span.size, rendered: hits[0].size });
      }
      const renderedWidth = hits.reduce((sum, hit) => sum + (hit.width || 0), 0);
      const referenceWidth = parts.reduce((sum, part) => sum + (part.width || 0), 0);
      if (Math.abs(renderedWidth - referenceWidth) > TEXT_TOLERANCE) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'width', reference: roundWidth(referenceWidth), rendered: roundWidth(renderedWidth) });
      }
      if (hits.some((hit) => Math.abs((hit.hScale ?? 100) - (span.hScale ?? 100)) > 0.5)) {
        failures.push({ layer, id: span.id, text: span.text, cause: 'horizontal scale', reference: span.hScale ?? 100, rendered: hits[0].hScale ?? 100 });
      }
    }
  }
  check(staticSpans, 'static');
  check(dynamicSpans, 'dynamic');
  const uncaptured = visualUncaptured(specPage);
  return {
    missingLines: missingLines.length,
    missingRects: missingRects.length,
    missingPaths: missingPaths.length,
    uncaptured,
    failures,
    staticSpans: staticSpans.length,
    dynamicSpans: dynamicSpans.length,
  };
}

function roundWidth(value) {
  return Math.round(value * 10) / 10;
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
  const unmatchedPaths = pageResults.reduce((sum, page) => sum + page.missingPaths, 0);
  const uncaptured = pageResults.reduce((sum, page) => sum + page.uncaptured.total, 0);
  const rasterResult = await compareRaster(referencePath, renderedPath, spec, code);
  const deviation = await naturalDeviation(spec);
  const images = (spec.pages || []).flatMap((page, index) => (page.images || []).map((image) => ({
    page: index + 1,
    x: image.x,
    y: image.y,
    width: image.width,
    height: image.height,
    proposedClass: image.proposedClass || 'other',
    demoValue: image.demoValue || image.barcode?.payload || '',
    symbology: image.barcode?.symbology || '',
    moduleWidth: image.barcode?.moduleWidth || 0,
    quietZone: image.barcode?.quietZone || 0,
    decoded: Boolean(image.barcode?.decoded),
  })));
  const branding = (spec.pages || []).flatMap((page, index) => expectedSpans(page).filter((span) => span.role === 'branding').map((span) => ({
    page: index + 1,
    id: span.id,
    text: span.text,
    kind: span.brandingKind || '',
    x: span.x,
    y: span.y,
  })));
  const single = singlePageInvariants(spec);
  const multi = pageCount > 1 ? multiPageInvariants(spec, rendered) : null;
  const table = spec.layoutKind === 'table';
  const paginationPass = Boolean(multi && multi.headerRepeats && multi.footerRepeats && (!table || (multi.rowBreak && multi.summaryAfterLastRow)));
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
      pass: unmatchedLines === 0 && unmatchedRects === 0 && unmatchedPaths === 0 && uncaptured === 0,
      unmatchedLines,
      unmatchedRects,
      unmatchedPaths,
      uncaptured,
      uncapturedByPage: pageResults.map((page) => page.uncaptured),
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
      naturalWidth: deviation,
    },
    images,
    branding,
    allowedDifferenceProposal: {
      logo: 'already masked; proposed allowed',
      barcode: 'generated from the demo value; proposed allowed',
      qr: 'generated from the demo value; proposed allowed',
      letterhead: 'page-width header artwork; proposed allowed',
      'decorative Fresa branding': 'Fresa identity; proposed allowed',
      other: 'proposed not allowed',
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
  let nonTextMismatches = 0;
  let textMismatches = 0;
  let textPixels = 0;
  const ink = [];
  const heatmaps = [];
  const causes = { 'text glyph': 0, 'text position': 0, vector: 0, 'image/barcode': 0, color: 0, other: 0 };
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
    const pageSpec = spec.pages?.[Number(pageNumber) - 1] || spec;
    const pageCauses = classifyDiff(diff, pageSpec);
    for (const [key, value] of Object.entries(pageCauses)) causes[key] += value;
    const heatmap = path.join(dir, `${code}-page-${pageNumber}-diff.png`);
    fs.writeFileSync(heatmap, PNG.sync.write(diff));
    heatmaps.push(heatmap.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, ''));
    const extra = measureRasterExtras(referenceImage, renderedImage, pageSpec);
    nonTextMismatches += extra.nonTextMismatches;
    textMismatches += extra.textMismatches;
    textPixels += extra.textPixels;
    ink.push(...extra.ink);
    mismatches += count;
    pixels += referenceImage.width * referenceImage.height;
  }
  const ratio = pixels ? mismatches / pixels : 1;
  const nonTextRatio = pixels ? nonTextMismatches / pixels : 1;
  const textRatio = textPixels ? textMismatches / textPixels : 0;
  const inkValues = ink.map((item) => item.iou);
  return {
    measured: true,
    pass: ratio <= RASTER_LIMIT,
    mismatches,
    ratio: Number(ratio.toFixed(4)),
    rasterizer: 'pdftoppm',
    dpi: RASTER_DPI,
    heatmaps,
    causes,
    causeShare: Object.fromEntries(Object.entries(causes).map(([key, value]) => [key, mismatches ? Number((value / mismatches).toFixed(4)) : 0])),
    nonText: {
      pass: nonTextRatio <= RASTER_LIMIT,
      mismatches: nonTextMismatches,
      ratio: Number(nonTextRatio.toFixed(4)),
      limit: RASTER_LIMIT,
      masked: 'span boxes plus logo, letterhead, barcode, QR, and decorative branding',
    },
    text: {
      blurredMismatches: textMismatches,
      blurredRatio: Number(textRatio.toFixed(4)),
      textPixels,
      sigmaPx: 1,
      inkMean: inkValues.length ? Number((inkValues.reduce((sum, value) => sum + value, 0) / inkValues.length).toFixed(4)) : null,
      inkMin: inkValues.length ? Number(Math.min(...inkValues).toFixed(4)) : null,
      inkSpans: ink.length,
      spans: ink,
    },
  };
}

function pointSegmentDistance(x, y, line) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - line.x1) * dx + (y - line.y1) * dy) / length));
  return Math.hypot(x - (line.x1 + t * dx), y - (line.y1 + t * dy));
}

function classifyPoint(x, y, page) {
  for (const image of page.images || []) {
    if (x >= image.x && x <= image.x + image.width && y >= image.y && y <= image.y + image.height) return 'image/barcode';
  }
  for (const span of expectedSpans(page)) {
    const top = span.y + (span.size || 8);
    const nearText = x >= span.x - 1.5 && x <= span.x + Math.max(span.width || 0, 1) + 1.5 && y >= span.y - 1.5 && y <= top + 1.5;
    if (!nearText) continue;
    const inside = x >= span.x && x <= span.x + Math.max(span.width || 0, 1) && y >= span.y && y <= top;
    return inside ? 'text glyph' : 'text position';
  }
  for (const line of page.lines || []) {
    if (pointSegmentDistance(x, y, line) <= (line.width || 0.6) + 1.2) return 'vector';
  }
  for (const path of page.paths || []) {
    const box = pathBox(path);
    if (box && x >= box.x - 1.2 && x <= box.x + box.width + 1.2 && y >= box.y - 1.2 && y <= box.y + box.height + 1.2) return 'vector';
  }
  for (const rect of page.rects || []) {
    const inside = x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    if (!inside) continue;
    const edge = x <= rect.x + 1.2 || y <= rect.y + 1.2 || x >= rect.x + rect.width - 1.2 || y >= rect.y + rect.height - 1.2;
    if (edge || !rect.fill || rect.fill === '#ffffff') return 'vector';
    return 'color';
  }
  return 'other';
}

function classifyDiff(diff, page) {
  const causes = { 'text glyph': 0, 'text position': 0, vector: 0, 'image/barcode': 0, color: 0, other: 0 };
  const width = page.width || 595;
  const height = page.height || 842;
  for (let py = 0; py < diff.height; py += 1) {
    for (let px = 0; px < diff.width; px += 1) {
      const offset = (py * diff.width + px) * 4;
      if (diff.data[offset] < 200 || diff.data[offset + 1] > 40 || diff.data[offset + 2] > 40) continue;
      const x = (px / diff.width) * width;
      const y = height - (py / diff.height) * height;
      causes[classifyPoint(x, y, page)] += 1;
    }
  }
  return causes;
}

async function naturalDeviation(spec) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const cache = new Map();
  const rows = [];
  for (const span of (spec.pages || [spec]).flatMap((page) => expectedSpans(page))) {
    if (!span.glyphWidth) continue;
    const mapped = mapFont(span.font);
    if (!cache.has(mapped.file)) cache.set(mapped.file, await doc.embedFont(fs.readFileSync(fontFile(mapped))));
    const measured = span.glyphText || (span.segments?.length ? span.segments.map((segment) => segment.text).join('') : span.text);
    let natural = 0;
    try { natural = cache.get(mapped.file).widthOfTextAtSize(measured, span.size || 8); } catch { continue; }
    const delta = natural - span.glyphWidth;
    const segments = span.segments || [];
    let tj = 0;
    for (let index = 1; index < segments.length; index += 1) {
      const previous = segments[index - 1];
      tj += segments[index].x - (previous.x + previous.width);
    }
    rows.push({
      id: span.id,
      text: span.text,
      font: span.font,
      mapped: `${mapped.family}|${mapped.weight}`,
      size: span.size,
      tc: span.charSpacing || 0,
      tw: span.wordSpacing || 0,
      tj: roundWidth(segments.length > 1 ? tj : (span.width || 0) - (span.glyphWidth || 0)),
      glyphWidth: span.glyphWidth,
      natural: roundWidth(natural),
      delta: roundWidth(delta),
      percent: span.glyphWidth ? Math.abs(delta) / span.glyphWidth : 0,
    });
  }
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.font} -> ${row.mapped}`;
    const group = groups.get(key) || { font: key, spans: 0, absPercent: 0 };
    group.spans += 1;
    group.absPercent += row.percent;
    groups.set(key, group);
  }
  const fonts = [...groups.values()].map((group) => ({ font: group.font, spans: group.spans, meanPercent: Number((group.absPercent / group.spans).toFixed(4)) }));
  function take(test) {
    const matched = rows.filter(test);
    const padded = [...matched].sort((a, b) => (b.tj || 0) - (a.tj || 0)).slice(0, 5);
    const plain = matched.filter((row) => !padded.includes(row)).slice(0, 5);
    return [...plain, ...padded].slice(0, 10);
  }
  return {
    spans: rows,
    fontsOverHalfPercent: fonts.filter((group) => group.meanPercent > 0.005),
    samples: {
      arial: take((row) => row.font === 'Arial'),
      arialBold: take((row) => /arial/i.test(row.font) && /bold/i.test(row.font) && !/unicode/i.test(row.font)),
      consolas: take((row) => /consolas/i.test(row.font)),
    },
  };
}

function pdfRect(box, page, image) {
  const width = page.width || 595;
  const height = page.height || 842;
  const x0 = Math.max(0, Math.floor((box.x / width) * image.width));
  const x1 = Math.min(image.width, Math.ceil(((box.x + box.width) / width) * image.width));
  const yTop = height - (box.y + box.height);
  const y0 = Math.max(0, Math.floor((yTop / height) * image.height));
  const y1 = Math.min(image.height, Math.ceil(((yTop + box.height) / height) * image.height));
  return { x0, x1, y0, y1 };
}

function spanBox(span) {
  const size = span.size || 8;
  return { x: span.x, y: span.y - size * 0.25, width: Math.max(span.width || 1, 1), height: size * 1.25 };
}

const ALLOWED_IMAGE = new Set(['logo', 'barcode', 'qr', 'letterhead', 'decorative Fresa branding']);

function whiteRect(image, rect) {
  for (let y = rect.y0; y < rect.y1; y += 1) {
    for (let x = rect.x0; x < rect.x1; x += 1) {
      const offset = (y * image.width + x) * 4;
      image.data[offset] = 255;
      image.data[offset + 1] = 255;
      image.data[offset + 2] = 255;
      image.data[offset + 3] = 255;
    }
  }
}

function cloneImage(image) {
  const copy = new PNG({ width: image.width, height: image.height });
  copy.data.set(image.data);
  return copy;
}

function gaussianBlur(image) {
  const radius = 3;
  const sigma = 1;
  const kernel = [];
  let weightSum = 0;
  for (let offset = -radius; offset <= radius; offset += 1) {
    const weight = Math.exp(-(offset * offset) / (2 * sigma * sigma));
    kernel.push(weight);
    weightSum += weight;
  }
  const weights = kernel.map((weight) => weight / weightSum);
  const { width, height, data } = image;
  const horizontal = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sample = Math.max(0, Math.min(width - 1, x + offset));
        const index = (y * width + sample) * 4;
        const weight = weights[offset + radius];
        red += data[index] * weight;
        green += data[index + 1] * weight;
        blue += data[index + 2] * weight;
      }
      const dest = (y * width + x) * 4;
      horizontal[dest] = red;
      horizontal[dest + 1] = green;
      horizontal[dest + 2] = blue;
      horizontal[dest + 3] = 255;
    }
  }
  const copy = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sample = Math.max(0, Math.min(height - 1, y + offset));
        const index = (sample * width + x) * 4;
        const weight = weights[offset + radius];
        red += horizontal[index] * weight;
        green += horizontal[index + 1] * weight;
        blue += horizontal[index + 2] * weight;
      }
      const dest = (y * width + x) * 4;
      copy.data[dest] = red;
      copy.data[dest + 1] = green;
      copy.data[dest + 2] = blue;
      copy.data[dest + 3] = 255;
    }
  }
  return copy;
}

function measureRasterExtras(referenceImage, renderedImage, page) {
  const pageBox = { width: page.width || 595, height: page.height || 842 };
  const spans = expectedSpans(page).map(spanBox);
  const allowed = (page.images || []).filter((image) => ALLOWED_IMAGE.has(image.proposedClass)).map((image) => ({
    x: image.x, y: image.y, width: image.width, height: image.height,
  }));
  const left = cloneImage(referenceImage);
  const right = cloneImage(renderedImage);
  for (const box of [...spans, ...allowed]) {
    whiteRect(left, pdfRect(box, pageBox, left));
    whiteRect(right, pdfRect(box, pageBox, right));
  }
  const scratch = new PNG({ width: left.width, height: left.height });
  const nonTextMismatches = pixelmatch(left.data, right.data, scratch.data, left.width, left.height, { threshold: PIXELMATCH_THRESHOLD });
  const blurredLeft = gaussianBlur(referenceImage);
  const blurredRight = gaussianBlur(renderedImage);
  const diff = new PNG({ width: referenceImage.width, height: referenceImage.height });
  pixelmatch(blurredLeft.data, blurredRight.data, diff.data, diff.width, diff.height, { threshold: PIXELMATCH_THRESHOLD });
  const covered = new Uint8Array(referenceImage.width * referenceImage.height);
  let textPixels = 0;
  let textMismatches = 0;
  for (const box of spans) {
    const rect = pdfRect(box, pageBox, referenceImage);
    for (let y = rect.y0; y < rect.y1; y += 1) {
      for (let x = rect.x0; x < rect.x1; x += 1) {
        const pixel = y * referenceImage.width + x;
        if (covered[pixel]) continue;
        covered[pixel] = 1;
        textPixels += 1;
        const offset = pixel * 4;
        if (diff.data[offset] > 200 && diff.data[offset + 1] < 40 && diff.data[offset + 2] < 40) textMismatches += 1;
      }
    }
  }
  const ink = expectedSpans(page).map((span) => {
    const rect = pdfRect(spanBox(span), pageBox, referenceImage);
    let referenceInk = 0;
    let renderedInk = 0;
    let both = 0;
    for (let y = rect.y0; y < rect.y1; y += 1) {
      for (let x = rect.x0; x < rect.x1; x += 1) {
        const offset = (y * referenceImage.width + x) * 4;
        const referenceDark = referenceImage.data[offset] < 180 || referenceImage.data[offset + 1] < 180 || referenceImage.data[offset + 2] < 180;
        const renderedDark = renderedImage.data[offset] < 180 || renderedImage.data[offset + 1] < 180 || renderedImage.data[offset + 2] < 180;
        if (referenceDark) referenceInk += 1;
        if (renderedDark) renderedInk += 1;
        if (referenceDark && renderedDark) both += 1;
      }
    }
    const union = referenceInk + renderedInk - both;
    return { id: span.id, iou: union ? Number((both / union).toFixed(4)) : 1 };
  });
  return { nonTextMismatches, textMismatches, textPixels, ink };
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
    raster: {
      pass: result.raster.pass,
      mismatches: result.raster.mismatches,
      ratio: result.raster.ratio,
      causes: result.raster.causes,
      causeShare: result.raster.causeShare,
      nonText: result.raster.nonText,
      text: result.raster.text ? { blurredMismatches: result.raster.text.blurredMismatches, blurredRatio: result.raster.text.blurredRatio, textPixels: result.raster.text.textPixels, inkMean: result.raster.text.inkMean, inkMin: result.raster.text.inkMin, inkSpans: result.raster.text.inkSpans } : null,
    },
    pagination: { pass: result.pagination.pass, status: result.pagination.status, singlePage: result.pagination.singlePage, multiPage: result.pagination.multiPage },
    images: result.images,
    branding: result.branding,
    fontsOverHalfPercent: result.dynamicText.naturalWidth.fontsOverHalfPercent,
    fontSamples: result.dynamicText.naturalWidth.samples,
  }));
  if (process.argv.includes('--check-baseline')) {
    const baselinePath = path.join(root, 'reports/ci-baseline.json');
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))[code];
    const problems = regressions(result, baseline);
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exitCode = 1;
    } else console.log('no regression');
  }
}

export function regressions(current, baseline) {
  if (!baseline) return ['missing baseline'];
  const problems = [];
  for (const layer of ['page', 'geometry', 'staticText', 'dynamicText', 'pagination']) {
    if (baseline[layer]?.pass && !current[layer]?.pass) problems.push(`${current.code} ${layer} regressed to fail`);
  }
  if (current.geometry.unmatchedLines > baseline.geometry.unmatchedLines) problems.push(`${current.code} unmatched lines increased`);
  if (current.geometry.unmatchedRects > baseline.geometry.unmatchedRects) problems.push(`${current.code} unmatched rects increased`);
  if ((current.geometry.unmatchedPaths || 0) > (baseline.geometry.unmatchedPaths || 0)) problems.push(`${current.code} unmatched paths increased`);
  if ((current.geometry.uncaptured || 0) > (baseline.geometry.uncaptured || 0)) problems.push(`${current.code} uncaptured geometry increased`);
  const failureCount = (layer) => Array.isArray(layer?.failures) ? layer.failures.length : (layer?.failures || 0);
  if (failureCount(current.staticText) > failureCount(baseline.staticText)) problems.push(`${current.code} static text failures increased`);
  if (failureCount(current.dynamicText) > failureCount(baseline.dynamicText)) problems.push(`${current.code} dynamic text failures increased`);
  if (current.raster.ratio > baseline.raster.ratio + 0.00005) problems.push(`${current.code} raster ratio increased`);
  return problems;
}

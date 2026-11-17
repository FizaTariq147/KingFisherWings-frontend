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
  return span.segments?.length ? span.segments : [{ text: span.text, x: span.x, y: span.y, width: span.width }];
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
    summaryAfterLastRow: spec.layoutKind === 'table' ? lastRowY != null && summaryTop != null && summaryTop < lastRowY : null,
    lastRowY,
    summaryTop,
    layoutKind: spec.layoutKind || 'form',
  };
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
  const headerTexts = (page) => new Set(
    spansIn(expectedSpans(page), page.bands?.header || spec.bands.header)
      .filter((span) => span.role !== 'dynamic' && !/page\s+\d+/i.test(span.text))
      .map((span) => span.text),
  );
  const firstHeader = headerTexts(pages[0] || spec);
  const headerRepeats = pages.every((page) => {
    const texts = headerTexts(page);
    return [...firstHeader].every((text) => texts.has(text));
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
    summaryAfterLastRow: tableLayout(spec) ? lastRowY != null && summaryTop != null && summaryTop < lastRowY : null,
    layoutKind: spec.layoutKind || 'form',
    ignoredTrailingBlankPages: (spec.pages || []).length - pages.length,
    footerRepeats,
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
    demoValue: image.demoValue || '',
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
    allowedDifferenceProposal: {
      logo: 'already masked; proposed allowed',
      barcode: 'generated from the demo value; proposed allowed',
      qr: 'generated from the demo value; proposed allowed',
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
    causes,
    causeShare: Object.fromEntries(Object.entries(causes).map(([key, value]) => [key, mismatches ? Number((value / mismatches).toFixed(4)) : 0])),
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
    let natural = 0;
    try { natural = cache.get(mapped.file).widthOfTextAtSize(span.text, span.size || 8); } catch { continue; }
    const delta = natural - span.glyphWidth;
    rows.push({
      id: span.id,
      font: span.font,
      mapped: `${mapped.family}|${mapped.weight}`,
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
  return { spans: rows, fontsOverHalfPercent: fonts.filter((group) => group.meanPercent > 0.005) };
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
    images: result.images,
    fontsOverHalfPercent: result.dynamicText.naturalWidth.fontsOverHalfPercent,
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

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
import { inspectPdfFile } from './extract.mjs';
import { fontFile, mapFont } from './font-map.mjs';
import { characterSpacingFor } from './render-spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GEOMETRY_TOLERANCE = 0.1;
const TEXT_TOLERANCE = 0.5;
const RASTER_LIMIT = 0.005;
const MASKED_FRACTION_LIMIT = 0.25;
const TEXT_INK_LIMIT = 0.4;
const PIXELMATCH_THRESHOLD = 0.1;
const RASTER_DPI = 150;
const DECORATIVE_CLASSES = new Set(['decorative', 'decorative Fresa branding']);
const OVERLAY_CLASSES = new Set(['form_background']);
const MASK_IMAGE_CLASSES = new Set(['logo', 'letterhead', 'decorative', 'decorative Fresa branding']);

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
  if (latin) return false;
  // Arabic and other non-Latin: open fallbacks for Arial Unicode / Arimo.
  if (reference.startsWith('Arimo|') && (rendered.startsWith('Noto Sans|') || rendered.startsWith('Noto Naskh Arabic|'))) return true;
  if (reference.startsWith('Noto Sans|') && rendered.startsWith('Noto Naskh Arabic|')) return true;
  return false;
}

function foldedArabic(text) {
  return String(text || '').normalize('NFKC');
}

function reverseArabicRuns(text) {
  // Presentation-form extraction is visual RTL; Noto ToUnicode is logical LTR.
  // Reverse only Arabic-script runs so mixed Latin+Arabic labels still match.
  return foldedArabic(text).replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, (run) => [...run].reverse().join(''));
}

function textEqual(left, right) {
  if (left === right) return true;
  const compact = (value) => foldedArabic(value).replace(/\s+/g, '');
  if (compact(left) === compact(right)) return true;
  const a = foldedArabic(left);
  const b = foldedArabic(right);
  if (a === b) return true;
  const ra = reverseArabicRuns(left);
  const rb = reverseArabicRuns(right);
  if (ra === rb || a === rb || ra === b) return true;
  if (compact(ra) === compact(rb) || compact(a) === compact(rb) || compact(ra) === compact(b)) return true;
  const fullA = [...a].reverse().join('');
  const fullB = [...b].reverse().join('');
  return a === fullB || fullA === b || fullA === fullB || compact(fullA) === compact(b) || compact(a) === compact(fullB);
}

function expectedSpans(specPage) {
  const spans = [...(specPage.spans || [])];
  for (const row of specPage.table?.rows || []) {
    for (const cell of row) if (cell) spans.push({ ...cell, role: 'dynamic' });
  }
  return spans;
}

function paintedParts(span, pageWidth) {
  const parts = span.segments?.length ? span.segments : [{ text: span.text, x: span.x, y: span.y, width: span.width }];
  return parts.filter((part) => String(part.text || '').trim() && (pageWidth == null || part.x < pageWidth));
}

function edgeParts(span, pageWidth) {
  const parts = span.segments?.length ? span.segments : [{ text: span.text, x: span.x, y: span.y, width: span.width }];
  return parts.filter((part) => String(part.text || '').trim() && pageWidth != null && part.x >= pageWidth);
}

function findPainted(part, others) {
  const direct = others.find((other) => {
    const text = textEqual(other.text, part.text)
      || other.segments?.some((segment) => textEqual(segment.text, part.text));
    return text && near(part.x, other.x, TEXT_TOLERANCE) && near(part.y, other.y, TEXT_TOLERANCE);
  });
  if (direct) return direct;
  // Mixed-script runs are drawn as adjacent pieces and re-extract as several spans.
  const line = others
    .filter((other) => near(other.y, part.y, TEXT_TOLERANCE))
    .sort((left, right) => left.x - right.x);
  for (let start = 0; start < line.length; start += 1) {
    if (!near(line[start].x, part.x, TEXT_TOLERANCE)) continue;
    let text = '';
    let width = 0;
    for (let end = start; end < line.length; end += 1) {
      if (end > start) {
        const gap = line[end].x - (line[end - 1].x + (line[end - 1].width || 0));
        if (gap > 8) break;
      }
      text += line[end].text || '';
      width = (line[end].x + (line[end].width || 0)) - line[start].x;
      if (textEqual(text, part.text)) {
        return {
          ...line[start],
          text,
          x: line[start].x,
          y: line[start].y,
          width,
          font: line[start].font,
        };
      }
    }
  }
  return null;
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

function isPageNumberText(text) {
  return /\bpages?\b(?:\s*:)?\s*\d|\bpage\s+\d+\s+of\s+\d+/i.test(String(text || ''));
}

function isHeaderLabel(text) {
  const value = String(text || '').trim();
  if (!value || isValueText(value) || isPageNumberText(value)) return false;
  if (/:$/.test(value)) return true;
  return /^trial balance$/i.test(value);
}

function headerTextsOf(page, spec, options = {}) {
  const spans = spansIn(expectedSpans(page), page.bands?.header || spec.bands.header)
    .filter((span) => span.role === 'static' && !isValueText(span.text) && !isPageNumberText(span.text))
    .sort((left, right) => right.y - left.y || left.x - right.x);
  const texts = new Set();
  for (let index = 0; index < spans.length; index += 1) {
    let merged = spans[index].text;
    if (!options.labelsOnly || isHeaderLabel(merged)) texts.add(merged);
    let cursorX = spans[index].x + (spans[index].width || 0);
    for (let next = index + 1; next < spans.length; next += 1) {
      if (Math.abs(spans[next].y - spans[index].y) > 1.2) break;
      if (spans[next].x + 0.5 < spans[index].x) continue;
      if (spans[next].x - cursorX > 8) break;
      merged += spans[next].text;
      cursorX = spans[next].x + (spans[next].width || 0);
      if (!options.labelsOnly || isHeaderLabel(merged)) texts.add(merged);
    }
  }
  return texts;
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

function formContinuation(spec, pages) {
  const headerSets = pages.map((page) => headerTextsOf(page, spec));
  const nonempty = headerSets.filter((set) => set.size);
  const shared = nonempty.length
    ? [...nonempty[0]].filter((text) => nonempty.every((set) => set.has(text)))
    : [];
  const headerMissing = [];
  const continuationPages = [];
  const first = headerSets[0] || new Set();
  const headerRepeats = headerSets.every((set, index) => {
    const same = set.size === first.size && [...first].every((text) => set.has(text));
    if (index > 0 && !same) continuationPages.push(index + 1);
    if (!set.size) return true;
    const missing = shared.filter((text) => !set.has(text));
    missing.forEach((text) => headerMissing.push({ page: index + 1, text }));
    return missing.length === 0;
  });
  const textPages = pages.filter((page) => expectedSpans(page).length);
  const numbered = textPages.map((page) =>
    spansIn(expectedSpans(page), page.bands?.footer || spec.bands.footer).some((span) => isPageNumberText(span.text)),
  );
  const numberedCount = numbered.filter(Boolean).length;
  return {
    headerRepeats,
    footerRepeats: numberedCount === 0 || numberedCount === textPages.length,
    headerMissing,
    continuationPages,
    sharedHeader: shared,
  };
}

export function multiPageInvariants(spec, rendered) {
  const pages = contentPages(spec.pages || []);
  const form = tableLayout(spec) ? null : formContinuation(spec, pages);
  const firstHeader = headerTextsOf(pages[0] || spec, spec, { labelsOnly: !form });
  const headerMissing = form ? form.headerMissing : [];
  const headerRepeats = form ? form.headerRepeats : pages.every((page, index) => {
    if (!expectedSpans(page).length) return true;
    const texts = headerTextsOf(page, spec, { labelsOnly: true });
    const missing = [...firstHeader].filter((text) => !texts.has(text));
    missing.forEach((text) => headerMissing.push({ page: index + 1, text }));
    return missing.length === 0;
  });
  const textPages = pages.filter((page) => expectedSpans(page).length);
  const footerRepeats = form
    ? form.footerRepeats
    : textPages.length === 0
      || textPages.every((page) => spansIn(expectedSpans(page), page.bands?.footer || spec.bands.footer).some((span) => isPageNumberText(span.text)))
      || textPages.every((page) => !spansIn(expectedSpans(page), page.bands?.footer || spec.bands.footer).some((span) => isPageNumberText(span.text)));
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
    continuationPages: form?.continuationPages || [],
    renderedPages: rendered.pages,
    referencePages: pages.length,
  };
}

function comparePage(specPage, renderedPage) {
  const missingLines = (specPage.lines || []).filter((line) => !matchLine(line, renderedPage.lines || []));
  const missingRects = (specPage.rects || []).filter((rect) => !matchRect(rect, renderedPage.rects || []));
  const missingPaths = (specPage.paths || []).filter((path) => !matchPath(path, renderedPage.paths || []));
  const pageWidth = specPage.width;
  const spans = expectedSpans(specPage);
  const staticSpans = spans.filter((span) => span.role === 'static');
  const dynamicSpans = spans.filter((span) => span.role === 'dynamic');
  const failures = [];
  const droppedPastEdge = [];
  function check(list, layer) {
    for (const span of list) {
      for (const part of edgeParts(span, pageWidth)) {
        droppedPastEdge.push({ id: span.id, text: part.text, x: part.x, y: part.y });
      }
      const parts = paintedParts(span, pageWidth);
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
    droppedPastEdge,
    staticSpans: staticSpans.length,
    dynamicSpans: dynamicSpans.length,
  };
}

function roundWidth(value) {
  return Math.round(value * 10) / 10;
}

function consolasReport(spec, rendered) {
  const rows = [];
  for (const [index, page] of (spec.pages || []).entries()) {
    const painted = rendered.pageReads?.[index]?.spans || [];
    for (const span of [...(page.spans || []), ...(page.table?.rows || []).flat().filter(Boolean)]) {
      if (!/consolas/i.test(span.font || '')) continue;
      const parts = paintedParts(span);
      const hits = parts.map((part) => findPainted(part, painted));
      const renderedWidth = hits.every(Boolean) ? hits.reduce((sum, hit) => sum + (hit.width || 0), 0) : null;
      rows.push({
        id: span.id,
        text: span.text,
        size: span.size,
        tc: Number(characterSpacingFor(span, false).toFixed(4)),
        reference: roundWidth(parts.reduce((sum, part) => sum + (part.width || 0), 0)),
        rendered: renderedWidth == null ? null : roundWidth(renderedWidth),
      });
    }
  }
  return rows;
}

function explainWidth(failure, row) {
  if (!row) return 'drawn width differs from the reference span';
  const metric = row.natural - row.glyphWidth;
  if (/consolas/i.test(row.font || '') && Math.abs(metric) > TEXT_TOLERANCE) return 'Consolas 549.8 units per em versus Liberation Mono';
  if (Math.abs(metric) > TEXT_TOLERANCE) return 'substitute advance differs from the reference font';
  return 'drawn width differs after character spacing; unkerned advance is within 0.5 pt';
}

function widthMisses(failures, deviation) {
  const byId = new Map((deviation.spans || []).map((row) => [row.id, row]));
  return failures.filter((failure) => failure.cause === 'width').map((failure) => {
    const row = byId.get(failure.id);
    return {
      id: failure.id,
      text: failure.text,
      layer: failure.layer,
      size: row?.size ?? null,
      font: row?.font || '',
      reference: failure.reference,
      rendered: failure.rendered,
      glyphWidth: row?.glyphWidth ?? null,
      natural: row?.natural ?? null,
      cause: explainWidth(failure, row),
    };
  });
}

export function parseAllowedDifferences(text, code, pageNumber) {
  const boxes = [];
  for (const line of String(text || '').split(/\r?\n/)) {
    const match = line.match(/^\|?\s*(\*|[A-Z][A-Z0-9_]+)\s*\|?\s+(\d+)\s*\|?\s*(-?\d+(?:\.\d+)?)\s*\|?\s*(-?\d+(?:\.\d+)?)\s*\|?\s*(-?\d+(?:\.\d+)?)\s*\|?\s*(-?\d+(?:\.\d+)?)\s*\|?\s*([^|]*)/);
    if (!match) continue;
    const [, rowCode, page, x, y, width, height, reason] = match;
    if (rowCode !== '*' && rowCode !== code) continue;
    if (Number(page) !== Number(pageNumber)) continue;
    boxes.push({
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
      kind: 'allowed',
      reason: String(reason || '').trim(),
    });
  }
  return boxes;
}

export function readAllowedDifferences(code, pageNumber) {
  const file = path.join(root, 'reports/allowed-differences.md');
  if (!fs.existsSync(file)) return [];
  return parseAllowedDifferences(fs.readFileSync(file, 'utf8'), code, pageNumber);
}

export async function diffPilot(code, options = {}) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const referencePath = path.join(root, spec.source);
  const renderedPath = options.renderedPath || path.join(root, 'reports/output', `${code}.pdf`);
  const reference = options.referenceInspect || await inspectPdfFile(referencePath);
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
  const rasterResult = await compareRaster(referencePath, renderedPath, spec, options.tag || code, {
    engine: options.engine || 'pdftoppm',
    maskMode: options.maskMode || 'allowed',
    textHeatmap: Boolean(options.textHeatmap),
    workDir: options.workDir,
    goldenDir: options.goldenDir,
    writeHeatmap: options.writeHeatmap !== false,
    fastMetrics: Boolean(options.fastMetrics),
    diagnoseNonText: Boolean(options.diagnoseNonText),
    timing: options.timing,
  });
  const deviation = options.skipDeviation ? { spans: [] } : await naturalDeviation(spec);
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
      textInk: TEXT_INK_LIMIT,
      maskedFraction: MASKED_FRACTION_LIMIT,
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
    widthMisses: widthMisses(failures, deviation),
    droppedPastEdge: pageResults.flatMap((page) => page.droppedPastEdge || []),
    consolas: consolasReport(spec, rendered),
    pagination: {
      pass: paginationPass,
      status: pageCount > 1 ? 'exercised' : 'single-page invariants only; this pilot is not the multi-page stress fixture',
      singlePage: single,
      multiPage: multi,
    },
  };
}

async function rasterize(pdf, prefix, engine) {
  if (engine === 'mupdf') {
    const mupdf = await import('mupdf');
    const doc = mupdf.Document.openDocument(fs.readFileSync(pdf), 'application/pdf');
    const matrix = mupdf.Matrix.scale(RASTER_DPI / 72, RASTER_DPI / 72);
    for (let index = 0; index < doc.countPages(); index += 1) {
      const page = doc.loadPage(index);
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false);
      fs.writeFileSync(`${prefix}-${index + 1}.png`, pixmap.asPNG());
    }
    return;
  }
  execFileSync('pdftoppm', ['-png', '-r', String(RASTER_DPI), pdf, prefix]);
}

function slotBoxes(spec) {
  return [spec.slots?.logo, spec.slots?.company].filter(Boolean).map((box) => ({
    ...box,
    kind: box.binding ? 'company' : 'logo',
  }));
}

function fullPageBoxes(spec, pageSpec, pageNumber, maskMode) {
  const boxes = [...slotBoxes(spec)];
  if (maskMode === 'slots') return boxes;
  for (const span of expectedSpans(pageSpec)) {
    if (span.role === 'branding') boxes.push({ ...spanBox(span), kind: 'branding' });
  }
  for (const image of pageSpec.images || []) {
    if (MASK_IMAGE_CLASSES.has(image.proposedClass)) {
      boxes.push({ x: image.x, y: image.y, width: image.width, height: image.height, kind: image.proposedClass });
    }
  }
  boxes.push(...readAllowedDifferences(spec.code, pageNumber));
  return boxes;
}

function overlayBoxes(pageSpec) {
  return (pageSpec.images || [])
    .filter((image) => OVERLAY_CLASSES.has(image.proposedClass))
    .map((image) => ({ x: image.x, y: image.y, width: image.width, height: image.height, kind: 'form_background' }));
}

function copyRect(source, dest, rect) {
  for (let y = rect.y0; y < rect.y1; y += 1) {
    for (let x = rect.x0; x < rect.x1; x += 1) {
      const offset = (y * source.width + x) * 4;
      dest.data[offset] = source.data[offset];
      dest.data[offset + 1] = source.data[offset + 1];
      dest.data[offset + 2] = source.data[offset + 2];
      dest.data[offset + 3] = 255;
    }
  }
}

function coveredPixels(image, pageBox, boxes) {
  const seen = new Uint8Array(image.width * image.height);
  let count = 0;
  for (const box of boxes) {
    if (!box || !Number.isFinite(box.x) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) continue;
    const rect = pdfRect(box, pageBox, image);
    for (let y = rect.y0; y < rect.y1; y += 1) {
      for (let x = rect.x0; x < rect.x1; x += 1) {
        const pixel = y * image.width + x;
        if (seen[pixel]) continue;
        seen[pixel] = 1;
        count += 1;
      }
    }
  }
  return count;
}

function textInkDifference(referenceImage, diff, page, pageBox) {
  const seen = new Uint8Array(referenceImage.width * referenceImage.height);
  let differing = 0;
  let referenceInk = 0;
  for (const span of expectedSpans(page)) {
    if (span.role === 'branding') continue;
    const rect = pdfRect(spanBox(span), pageBox, referenceImage);
    for (let y = rect.y0; y < rect.y1; y += 1) {
      for (let x = rect.x0; x < rect.x1; x += 1) {
        const pixel = y * referenceImage.width + x;
        if (seen[pixel]) continue;
        seen[pixel] = 1;
        const offset = pixel * 4;
        const dark = referenceImage.data[offset] < 180 || referenceImage.data[offset + 1] < 180 || referenceImage.data[offset + 2] < 180;
        if (dark) referenceInk += 1;
        if (diff.data[offset] > 200 && diff.data[offset + 1] < 40 && diff.data[offset + 2] < 40) differing += 1;
      }
    }
  }
  return { differing, referenceInk };
}

async function compareRaster(referencePdf, renderedPdf, spec, code, options = {}) {
  const engine = options.engine || 'pdftoppm';
  const maskMode = options.maskMode || 'allowed';
  const dir = options.workDir || path.join(root, 'reports/output/raster');
  fs.mkdirSync(dir, { recursive: true });
  const goldenDir = options.goldenDir || null;
  const timing = options.timing || null;
  let referenceDir = dir;
  let referenceBase = `${code}-reference`;
  const rasterStarted = Date.now();
  if (goldenDir) {
    fs.mkdirSync(goldenDir, { recursive: true });
    const cached = fs.readdirSync(goldenDir).some((name) => /^page-\d+\.png$/.test(name));
    if (timing) timing.golden = cached ? 'hit' : 'miss';
    if (!cached) await rasterize(referencePdf, path.join(goldenDir, 'page'), engine);
    referenceDir = goldenDir;
    referenceBase = 'page';
  } else {
    if (timing) timing.golden = 'miss';
    await rasterize(referencePdf, path.join(dir, referenceBase), engine);
  }
  if (timing) timing.rasterReferenceMs = Date.now() - rasterStarted;
  const renderedStarted = Date.now();
  const renderedPrefix = path.join(dir, `${code}-rendered`);
  await rasterize(renderedPdf, renderedPrefix, engine);
  if (timing) timing.rasterRenderedMs = Date.now() - renderedStarted;
  const pages = fs.readdirSync(referenceDir).filter((name) => name.startsWith(`${referenceBase}-`) && name.endsWith('.png'));
  let mismatches = 0;
  let pixels = 0;
  let nonTextMismatches = 0;
  let textMismatches = 0;
  let textPixels = 0;
  let imageBarcodePixels = 0;
  let brandingMaskPixels = 0;
  let textInkDiffering = 0;
  let textInkReference = 0;
  const split = {
    embedded: { mismatches: 0, pixels: 0 },
    nonEmbedded: { mismatches: 0, pixels: 0 },
  };
  const ink = [];
  const heatmaps = [];
  const nonTextDiagnosis = [];
  const causes = { 'text glyph': 0, 'text position': 0, vector: 0, 'image/barcode': 0, color: 0, other: 0 };
  for (const name of pages) {
    const pageNumber = name.match(/-(\d+)\.png$/)?.[1];
    const referenceImage = PNG.sync.read(fs.readFileSync(path.join(referenceDir, name)));
    const renderedName = `${code}-rendered-${pageNumber}.png`;
    const renderedImage = PNG.sync.read(fs.readFileSync(path.join(dir, renderedName)));
    if (referenceImage.width !== renderedImage.width || referenceImage.height !== renderedImage.height) {
      return { measured: true, pass: false, reason: `Page ${pageNumber} PNG sizes differ`, rasterizer: engine, dpi: RASTER_DPI };
    }
    const pageSpec = spec.pages?.[Number(pageNumber) - 1] || spec;
    const pageBox = { width: pageSpec.width || spec.page.width, height: pageSpec.height || spec.page.height };
    // Verification-only: paint the reference form_background into both rasters.
    for (const box of overlayBoxes(pageSpec)) {
      const rect = pdfRect(box, pageBox, referenceImage);
      copyRect(referenceImage, renderedImage, rect);
    }
    brandingMaskPixels += coveredPixels(referenceImage, pageBox, fullPageBoxes(spec, pageSpec, pageNumber, maskMode));
    imageBarcodePixels += coveredPixels(referenceImage, pageBox, (pageSpec.images || []).filter((image) => image.proposedClass === 'barcode' || image.proposedClass === 'qr' || image.proposedClass === 'other'));
    for (const box of slotBoxes(spec)) {
      whiteRect(referenceImage, pdfRect(box, pageBox, referenceImage));
      whiteRect(renderedImage, pdfRect(box, pageBox, renderedImage));
    }
    const blurReference = cloneImage(referenceImage);
    const blurRendered = cloneImage(renderedImage);
    const boxes = fullPageBoxes(spec, pageSpec, pageNumber, maskMode).filter((box) => box.kind !== 'logo' && box.kind !== 'company');
    for (const box of boxes) {
      whiteRect(referenceImage, pdfRect(box, pageBox, referenceImage));
      whiteRect(renderedImage, pdfRect(box, pageBox, renderedImage));
    }
    const diff = new PNG({ width: referenceImage.width, height: referenceImage.height });
    const count = pixelmatch(referenceImage.data, renderedImage.data, diff.data, referenceImage.width, referenceImage.height, { threshold: PIXELMATCH_THRESHOLD });
    if (!options.fastMetrics) {
      const pageCauses = classifyDiff(diff, pageSpec);
      for (const [key, value] of Object.entries(pageCauses)) causes[key] += value;
    }
    if (options.textHeatmap) {
      const textDiff = cloneImage(diff);
      const keep = new Uint8Array(diff.width * diff.height);
      for (const span of expectedSpans(pageSpec)) {
        const rect = pdfRect(spanBox(span), pageBox, textDiff);
        for (let y = rect.y0; y < rect.y1; y += 1) {
          for (let x = rect.x0; x < rect.x1; x += 1) keep[y * textDiff.width + x] = 1;
        }
      }
      for (let pixel = 0; pixel < keep.length; pixel += 1) {
        if (keep[pixel]) continue;
        const offset = pixel * 4;
        textDiff.data[offset] = 255;
        textDiff.data[offset + 1] = 255;
        textDiff.data[offset + 2] = 255;
        textDiff.data[offset + 3] = 255;
      }
      fs.writeFileSync(path.join(dir, `${code}-page-${pageNumber}-text.png`), PNG.sync.write(textDiff));
    }
    if (options.writeHeatmap !== false) {
      for (const box of fullPageBoxes(spec, pageSpec, pageNumber, maskMode)) outlineRect(diff, pdfRect(box, pageBox, diff));
      const heatmap = path.join(dir, `${code}-page-${pageNumber}-diff.png`);
      fs.writeFileSync(heatmap, PNG.sync.write(diff));
      heatmaps.push(heatmap.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, ''));
    }
    const extra = measureRasterExtras(blurReference, blurRendered, pageSpec, options);
    if (extra.diagnosis) nonTextDiagnosis.push({ page: Number(pageNumber), ...extra.diagnosis });
    nonTextMismatches += extra.nonTextMismatches;
    textMismatches += extra.textMismatches;
    textPixels += extra.textPixels;
    split.embedded.mismatches += extra.split.embedded.mismatches;
    split.embedded.pixels += extra.split.embedded.pixels;
    split.nonEmbedded.mismatches += extra.split.nonEmbedded.mismatches;
    split.nonEmbedded.pixels += extra.split.nonEmbedded.pixels;
    ink.push(...extra.ink);
    const inkCount = textInkDifference(referenceImage, diff, pageSpec, pageBox);
    textInkDiffering += inkCount.differing;
    textInkReference += inkCount.referenceInk;
    mismatches += count;
    pixels += referenceImage.width * referenceImage.height;
  }
  const ratio = pixels ? mismatches / pixels : 1;
  const nonTextRatio = pixels ? nonTextMismatches / pixels : 1;
  const textRatio = textPixels ? textMismatches / textPixels : 0;
  const maskedFraction = pixels ? brandingMaskPixels / pixels : 1;
  const textInkRatio = textInkReference ? textInkDiffering / textInkReference : 0;
  const nonTextPass = nonTextRatio <= RASTER_LIMIT;
  const textInkPass = textInkRatio <= TEXT_INK_LIMIT;
  const maskedPass = maskedFraction <= MASKED_FRACTION_LIMIT;
  const inkValues = ink.map((item) => item.iou);
  return {
    measured: true,
    pass: nonTextPass && textInkPass && maskedPass,
    mismatches,
    ratio: Number(ratio.toFixed(4)),
    rasterizer: engine,
    maskMode,
    allowedDifferencesFile: fs.existsSync(path.join(root, 'reports/allowed-differences.md')),
    dpi: RASTER_DPI,
    heatmaps,
    causes,
    causeShare: Object.fromEntries(Object.entries(causes).map(([key, value]) => [key, mismatches ? Number((value / mismatches).toFixed(4)) : 0])),
    nonTextDiagnosis,
    nonText: {
      pass: nonTextPass,
      mismatches: nonTextMismatches,
      ratio: Number(nonTextRatio.toFixed(4)),
      limit: RASTER_LIMIT,
      masked: 'span boxes plus logo, letterhead, decorative; form_background overlaid from reference',
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
      embedded: {
        blurredMismatches: split.embedded.mismatches,
        blurredRatio: Number((split.embedded.pixels ? split.embedded.mismatches / split.embedded.pixels : 0).toFixed(4)),
        textPixels: split.embedded.pixels,
      },
      nonEmbedded: {
        blurredMismatches: split.nonEmbedded.mismatches,
        blurredRatio: Number((split.nonEmbedded.pixels ? split.nonEmbedded.mismatches / split.nonEmbedded.pixels : 0).toFixed(4)),
        textPixels: split.nonEmbedded.pixels,
      },
    },
    imageBarcodePixels,
    brandingMaskPixels,
    maskedFraction: Number(maskedFraction.toFixed(4)),
    maskedFractionLimit: MASKED_FRACTION_LIMIT,
    maskedFractionPass: maskedPass,
    textInk: {
      differing: textInkDiffering,
      referenceInk: textInkReference,
      ratio: Number(textInkRatio.toFixed(4)),
      limit: TEXT_INK_LIMIT,
      pass: textInkPass,
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

function unkernedWidth(font, text, size) {
  const run = font.layout(text, { kern: false });
  const units = run.glyphs.reduce((sum, glyph) => sum + glyph.advanceWidth, 0);
  return units / font.unitsPerEm * size;
}

function kernedWidth(font, text, size) {
  const run = font.layout(text);
  const units = run.positions.reduce((sum, position) => sum + position.xAdvance, 0);
  return units / font.unitsPerEm * size;
}

async function naturalDeviation(spec) {
  const cache = new Map();
  const rows = [];
  for (const span of (spec.pages || [spec]).flatMap((page) => expectedSpans(page))) {
    if (!span.glyphWidth) continue;
    const mapped = mapFont(span.font);
    if (!cache.has(mapped.file)) cache.set(mapped.file, fontkit.create(fs.readFileSync(fontFile(mapped))));
    const measured = span.glyphText || (span.segments?.length ? span.segments.map((segment) => segment.text).join('') : span.text);
    const size = span.size || 8;
    let natural = 0;
    let kerned = 0;
    try {
      const font = cache.get(mapped.file);
      natural = unkernedWidth(font, measured, size);
      kerned = kernedWidth(font, measured, size);
    } catch { continue; }
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
      kerned: roundWidth(kerned),
      delta: roundWidth(delta),
      percent: span.glyphWidth ? Math.abs(delta) / span.glyphWidth : 0,
    });
  }
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.font} -> ${row.mapped}`;
    const group = groups.get(key) || { font: key, spans: 0, absPercent: 0, absKerned: 0 };
    group.spans += 1;
    group.absPercent += row.percent;
    group.absKerned += row.glyphWidth ? Math.abs(row.kerned - row.glyphWidth) / row.glyphWidth : 0;
    groups.set(key, group);
  }
  const fonts = [...groups.values()].map((group) => ({
    font: group.font,
    spans: group.spans,
    meanPercent: Number((group.absPercent / group.spans).toFixed(4)),
    meanKernedPercent: Number((group.absKerned / group.spans).toFixed(4)),
  }));
  function take(test) {
    const matched = rows.filter(test);
    const padded = [...matched].sort((a, b) => (b.tj || 0) - (a.tj || 0)).slice(0, 5);
    const plain = matched.filter((row) => !padded.includes(row)).slice(0, 5);
    return [...plain, ...padded].slice(0, 10);
  }
  return {
    kerning: 'disabled',
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

const ALLOWED_IMAGE = new Set(['logo', 'barcode', 'qr', 'letterhead', 'decorative', 'decorative Fresa branding', 'form_background']);

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

function rectDistance(x, y, rect) {
  const dx = x < rect.x0 ? rect.x0 - x : x >= rect.x1 ? x - (rect.x1 - 1) : 0;
  const dy = y < rect.y0 ? rect.y0 - y : y >= rect.y1 ? y - (rect.y1 - 1) : 0;
  return Math.hypot(dx, dy);
}

function emptyHistogram() {
  return { '0-1': 0, '2-3': 0, '4-8': 0, 'over 8': 0 };
}

function bucketDistance(distance) {
  if (distance <= 1) return '0-1';
  if (distance <= 3) return '2-3';
  if (distance <= 8) return '4-8';
  return 'over 8';
}

function paintDistance(field, width, height, rects) {
  for (const rect of rects) {
    const x0 = Math.max(0, rect.x0 - 8);
    const x1 = Math.min(width, rect.x1 + 8);
    const y0 = Math.max(0, rect.y0 - 8);
    const y1 = Math.min(height, rect.y1 + 8);
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const distance = rectDistance(x, y, rect);
        if (distance > 8) continue;
        const index = y * width + x;
        if (distance < field[index]) field[index] = distance;
      }
    }
  }
}

function farCause(x, y, page) {
  for (const image of page.images || []) {
    if (x >= image.x && x <= image.x + image.width && y >= image.y && y <= image.y + image.height) return 'images';
  }
  for (const rect of page.rects || []) {
    const inside = x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    if (!inside) continue;
    const edge = x <= rect.x + 1.2 || y <= rect.y + 1.2 || x >= rect.x + rect.width - 1.2 || y >= rect.y + rect.height - 1.2;
    if (rect.fill && rect.fill !== '#ffffff' && !edge) return 'fills';
    return 'strokes';
  }
  for (const line of page.lines || []) {
    if (pointSegmentDistance(x, y, line) <= (line.width || 0.6) + 1.2) return 'strokes';
  }
  for (const path of page.paths || []) {
    const box = pathBox(path);
    if (!box) continue;
    const inside = x >= box.x - 1.2 && x <= box.x + box.width + 1.2 && y >= box.y - 1.2 && y <= box.y + box.height + 1.2;
    if (!inside) continue;
    return path.paint === 'fill' || path.paint === 'both' ? 'fills' : 'strokes';
  }
  return 'other';
}

function diagnoseNonText(scratch, page) {
  const pageBox = { width: page.width || 595, height: page.height || 842 };
  const textRects = expectedSpans(page).map((span) => pdfRect(spanBox(span), pageBox, scratch));
  const imageRects = (page.images || [])
    .filter((image) => ALLOWED_IMAGE.has(image.proposedClass))
    .map((image) => pdfRect(image, pageBox, scratch));
  const textDistance = new Float32Array(scratch.width * scratch.height);
  const imageDistance = new Float32Array(scratch.width * scratch.height);
  textDistance.fill(99);
  imageDistance.fill(99);
  paintDistance(textDistance, scratch.width, scratch.height, textRects);
  paintDistance(imageDistance, scratch.width, scratch.height, imageRects);
  const toText = emptyHistogram();
  const toImage = emptyHistogram();
  const toEither = emptyHistogram();
  const far = { fills: 0, strokes: 0, clip: 0, images: 0, other: 0 };
  let farCount = 0;
  let minX = scratch.width;
  let minY = scratch.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < scratch.height; y += 1) {
    for (let x = 0; x < scratch.width; x += 1) {
      const offset = (y * scratch.width + x) * 4;
      if (!(scratch.data[offset] > 200 && scratch.data[offset + 1] < 40 && scratch.data[offset + 2] < 40)) continue;
      const index = y * scratch.width + x;
      const text = textDistance[index];
      const image = imageDistance[index];
      const either = Math.min(text, image);
      toText[bucketDistance(text)] += 1;
      toImage[bucketDistance(image)] += 1;
      toEither[bucketDistance(either)] += 1;
      if (either <= 8) continue;
      farCount += 1;
      const pdfX = (x / scratch.width) * pageBox.width;
      const pdfY = pageBox.height - (y / scratch.height) * pageBox.height;
      far[farCause(pdfX, pdfY, page)] += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return {
    toText,
    toImage,
    toEither,
    far,
    farCount,
    bounds: farCount ? { x0: minX, y0: minY, x1: maxX + 1, y1: maxY + 1 } : null,
  };
}

function measureRasterExtras(referenceImage, renderedImage, page, options = {}) {
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
  const diagnosis = options.diagnoseNonText ? diagnoseNonText(scratch, page) : null;
  if (options.fastMetrics) {
    return {
      nonTextMismatches,
      textMismatches: 0,
      textPixels: 0,
      ink: [],
      split: { embedded: { mismatches: 0, pixels: 0 }, nonEmbedded: { mismatches: 0, pixels: 0 } },
      diagnosis,
    };
  }
  const blurredLeft = gaussianBlur(referenceImage);
  const blurredRight = gaussianBlur(renderedImage);
  const diff = new PNG({ width: referenceImage.width, height: referenceImage.height });
  pixelmatch(blurredLeft.data, blurredRight.data, diff.data, diff.width, diff.height, { threshold: PIXELMATCH_THRESHOLD });
  const covered = new Uint8Array(referenceImage.width * referenceImage.height);
  let textPixels = 0;
  let textMismatches = 0;
  const split = {
    embedded: { mismatches: 0, pixels: 0 },
    nonEmbedded: { mismatches: 0, pixels: 0 },
  };
  for (const span of expectedSpans(page)) {
    const box = spanBox(span);
    const bucket = span.fontEmbedded === false ? split.nonEmbedded : split.embedded;
    const rect = pdfRect(box, pageBox, referenceImage);
    for (let y = rect.y0; y < rect.y1; y += 1) {
      for (let x = rect.x0; x < rect.x1; x += 1) {
        const pixel = y * referenceImage.width + x;
        if (covered[pixel]) continue;
        covered[pixel] = 1;
        textPixels += 1;
        bucket.pixels += 1;
        const offset = pixel * 4;
        if (diff.data[offset] > 200 && diff.data[offset + 1] < 40 && diff.data[offset + 2] < 40) {
          textMismatches += 1;
          bucket.mismatches += 1;
        }
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
  return { nonTextMismatches, textMismatches, textPixels, ink, split, diagnosis };
}

function outlineRect(image, rect) {
  const x0 = Math.max(0, rect.x0);
  const x1 = Math.min(image.width, rect.x1);
  const y0 = Math.max(0, rect.y0);
  const y1 = Math.min(image.height, rect.y1);
  const paint = (x, y) => {
    const offset = (y * image.width + x) * 4;
    image.data[offset] = 0;
    image.data[offset + 1] = 160;
    image.data[offset + 2] = 255;
    image.data[offset + 3] = 255;
  };
  for (let thickness = 0; thickness < 2; thickness += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (y0 + thickness < y1) paint(x, y0 + thickness);
      if (y1 - 1 - thickness >= y0) paint(x, y1 - 1 - thickness);
    }
    for (let y = y0; y < y1; y += 1) {
      if (x0 + thickness < x1) paint(x0 + thickness, y);
      if (x1 - 1 - thickness >= x0) paint(x1 - 1 - thickness, y);
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
    widthMisses: result.widthMisses,
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

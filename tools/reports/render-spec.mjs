/**
 * Draw a spec with bundled fonts. Demo values are the reference span strings.
 * Pass --overflow to substitute long values and exercise wrap, clip, and shrink.
 * Run: node tools/reports/render-spec.mjs <CODE> [--overflow]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFName, degrees, rgb } from 'pdf-lib';
import { applyAdvanceTable, baseFontName, embedReferenceFont, referenceFontSnapshots, widthTables } from './reference-font.mjs';

const require = createRequire(import.meta.url);
const {
  appendBezierCurve,
  clip,
  closePath,
  endPath,
  fill,
  fillAndStroke,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  restoreDashPattern,
  beginText,
  endText,
  setCharacterSpacing,
  setCharacterSqueeze,
  setFontAndSize,
  setTextMatrix,
  showText,
  setDashPattern,
  setFillingRgbColor,
  setLineCap,
  setLineJoin,
  setLineWidth,
  setStrokingRgbColor,
  setTextRenderingMode,
  setWordSpacing,
  stroke,
} = require('pdf-lib/cjs/api/operators.js');
const CODE128AUTO = require('jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js').default;
const QRCode = require('qrcode');
import { fontFile, mapFont } from './font-map.mjs';
import { isAllowlisted } from './allowlist.mjs';

const CHAR_FALLBACK = JSON.parse(fs.readFileSync(path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), 'reports/char-fallback.json'), 'utf8'));

function parseCodepoint(token) {
  return Number.parseInt(String(token).replace(/^U\+/i, ''), 16);
}

function arabicFallbackCodepoints() {
  const set = new Set((CHAR_FALLBACK.codepoints || []).map(parseCodepoint));
  for (const range of CHAR_FALLBACK.ranges || []) {
    const from = parseCodepoint(range.from);
    const to = parseCodepoint(range.to);
    for (let code = from; code <= to; code += 1) set.add(code);
  }
  return set;
}

const ARABIC_FALLBACK_CODES = arabicFallbackCodepoints();

// Test-only local fonts. Never copied into the repo. --system-fonts reads them for the outline diagnostic.
const SYSTEM_ARIAL = 'C:/Windows/Fonts/arial.ttf';
const SYSTEM_ARIAL_BOLD = 'C:/Windows/Fonts/arialbd.ttf';
const SYSTEM_CONSOLAS = 'C:/Windows/Fonts/consola.ttf';
// Consolas embeds 1126 units at 2048 per em (549.8/1000). Liberation Mono embeds 1229 (600.1/1000).
const CONSOLAS_ADVANCE = 1126;
const LIBERATION_MONO_ADVANCE = 1229;
const FONT_UPM = 2048;

export function fontPathFor(spanFont, systemFonts = false) {
  const mapped = mapFont(spanFont);
  if (!systemFonts) return fontFile(mapped);
  if (/consolas/i.test(spanFont || '')) return SYSTEM_CONSOLAS;
  if (/arial/i.test(spanFont || '') && !/unicode/i.test(spanFont || '')) {
    return /bold|black|semibold|heavy/i.test(spanFont || '') ? SYSTEM_ARIAL_BOLD : SYSTEM_ARIAL;
  }
  return fontFile(mapped);
}

export function characterSpacingFor(span, systemFonts = false) {
  const base = span.charSpacing || 0;
  if (systemFonts || !/consolas/i.test(span.font || '')) return base;
  return base + ((CONSOLAS_ADVANCE - LIBERATION_MONO_ADVANCE) / FONT_UPM) * (span.size || 8);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const longValues = JSON.parse(fs.readFileSync(path.join(root, 'reports/fixtures/long-values.json'), 'utf8'));

function formatFor(span, spec) {
  const bound = spec.formatRules.find((rule) => rule.path === span.binding)?.format;
  if (bound) return bound;
  if (/amount|total|qty|rate|price|tax|debit|credit|balance|number|qty/i.test(span.binding || '')) return 'number';
  if (/date|validity|eta|etd/i.test(span.binding || '')) return 'date';
  if (/address|party|shipper|consignee|notify|description|name|remarks|cargo/i.test(span.binding || '')) return 'text';
  if (/address|party|shipper|consignee|notify|description|name|remarks|cargo/i.test(span.text || '')) return 'text';
  return '';
}

function fresaFragment(text) {
  return /fresa|echnolog|powered by/i.test(String(text || ''));
}

function organizationText(span, organization) {
  if (!organization) return '';
  const raw = String(span.text || '');
  if (/powered by/i.test(raw) || fresaFragment(raw) && span.brandingKind !== 'name' && span.brandingKind !== 'address' && span.brandingKind !== 'phone') {
    if (/@/.test(raw)) return organization.email || '';
    if (/https?:|www\.|\.com/i.test(raw)) return organization.website || '';
    if (/powered by|echnolog/i.test(raw)) return '';
  }
  if (span.brandingKind === 'address') return organization.address || '';
  if (span.brandingKind === 'phone') return organization.phone || '';
  if (span.brandingKind === 'url') return organization.website || '';
  if (span.brandingKind === 'email') return organization.email || '';
  if (span.brandingKind === 'name') {
    if (/@/.test(raw)) return organization.email || '';
    if (/https?:|www\.|\.com/i.test(raw)) return organization.website || '';
    if (/powered by|echnolog/i.test(raw)) return '';
    return organization.name || '';
  }
  return '';
}

function replacement(span, spec) {
  const format = formatFor(span, spec);
  if (format === 'date') return longValues.date;
  if (format === 'number' || format === 'currency') return longValues.number;
  if (format === 'amount-words') return longValues['amount-words'];
  return longValues.text;
}

function overflowMode(span, spec) {
  if (span.role !== 'dynamic') return 'none';
  const format = formatFor(span, spec);
  if (format === 'number' || format === 'currency' || format === 'date') return 'shrink-clip';
  if (format === 'text' || format === 'amount-words') return 'wrap-shrink-clip';
  // Heuristic for unbound dynamic fields.
  if (/^\(?-?[0-9]/.test(String(span.text || '').trim())) return 'shrink-clip';
  return 'wrap-shrink-clip';
}

function maxLinesFor(span, spec) {
  const size = span.size || 8;
  const boxHeight = Math.max(span.height || 0, size);
  const fromBox = Math.max(1, Math.floor(boxHeight / (size * 1.15)));
  const cap = spec.overflowRules?.maxLines;
  // Prefer box-derived lines; optional rule is only an upper bound.
  return cap ? Math.min(fromBox, cap) : fromBox;
}

function wrapLines(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function keepPrecomposedLatin(font) {
  const face = font.embedder?.font;
  if (!face?.layout || face.precomposedLatin) return;
  const original = face.layout.bind(face);
  face.layout = (text, fontFeatures) => {
    const glyphs = [];
    const positions = [];
    for (const chunk of String(text).split(/([\u1EA0-\u1EF9])/u)) {
      if (!chunk) continue;
      const codePoint = chunk.codePointAt(0);
      const single = [...chunk].length === 1;
      if (single && codePoint >= 0x1EA0 && codePoint <= 0x1EF9 && face.hasGlyphForCodePoint(codePoint)) {
        const glyph = face.glyphForCodePoint(codePoint);
        glyphs.push(glyph);
        positions.push({ xAdvance: glyph.advanceWidth, yAdvance: 0, xOffset: 0, yOffset: 0 });
      } else {
        const run = original(chunk, fontFeatures);
        glyphs.push(...run.glyphs);
        positions.push(...run.positions);
      }
    }
    return { glyphs, positions };
  };
  face.precomposedLatin = true;
}

async function embedBundles(doc, options = {}, pages = [], snapshots = new Map()) {
  const cache = new Map();
  const features = options.systemFonts ? undefined : { kern: false, liga: false, clig: false };
  const widths = widthTables(pages);
  const outlines = [];
  const references = new Map();
  async function embed(file, fontName) {
    const key = `${fontName || ''}|${file}|${features ? 'nokern' : 'default'}`;
    if (!cache.has(key)) {
      const font = await doc.embedFont(fs.readFileSync(file), { subset: true, features });
      keepPrecomposedLatin(font);
      cache.set(key, font);
      if (fontName && widths.has(fontName)) outlines.push({ font, widths: widths.get(fontName) });
    }
    return cache.get(key);
  }
  return {
    embed,
    systemFonts: Boolean(options.systemFonts),
    referenceFont(span) {
      const key = baseFontName(span.font);
      if (!references.has(key)) references.set(key, embedReferenceFont(doc, span.font, snapshots.get(key)));
      return references.get(key);
    },
    applyWidths() {
      let patched = 0;
      for (const entry of outlines) patched += applyAdvanceTable(entry.font, entry.widths);
      return patched;
    },
    async forSpan(span, text) {
      const mapped = mapFont(span.font);
      const primary = await embed(fontPathFor(span.font, options.systemFonts), span.font);
      try {
        primary.encodeText(text);
        return { font: primary, mapped, fallback: false };
      } catch {
        const fallback = mapFont(mapped.weight === 'bold' ? 'Noto Sans Bold' : 'Noto Sans');
        return { font: await embed(fontFile(fallback), `${span.font}|fallback`), mapped: fallback, fallback: true };
      }
    },
  };
}

function drawClipped(page, span, draw) {
  const height = Math.max(span.size, 4);
  page.pushOperators(
    pushGraphicsState(),
    moveTo(span.x, span.y - 1),
    lineTo(span.x + Math.max(span.width, 1), span.y - 1),
    lineTo(span.x + Math.max(span.width, 1), span.y + height),
    lineTo(span.x, span.y + height),
    closePath(),
    clip(),
    endPath(),
  );
  draw();
  page.pushOperators(popGraphicsState());
}

function parseColor(value) {
  const text = String(value || '0,0,0');
  if (text.includes(',')) {
    const [red, green, blue] = text.split(',').map(Number);
    return rgb(red || 0, green || 0, blue || 0);
  }
  const hex = text.replace('#', '');
  const parsed = Number.parseInt(hex.padEnd(6, '0').slice(0, 6), 16);
  return rgb(((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255);
}

function rgbParts(hex) {
  const text = String(hex || '#000000').replace('#', '');
  const value = Number.parseInt(text.padEnd(6, '0').slice(0, 6), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function drawPositioned(page, span, pieces, size, color, spacing) {
  const stroke = rgbParts(span.stroke || span.color || '#000000');
  const fill = rgbParts(span.color || '#000000');
  const arabic = [...String(span.text || '')].some((char) => ARABIC_FALLBACK_CODES.has(char.codePointAt(0)));
  // Arabic: never apply horizontal scaling; match width with character spacing only.
  const scaleX = arabic ? 1 : (Number(span.horizontalScale) || 1);
  const scaled = !arabic && Math.abs(scaleX - 1) > 0.0005;
  page.pushOperators(
    pushGraphicsState(),
    setCharacterSpacing(spacing),
    setWordSpacing(span.wordSpacing || 0),
    setCharacterSqueeze(arabic ? 100 : (span.hScale || 100)),
    setLineWidth(span.strokeWidth || 0.6),
    setStrokingRgbColor(...stroke),
    setFillingRgbColor(...fill),
    setTextRenderingMode(span.renderMode || 0),
  );
  for (const piece of pieces) {
    if (!piece.text) continue;
    // pdf-lib drawText only fills; keep Tr/stroke from the outer text state.
    const { newFontKey } = page.setOrEmbedFont(piece.font);
    page.pushOperators(
      beginText(),
      setFontAndSize(newFontKey, size),
      setTextMatrix(scaled ? scaleX : 1, 0, 0, 1, piece.x, piece.y),
      showText(piece.font.encodeText(piece.text)),
      endText(),
    );
  }
  page.pushOperators(popGraphicsState());
}

function isArabicPresentation(char) {
  return ARABIC_FALLBACK_CODES.has(char.codePointAt(0));
}

function placeArabicGlyphs(font, span, text, x, y) {
  const source = String(span.glyphText || text);
  const chars = [...source];
  const advances = span.advances || [];
  if (!advances.length || advances.length < chars.length) return null;
  const size = span.size || 8;
  const lead = source.startsWith(text) ? 0 : Math.max(0, source.indexOf(text));
  const wanted = [...text].length;
  const pieces = [];
  let cursor = x;
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const inRun = index >= lead && index < lead + wanted;
    if (inRun && char.trim()) {
      pieces.push({ text: char, font, x: cursor, y, fallback: true, arabic: true, placed: true });
    }
    const advance = ((Number(advances[index]) || 0) / 1000) * size;
    const spacing = (span.charSpacing || 0) + (char === ' ' ? (span.wordSpacing || 0) : 0);
    cursor += advance + spacing;
  }
  return pieces.length ? pieces : null;
}

async function piecesFor(bundles, span, text, x, y) {
  const chars = [...String(text)];
  const allArabic = chars.length > 0 && chars.every((char) => isArabicPresentation(char) || /\s/.test(char));
  if (allArabic && !bundles.systemFonts) {
    const naskh = await bundles.embed(fontFile(mapFont('Noto Naskh Arabic')), 'NotoNaskhArabic');
    const placed = placeArabicGlyphs(naskh, span, text, x, y);
    if (placed) return placed;
    return [{ text, font: naskh, x, y, fallback: true, arabic: true }];
  }
  if (span.fontEmbedded === false && !bundles.systemFonts && !chars.some(isArabicPresentation)) {
    return [{ text, font: bundles.referenceFont(span), x, y, fallback: false }];
  }
  const mapped = mapFont(span.font);
  const primaryFile = fontPathFor(span.font, bundles.systemFonts);
  const primary = span.fontEmbedded === false && !bundles.systemFonts
    ? bundles.referenceFont(span)
    : await bundles.embed(primaryFile, span.font);
  const fallbackName = mapped.weight === 'bold' ? 'Noto Sans Bold' : 'Noto Sans';
  const fallback = await bundles.embed(fontFile(mapFont(fallbackName)), `${span.font}|fallback`);
  const naskh = await bundles.embed(fontFile(mapFont('Noto Naskh Arabic')), 'NotoNaskhArabic');
  const runs = [];
  let current = '';
  let useFallback = null;
  let useNaskh = null;
  function push() {
    if (!current) return;
    const font = useNaskh ? naskh : useFallback ? fallback : primary;
    runs.push({ text: current, font, fallback: Boolean(useFallback || useNaskh), arabic: Boolean(useNaskh) });
    current = '';
  }
  for (const char of chars) {
    const arabicChar = isArabicPresentation(char);
    let fallbackChar = false;
    if (!arabicChar) {
      try { primary.encodeText(char); } catch { fallbackChar = true; }
    }
    if (useFallback !== null && (fallbackChar !== useFallback || arabicChar !== useNaskh)) push();
    useFallback = fallbackChar;
    useNaskh = arabicChar;
    current += char;
  }
  push();
  let cursor = x;
  return runs.map((run) => {
    const piece = { ...run, x: cursor, y };
    cursor += run.font.widthOfTextAtSize(run.text, span.size || 8);
    return piece;
  });
}

function drawFilledRule(page, line) {
  const dx = Math.abs(line.x2 - line.x1);
  const dy = Math.abs(line.y2 - line.y1);
  const thickness = line.width || 0.4;
  const color = parseColor(line.color);
  // A filled rule records the stroke color that was current in the reference.
  // Set that stroke color and cap before the fill so the re-extracted line matches.
  page.pushOperators(
    pushGraphicsState(),
    setLineCap(line.lineCap || 0),
    setLineJoin(line.lineJoin || 0),
    setStrokingRgbColor(color.red, color.green, color.blue),
  );
  const box = dx >= dy
    ? {
      x: Math.min(line.x1, line.x2),
      y: ((line.y1 + line.y2) / 2) - thickness / 2,
      width: dx,
      height: thickness,
    }
    : {
      x: ((line.x1 + line.x2) / 2) - thickness / 2,
      y: Math.min(line.y1, line.y2),
      width: thickness,
      height: dy,
    };
  page.drawRectangle({ ...box, color, borderWidth: 0 });
  page.pushOperators(popGraphicsState());
}

function drawPath(page, path) {
  const strokeColor = parseColor(path.stroke || '#000000');
  const fillColor = parseColor(path.fill || '#000000');
  const operators = [
    pushGraphicsState(),
    setLineWidth(path.strokeWidth || 0.6),
    setLineCap(path.lineCap || 0),
    setLineJoin(path.lineJoin || 0),
    setStrokingRgbColor(strokeColor.red, strokeColor.green, strokeColor.blue),
    setFillingRgbColor(fillColor.red, fillColor.green, fillColor.blue),
  ];
  if (path.dash?.length) operators.push(setDashPattern(path.dash, path.dashPhase || 0));
  let started = false;
  for (const command of path.commands || []) {
    if (command.op === 'm') operators.push(moveTo(command.p[0], command.p[1]));
    else if (command.op === 'l') operators.push(lineTo(command.p[0], command.p[1]));
    else if (command.op === 'c') {
      const [c1, c2, end] = command.p;
      if (!started) operators.push(moveTo(c1[0], c1[1]));
      operators.push(appendBezierCurve(c1[0], c1[1], c2[0], c2[1], end[0], end[1]));
    } else if (command.op === 'h') operators.push(closePath());
    started = command.op !== 'h';
  }
  if (path.paint === 'fill') operators.push(fill());
  else if (path.paint === 'both') operators.push(fillAndStroke());
  else operators.push(stroke());
  operators.push(popGraphicsState());
  page.pushOperators(...operators);
}

function barcodeEncoder(symbology) {
  const name = String(symbology || '').toUpperCase();
  if (name.includes('39')) return require('jsbarcode/bin/barcodes/CODE39/CODE39.js').default;
  if (name.includes('EAN') && name.includes('13')) return require('jsbarcode/bin/barcodes/EAN_UPC/EAN13.js').default;
  if (name.includes('ITF') || name.includes('I25')) return require('jsbarcode/bin/barcodes/ITF/ITF.js').default;
  return CODE128AUTO;
}

function drawBarcode(page, image) {
  const value = String(image.barcode?.payload || image.demoValue || '').trim();
  if (!value) return false;
  if (/QR/i.test(image.barcode?.symbology || '')) return drawQr(page, { ...image, demoValue: value });
  let bits = '';
  try {
    const encoded = new (barcodeEncoder(image.barcode?.symbology))(value, {});
    if (encoded.valid && !encoded.valid()) return false;
    bits = encoded.encode().data;
  } catch {
    return false;
  }
  if (!bits) return false;
  const quiet = image.barcode?.quietZone || 0;
  const moduleWidth = image.barcode?.moduleWidth || Math.max((image.width - quiet * 2) / bits.length, 0.2);
  let cursor = image.x + quiet;
  for (const bit of bits) {
    if (bit === '1') {
      page.drawRectangle({ x: cursor, y: image.y, width: Math.max(moduleWidth, 0.15), height: image.height, color: rgb(0, 0, 0) });
    }
    cursor += moduleWidth;
  }
  return true;
}

function drawQr(page, image) {
  const value = String(image.demoValue || '').trim();
  if (!value) return false;
  let code;
  try { code = QRCode.create(value, { errorCorrectionLevel: 'M' }); } catch { return false; }
  const size = code.modules.size;
  const moduleSize = Math.min(image.width, image.height) / size;
  const originX = image.x + (image.width - moduleSize * size) / 2;
  const originY = image.y + (image.height - moduleSize * size) / 2;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!code.modules.get(row, col)) continue;
      page.drawRectangle({
        x: originX + col * moduleSize,
        y: originY + (size - 1 - row) * moduleSize,
        width: moduleSize,
        height: moduleSize,
        color: rgb(0, 0, 0),
      });
    }
  }
  return true;
}

export async function renderSpec(code, options = {}) {
  const spec = options.spec || JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  let pages = spec.pages?.length ? spec.pages : [spec];
  if (options.live) {
    const blank = (source) => !(source.spans || []).length && !(source.lines || []).length && !(source.rects || []).length && !(source.paths || []).length && !(source.images || []).length && !(source.table?.rows || []).length;
    while (pages.length > 1 && blank(pages.at(-1))) pages = pages.slice(0, -1);
  }
  const snapshots = options.systemFonts ? new Map() : await referenceFontSnapshots(path.join(root, spec.source));
  const bundles = await embedBundles(doc, options, pages, snapshots);
  const overflowLog = [];
  for (const source of pages) {
    const box = source.pageBox || (source.mediaBox ? source : null);
    const media = box?.mediaBox;
    const page = doc.addPage(media ? [media[2] - media[0], media[3] - media[1]] : [source.width || spec.page.width, source.height || spec.page.height]);
    if (media) {
      page.setMediaBox(media[0], media[1], media[2] - media[0], media[3] - media[1]);
      if (box.cropBox) page.setCropBox(box.cropBox[0], box.cropBox[1], box.cropBox[2] - box.cropBox[0], box.cropBox[3] - box.cropBox[1]);
      else page.node.delete(PDFName.of('CropBox'));
      page.setRotation(degrees(box.rotate || 0));
      if (box.userUnit && box.userUnit !== 1) page.node.set(PDFName.of('UserUnit'), doc.context.obj(box.userUnit));
    }
    const shapes = [
      ...(source.rects || []).map((rect) => ({ kind: 'rect', order: rect.order ?? 0, rect })),
      ...(source.lines || []).map((line) => ({ kind: 'line', order: line.order ?? 0, line })),
      ...(source.paths || []).map((path) => ({ kind: 'path', order: path.order ?? 0, path })),
    ].sort((left, right) => left.order - right.order);
    for (const shape of shapes) {
      if (shape.kind === 'path') {
        drawPath(page, shape.path);
        continue;
      }
      if (shape.kind === 'line') {
        const line = shape.line;
        if (line.source === 'rect') {
          drawFilledRule(page, line);
          continue;
        }
        page.pushOperators(pushGraphicsState(), setLineJoin(line.lineJoin || 0));
        page.drawLine({
          start: { x: line.x1, y: line.y1 },
          end: { x: line.x2, y: line.y2 },
          thickness: line.width || 0.4,
          color: parseColor(line.color),
          lineCap: line.lineCap == null ? 0 : line.lineCap,
          dashArray: line.dash?.length ? line.dash : undefined,
          dashPhase: line.dash?.length ? (line.dashPhase || 0) : undefined,
        });
        page.pushOperators(popGraphicsState());
        continue;
      }
      const rect = shape.rect;
      if (rect.dash?.length) page.pushOperators(setDashPattern(rect.dash, rect.dashPhase || 0));
      page.drawRectangle({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        borderWidth: rect.stroke ? (rect.strokeWidth || 0.4) : 0,
        borderColor: rect.stroke ? parseColor(rect.stroke) : undefined,
        color: rect.fill ? parseColor(rect.fill) : undefined,
        borderDashArray: rect.dash?.length ? rect.dash : undefined,
        borderDashPhase: rect.dashPhase || undefined,
      });
      if (rect.dash?.length) page.pushOperators(restoreDashPattern());
    }
    for (const image of source.images || []) {
      if (options.values && (image.proposedClass === 'barcode' || image.proposedClass === 'qr' || image.barcode?.decoded)) continue;
      if (image.proposedClass === 'barcode' || image.proposedClass === 'qr' || image.barcode?.decoded) drawBarcode(page, image);
      const logoSlot = image.proposedClass === 'logo' || (image.proposedClass === 'letterhead' && options.values);
      if (logoSlot && (options.logoBytes || (options.logoPng && fs.existsSync(options.logoPng)))) {
        const bytes = options.logoBytes || fs.readFileSync(options.logoPng);
        try {
          const embedded = bytes[0] === 0xff && bytes[1] === 0xd8 ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
          let x = image.x;
          let y = image.y;
          let width = image.width || embedded.width;
          let height = image.height || embedded.height;
          if (image.proposedClass === 'letterhead' && embedded.width && embedded.height) {
            const fit = Math.min(image.height / embedded.height, (image.height * 2.6) / embedded.width);
            width = embedded.width * fit;
            height = embedded.height * fit;
            y = image.y + Math.max(0, (image.height - height) / 2);
          }
          page.drawImage(embedded, { x, y, width, height });
        } catch {
          // An unreadable logo leaves the slot empty.
        }
      }
    }
    const paintSpans = [
      ...(source.spans || []),
      ...(source.table?.rows || []).flat().filter(Boolean).map((cell) => ({ ...cell, role: cell.role || 'dynamic' })),
    ];
    for (const span of paintSpans) {
      const demo = span.text;
      let text = options.overflow && span.role === 'dynamic' ? replacement(span, spec) : demo;
      let mode = options.overflow ? overflowMode(span, spec) : 'none';
      if (options.values && Object.prototype.hasOwnProperty.call(options.values, span.id) && options.values[span.id] === '') {
        continue;
      }
      if ((options.organization || options.values) && span.role === 'static' && fresaFragment(demo) && !options.values?.[span.id]) {
        continue;
      }
      if (options.values && span.role === 'static' && !options.values[span.id] && !isAllowlisted(demo)) {
        continue;
      }
      if (options.organization && span.role === 'branding') {
        text = organizationText(span, options.organization);
        mode = text ? 'wrap-shrink-clip' : 'none';
      } else if (span.role === 'branding') {
        continue;
      } else if (options.values && span.role === 'dynamic') {
        text = options.values[span.id] ?? '';
        mode = overflowMode(span, spec);
      } else if (options.values && span.role === 'static' && options.values[span.id]) {
        text = options.values[span.id];
        mode = 'wrap-shrink-clip';
      }
      if (!text) continue;
      if (Array.isArray(options.painted)) options.painted.push(String(text).replace(/\s+/g, ' ').trim());
      const color = parseColor(span.color);
      const box = Math.max(span.width, 1);
      let size = span.size || 8;
      const originalSize = size;
      const probe = await piecesFor(bundles, span, text, span.x, span.y);
      const probeFont = probe[0]?.font;
      const mediaWidth = media ? media[2] - media[0] : (source.width || spec.page.width);
      const pageWidth = mediaWidth;
      const visibleSegments = (span.segments || []).filter((segment) => segment.x < pageWidth);
      let spacing = span.advances?.length || span.fontEmbedded === false
        ? (span.charSpacing || 0)
        : characterSpacingFor(span, options.systemFonts);
      if (probe.some((piece) => piece.placed)) {
        spacing = 0;
      } else if (probe[0]?.arabic && probeFont) {
        const chars = [...String(text)];
        const natural = probeFont.widthOfTextAtSize(text, size);
        const target = span.width || natural;
        spacing = chars.length > 1 ? (target - natural) / (chars.length - 1) : 0;
      }
      const maxLines = maxLinesFor(span, spec);
      const minSize = originalSize * 0.7;

      if (mode === 'wrap-shrink-clip' && probeFont) {
        const words = String(text).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
        function pack(atSize) {
          const lines = wrapLines(text, probeFont, atSize, box).slice(0, maxLines);
          const packed = lines.join(' ').split(/\s+/).filter(Boolean);
          const widthOk = lines.every((line) => probeFont.widthOfTextAtSize(line, atSize) <= box + 0.5);
          return { lines, fitted: widthOk && packed.length >= words.length };
        }
        let packed = pack(size);
        if (!packed.fitted) {
          while (size > minSize + 0.01) {
            size -= 0.25;
            packed = pack(size);
            if (packed.fitted) break;
          }
        }
        if (!packed.fitted) {
          overflowLog.push({ id: span.id, mode: 'clip', warning: 'text overflow clipped after wrap/shrink', size, lines: packed.lines.length, box });
          const clipped = packed.lines[0] || text;
          const linePieces = await piecesFor(bundles, { ...span, size }, clipped, span.x, span.y);
          drawClipped(page, span, () => drawPositioned(page, span, linePieces, size, color, spacing));
          continue;
        }
        for (let index = 0; index < packed.lines.length; index += 1) {
          const linePieces = await piecesFor(bundles, { ...span, size }, packed.lines[index], span.x, span.y - index * size * 1.15);
          drawPositioned(page, span, linePieces, size, color, spacing);
        }
        overflowLog.push({ id: span.id, mode: size < originalSize ? 'wrap-shrink' : 'wrap', size, lines: packed.lines.length, box });
        continue;
      }

      if (mode === 'shrink-clip' && probeFont) {
        while (size > minSize + 0.01 && probeFont.widthOfTextAtSize(text, size) > box + 0.5) size -= 0.25;
        const positioned = await piecesFor(bundles, { ...span, size }, text, span.x, span.y);
        if (probeFont.widthOfTextAtSize(text, size) > box + 0.5) {
          overflowLog.push({ id: span.id, mode: 'clip', warning: 'number overflow clipped after shrink', size, lines: 1, box });
          drawClipped(page, span, () => drawPositioned(page, span, positioned, size, color, spacing));
        } else {
          drawPositioned(page, span, positioned, size, color, spacing);
          overflowLog.push({ id: span.id, mode: size < originalSize ? 'shrink' : 'fit', size, lines: 1, box });
        }
        continue;
      }

      const positioned = span.segments?.length && mode === 'none'
        ? (await Promise.all(visibleSegments.map(async (segment) => piecesFor(bundles, { ...span, size }, segment.text, segment.x, segment.y)))).flat()
        : (span.x >= pageWidth ? [] : await piecesFor(bundles, { ...span, size }, text, span.x, span.y));
      if (!positioned.length) continue;
      drawPositioned(page, span, positioned, size, color, spacing);
    }
  }
  const patchedAdvances = bundles.applyWidths();
  const bytes = await doc.save();
  const outDir = path.join(root, 'reports/output');
  fs.mkdirSync(outDir, { recursive: true });
  const suffix = options.overflow ? '.overflow' : '';
  const outPath = options.outputPath || path.join(outDir, `${code}${suffix}.pdf`);
  fs.writeFileSync(outPath, bytes);
  if (!options.quietArtifacts) {
    fs.writeFileSync(path.join(outDir, `${code}.advances.json`), `${JSON.stringify({ code, patchedAdvances }, null, 2)}\n`);
  }
  const warnings = overflowLog.filter((entry) => entry.warning);
  if (!options.quietArtifacts && (options.overflow || warnings.length)) {
    fs.writeFileSync(path.join(outDir, `${code}.overflow.json`), `${JSON.stringify({ code, maxLines: spec.overflowRules?.maxLines, spans: overflowLog, warnings }, null, 2)}\n`);
  }
  return { outPath, overflowLog, warnings };
}

const code = process.argv[2];
if (code && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf('--out');
  console.log(await renderSpec(code, {
    overflow: process.argv.includes('--overflow'),
    live: process.argv.includes('--live'),
    systemFonts: process.argv.includes('--system-fonts'),
    outputPath: outFlag >= 0 ? process.argv[outFlag + 1] : undefined,
  }));
}

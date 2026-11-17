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
import { PDFDocument, rgb } from 'pdf-lib';

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
  setCharacterSpacing,
  setCharacterSqueeze,
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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const longValues = JSON.parse(fs.readFileSync(path.join(root, 'reports/fixtures/long-values.json'), 'utf8'));

function parseColor(hex) {
  const text = String(hex || '#000000').replace('#', '');
  const value = Number.parseInt(text.padEnd(6, '0').slice(0, 6), 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function formatFor(span, spec) {
  return spec.formatRules.find((rule) => rule.path === span.binding)?.format || '';
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
  if (format === 'number' || format === 'currency' || format === 'date') return spec.overflowRules.number || 'shrink';
  if (format === 'text' || format === 'amount-words') return spec.overflowRules.text || 'wrap';
  return spec.overflowRules.default || 'clip';
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

async function embedBundles(doc) {
  const cache = new Map();
  async function embed(file) {
    if (!cache.has(file)) cache.set(file, await doc.embedFont(fs.readFileSync(file), { subset: true }));
    return cache.get(file);
  }
  return {
    embed,
    async forSpan(span, text) {
      const mapped = mapFont(span.font);
      const primary = await embed(fontFile(mapped));
      try {
        primary.encodeText(text);
        return { font: primary, mapped, fallback: false };
      } catch {
        const fallback = mapFont(mapped.weight === 'bold' ? 'Noto Sans Bold' : 'Noto Sans');
        return { font: await embed(fontFile(fallback)), mapped: fallback, fallback: true };
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

function rgbParts(hex) {
  const text = String(hex || '#000000').replace('#', '');
  const value = Number.parseInt(text.padEnd(6, '0').slice(0, 6), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function drawPositioned(page, span, pieces, size, color) {
  const stroke = rgbParts(span.stroke || span.color || '#000000');
  page.pushOperators(
    pushGraphicsState(),
    setCharacterSpacing(span.charSpacing || 0),
    setWordSpacing(span.wordSpacing || 0),
    setCharacterSqueeze(span.hScale || 100),
    setLineWidth(span.strokeWidth || 0.6),
    setStrokingRgbColor(...stroke),
    setTextRenderingMode(span.renderMode || 0),
  );
  for (const piece of pieces) {
    if (!piece.text) continue;
    page.drawText(piece.text, { x: piece.x, y: piece.y, size, font: piece.font, color });
  }
  page.pushOperators(popGraphicsState());
}

async function piecesFor(bundles, span, text, x, y) {
  const mapped = mapFont(span.font);
  const primaryFile = fontFile(mapped);
  const primary = await bundles.embed(primaryFile);
  const fallbackName = mapped.weight === 'bold' ? 'Noto Sans Bold' : 'Noto Sans';
  const fallback = await bundles.embed(fontFile(mapFont(fallbackName)));
  const runs = [];
  let current = '';
  let useFallback = null;
  function push() {
    if (!current) return;
    runs.push({ text: current, font: useFallback ? fallback : primary, fallback: useFallback });
    current = '';
  }
  for (const char of String(text)) {
    let fallbackChar = false;
    try { primary.encodeText(char); } catch { fallbackChar = true; }
    if (useFallback !== null && fallbackChar !== useFallback) push();
    useFallback = fallbackChar;
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

function drawPath(page, path) {
  const strokeColor = rgbParts(path.stroke || '#000000');
  const fillColor = rgbParts(path.fill || '#000000');
  const operators = [
    pushGraphicsState(),
    setLineWidth(path.strokeWidth || 0.6),
    setLineCap(path.lineCap || 0),
    setLineJoin(path.lineJoin || 0),
    setStrokingRgbColor(...strokeColor),
    setFillingRgbColor(...fillColor),
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
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const bundles = await embedBundles(doc);
  let pages = spec.pages?.length ? spec.pages : [spec];
  if (options.live) {
    const blank = (source) => !(source.spans || []).length && !(source.lines || []).length && !(source.rects || []).length && !(source.paths || []).length && !(source.images || []).length && !(source.table?.rows || []).length;
    while (pages.length > 1 && blank(pages.at(-1))) pages = pages.slice(0, -1);
  }
  const overflowLog = [];
  for (const source of pages) {
    const page = doc.addPage([source.width || spec.page.width, source.height || spec.page.height]);
    for (const rect of source.rects || []) {
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
    for (const line of source.lines || []) {
      page.pushOperators(setLineCap(line.lineCap || 0), setLineJoin(line.lineJoin || 0));
      if (line.dash?.length) page.pushOperators(setDashPattern(line.dash, line.dashPhase || 0));
      page.drawLine({
        start: { x: line.x1, y: line.y1 },
        end: { x: line.x2, y: line.y2 },
        thickness: line.width || 0.4,
        color: parseColor(line.color),
      });
      if (line.dash?.length) page.pushOperators(restoreDashPattern());
    }
    for (const path of source.paths || []) drawPath(page, path);
    for (const image of source.images || []) {
      if (image.proposedClass === 'barcode' || image.proposedClass === 'qr' || image.barcode?.decoded) drawBarcode(page, image);
    }
    const paintSpans = [
      ...(source.spans || []),
      ...(source.table?.rows || []).flat().filter(Boolean).map((cell) => ({ ...cell, role: cell.role || 'dynamic' })),
    ];
    for (const span of paintSpans) {
      if (span.role === 'branding') continue;
      const demo = span.text;
      const text = options.overflow && span.role === 'dynamic' ? replacement(span, spec) : demo;
      if (!text) continue;
      const mode = options.overflow ? overflowMode(span, spec) : 'none';
      const color = parseColor(span.color);
      const box = Math.max(span.width, 1);
      let size = span.size || 8;
      const probe = await piecesFor(bundles, span, text, span.x, span.y);
      const probeFont = probe[0]?.font;
      if (mode === 'shrink' && probeFont) {
        while (size > 4 && probeFont.widthOfTextAtSize(text, size) > box + 0.5) size -= 0.25;
      }
      const positioned = span.segments?.length && mode === 'none'
        ? (await Promise.all(span.segments.map(async (segment) => piecesFor(bundles, { ...span, size }, segment.text, segment.x, segment.y)))).flat()
        : await piecesFor(bundles, { ...span, size }, text, span.x, span.y);
      const draw = () => drawPositioned(page, span, positioned, size, color);
      if (mode === 'wrap' && probeFont) {
        const lines = wrapLines(text, probeFont, size, box).slice(0, spec.overflowRules.maxLines || 3);
        for (let index = 0; index < lines.length; index += 1) {
          const linePieces = await piecesFor(bundles, { ...span, size }, lines[index], span.x, span.y - index * size * 1.15);
          drawPositioned(page, span, linePieces, size, color);
        }
        overflowLog.push({ id: span.id, mode, size, lines: lines.length, box });
        continue;
      }
      if (mode === 'clip') {
        drawClipped(page, span, draw);
        overflowLog.push({ id: span.id, mode, size, lines: 1, box });
        continue;
      }
      draw();
      if (mode === 'shrink') overflowLog.push({ id: span.id, mode, size, lines: 1, box });
    }
  }
  const bytes = await doc.save();
  const outDir = path.join(root, 'reports/output');
  fs.mkdirSync(outDir, { recursive: true });
  const suffix = options.overflow ? '.overflow' : '';
  const outPath = path.join(outDir, `${code}${suffix}.pdf`);
  fs.writeFileSync(outPath, bytes);
  if (options.overflow) {
    fs.writeFileSync(path.join(outDir, `${code}.overflow.json`), `${JSON.stringify({ code, maxLines: spec.overflowRules.maxLines, spans: overflowLog }, null, 2)}\n`);
  }
  return outPath;
}

const code = process.argv[2];
if (code && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await renderSpec(code, { overflow: process.argv.includes('--overflow'), live: process.argv.includes('--live') }));
}

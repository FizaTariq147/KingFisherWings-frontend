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
  clip,
  closePath,
  endPath,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  restoreDashPattern,
  setCharacterSqueeze,
  setDashPattern,
} = require('pdf-lib/cjs/api/operators.js');
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

function drawScaled(page, span, text, font, size, color) {
  const natural = font.widthOfTextAtSize(text, size);
  const scale = span.width > 0 && natural > 0 ? (span.width / natural) * 100 : 100;
  page.pushOperators(pushGraphicsState(), setCharacterSqueeze(scale));
  page.drawText(text, { x: span.x, y: span.y, size, font, color });
  page.pushOperators(popGraphicsState());
  return { natural, scale, drawnWidth: natural * (scale / 100) };
}

export async function renderSpec(code, options = {}) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const bundles = await embedBundles(doc);
  const pages = spec.pages?.length ? spec.pages : [spec];
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
      if (line.dash?.length) page.pushOperators(setDashPattern(line.dash, line.dashPhase || 0));
      page.drawLine({
        start: { x: line.x1, y: line.y1 },
        end: { x: line.x2, y: line.y2 },
        thickness: line.width || 0.4,
        color: parseColor(line.color),
      });
      if (line.dash?.length) page.pushOperators(restoreDashPattern());
    }
    for (const span of source.spans || []) {
      const demo = span.text;
      const text = options.overflow && span.role === 'dynamic' ? replacement(span, spec) : demo;
      if (!text) continue;
      const chosen = await bundles.forSpan(span, text);
      const mode = options.overflow ? overflowMode(span, spec) : 'none';
      const color = parseColor(span.color);
      const box = Math.max(span.width, 1);
      let size = span.size || 8;
      let drawn = text;
      let lines = [text];
      if (mode === 'shrink') {
        while (size > 4 && chosen.font.widthOfTextAtSize(drawn, size) > box + 0.5) size -= 0.25;
        const metrics = drawScaled(page, { ...span, width: Math.min(box, chosen.font.widthOfTextAtSize(drawn, size)) }, drawn, chosen.font, size, color);
        overflowLog.push({ id: span.id, mode, size, lines: 1, natural: metrics.natural, box });
        continue;
      }
      if (mode === 'wrap') {
        lines = wrapLines(text, chosen.font, size, box).slice(0, spec.overflowRules.maxLines || 3);
        lines.forEach((line, index) => {
          const natural = chosen.font.widthOfTextAtSize(line, size);
          drawScaled(page, { ...span, y: span.y - index * size * 1.15, width: natural }, line, chosen.font, size, color);
        });
        overflowLog.push({ id: span.id, mode, size, lines: lines.length, box, clipped: wrapLines(text, chosen.font, size, box).length > lines.length });
        continue;
      }
      if (mode === 'clip') {
        drawClipped(page, span, () => drawScaled(page, span, drawn, chosen.font, size, color));
        overflowLog.push({ id: span.id, mode, size, lines: 1, box, clipped: chosen.font.widthOfTextAtSize(drawn, size) > box + 0.5 });
        continue;
      }
      drawScaled(page, span, drawn, chosen.font, size, color);
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
  console.log(await renderSpec(code, { overflow: process.argv.includes('--overflow') }));
}

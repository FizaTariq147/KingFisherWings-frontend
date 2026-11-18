import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';
import { readPageBoxes } from './page-box.mjs';

const dir = process.argv[2];
const SCALE = 150 / 72;

async function vectors(pdfPath) {
  const boxes = await readPageBoxes(pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const view = page.getViewport({ scale: 1 });
  const box = boxes[0];
  const [x0, y0, x1, y1] = box.mediaBox;
  const read = readOperators(await page.getOperatorList(), page, {
    width: view.width, height: view.height, minX: x0, minY: y0, maxX: x1, maxY: y1,
  });
  return { height: view.height, lines: read.lines || [], rects: read.rects || [], box };
}

function band(left, right, line, pageHeight) {
  const width = Math.min(left.width, right.width);
  const height = Math.min(left.height, right.height);
  const pad = ((line.width || 0.5) + 1.5) * SCALE;
  const x0 = Math.max(0, Math.floor(Math.min(line.x1, line.x2) * SCALE - pad));
  const x1 = Math.min(width, Math.ceil(Math.max(line.x1, line.x2) * SCALE + pad));
  const yTop = (pageHeight - Math.max(line.y1, line.y2)) * SCALE - pad;
  const yBot = (pageHeight - Math.min(line.y1, line.y2)) * SCALE + pad;
  const y0 = Math.max(0, Math.floor(Math.min(yTop, yBot)));
  const y1 = Math.min(height, Math.ceil(Math.max(yTop, yBot)));
  let count = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const a = (y * left.width + x) * 4;
      const b = (y * right.width + x) * 4;
      if (left.data[a] !== right.data[b] || left.data[a + 1] !== right.data[b + 1] || left.data[a + 2] !== right.data[b + 2]) count += 1;
    }
  }
  return count;
}

const reference = await vectors(path.join(dir, 'geometry-ref.pdf'));
const output = await vectors(path.join(dir, 'geometry-out.pdf'));
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
let pixels = 0;
const width = Math.min(left.width, right.width);
const height = Math.min(left.height, right.height);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const a = (y * left.width + x) * 4;
    const b = (y * right.width + x) * 4;
    if (left.data[a] !== right.data[b] || left.data[a + 1] !== right.data[b + 1] || left.data[a + 2] !== right.data[b + 2]) pixels += 1;
  }
}
const ranked = reference.lines.map((line) => {
  let best = null;
  let score = Infinity;
  for (const other of output.lines) {
    const next = Math.hypot(line.x1 - other.x1, line.y1 - other.y1) + Math.hypot(line.x2 - other.x2, line.y2 - other.y2);
    if (next < score) { score = next; best = other; }
  }
  return {
    mismatches: band(left, right, line, reference.height),
    width: line.width,
    source: line.source,
    reference: [line.x1, line.y1, line.x2, line.y2],
    output: best ? [best.x1, best.y1, best.x2, best.y2, best.width, best.source] : null,
    distance: Math.round(score * 10000) / 10000,
    color: [line.color, best?.color],
    cap: [line.lineCap, best?.lineCap],
  };
}).sort((a, b) => b.mismatches - a.mismatches);
console.log(JSON.stringify({
  pixels,
  ratio: pixels / (width * height),
  refLines: reference.lines.length,
  outLines: output.lines.length,
  refRects: reference.rects.length,
  outRects: output.rects.length,
  box: reference.box,
  top: ranked.slice(0, 8),
}, null, 2));

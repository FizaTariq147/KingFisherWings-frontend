import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';
import { readPageBoxes } from './page-box.mjs';

const dir = process.argv[2];
const SCALE = 150 / 72;
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
const width = Math.min(left.width, right.width);
const height = Math.min(left.height, right.height);
const runs = [];
let start = null;
let last = null;
for (let y = 0; y < height; y += 1) {
  let count = 0;
  for (let x = 0; x < width; x += 8) {
    const a = (y * left.width + x) * 4;
    const b = (y * right.width + x) * 4;
    if (left.data[a] !== right.data[b] || left.data[a + 1] !== right.data[b + 1] || left.data[a + 2] !== right.data[b + 2]) count += 1;
  }
  const hot = count > width / 8 / 3;
  if (hot && start == null) start = y;
  if (!hot && start != null) {
    runs.push([start, last]);
    start = null;
  }
  if (hot) last = y;
}
if (start != null) runs.push([start, last]);

async function read(pdfPath) {
  const boxes = await readPageBoxes(pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const view = page.getViewport({ scale: 1 });
  const box = boxes[0];
  const [x0, y0, x1, y1] = box.mediaBox;
  const ops = readOperators(await page.getOperatorList(), page, {
    width: view.width, height: view.height, minX: x0, minY: y0, maxX: x1, maxY: y1,
  });
  return { height: view.height, lines: ops.lines, rects: ops.rects, rotate: box.rotate };
}
const reference = await read(path.join(dir, 'geometry-ref.pdf'));
const pdfY = (row) => Math.round((reference.height - row / SCALE) * 100) / 100;
const bands = runs.slice(0, 12).map(([a, b]) => ({ rows: [a, b], pdf: [pdfY(b), pdfY(a)], thick: Math.round((b - a + 1) * 72 / 150 * 100) / 100 }));
function overlap(item, y0, y1) {
  const top = item.y != null ? item.y + (item.height || 0) : Math.max(item.y1, item.y2);
  const bottom = item.y != null ? item.y : Math.min(item.y1, item.y2);
  return top >= y0 - 1 && bottom <= y1 + 1;
}
const first = bands[0];
const y0 = first ? first.pdf[0] : 0;
const y1 = first ? first.pdf[1] : 0;
const refHit = [...reference.rects, ...reference.lines].filter((item) => overlap(item, y0, y1)).slice(0, 8).map((item) => ({
  x: item.x ?? item.x1,
  y: item.y ?? item.y1,
  w: item.width,
  h: item.height ?? null,
  x2: item.x2,
  y2: item.y2,
  fill: item.fill || null,
  color: item.color || null,
  source: item.source || 'rect',
}));
console.log(JSON.stringify({ runs: runs.length, bands, rotate: reference.rotate, pageHeight: reference.height, firstHits: refHit }, null, 2));

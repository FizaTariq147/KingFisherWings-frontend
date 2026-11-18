import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';
import { readPageBoxes } from './page-box.mjs';

const dir = process.argv[2];
const row = Number(process.argv[3] || 305);
const SCALE = 150 / 72;

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
  return { height: view.height, width: view.width, lines: ops.lines, rects: ops.rects };
}

const reference = await read(path.join(dir, 'geometry-ref.pdf'));
const output = await read(path.join(dir, 'geometry-out.pdf'));
const pdfY = reference.height - row / SCALE;
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
const samples = [];
for (const x of [100, 400, 800, 1200]) {
  const a = (row * left.width + x) * 4;
  const b = (row * right.width + x) * 4;
  samples.push({
    x,
    ref: [left.data[a], left.data[a + 1], left.data[a + 2]],
    out: [right.data[b], right.data[b + 1], right.data[b + 2]],
  });
}
function near(items) {
  return items.filter((item) => {
    const y0 = item.y ?? Math.min(item.y1, item.y2);
    const y1 = item.y != null ? item.y + (item.height || 0) : Math.max(item.y1, item.y2);
    return y0 - 2 <= pdfY && y1 + 2 >= pdfY;
  }).slice(0, 6);
}
console.log(JSON.stringify({
  page: [reference.width, reference.height],
  pdfY: Math.round(pdfY * 100) / 100,
  samples,
  refRects: near(reference.rects),
  outRects: near(output.rects),
  refLines: near(reference.lines).map((line) => ({ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, width: line.width, source: line.source, color: line.color })),
  outLines: near(output.lines).map((line) => ({ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, width: line.width, source: line.source, color: line.color })),
}, null, 2));

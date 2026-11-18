import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';

const root = path.resolve('reports/output/track-a3/layers');
const SCALE = 150 / 72;

async function vectors(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const pages = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const view = page.getViewport({ scale: 1 });
    const read = readOperators(await page.getOperatorList(), page, { width: view.width, height: view.height });
    pages.push({ width: view.width, height: view.height, lines: read.lines || [], rects: read.rects || [], paths: read.paths || [] });
  }
  return pages;
}

function mark(mask, width, height, x0, y0, x1, y1) {
  const left = Math.max(0, Math.floor(x0));
  const right = Math.min(width, Math.ceil(x1));
  const top = Math.max(0, Math.floor(y0));
  const bottom = Math.min(height, Math.ceil(y1));
  for (let y = top; y < bottom; y += 1) mask.fill(1, y * width + left, y * width + right);
}

const codes = fs.readdirSync(root).filter((name) => fs.existsSync(path.join(root, name, 'geometry-ref-1.png')));
for (const code of codes) {
  const dir = path.join(root, code);
  const pages = await vectors(path.join(dir, 'geometry-ref.pdf'));
  const outputPages = await vectors(path.join(dir, 'geometry-out.pdf'));
  let linePixels = 0;
  let rectPixels = 0;
  let otherPixels = 0;
  let total = 0;
  for (let index = 0; index < pages.length; index += 1) {
    const leftFile = path.join(dir, `geometry-ref-${index + 1}.png`);
    const rightFile = path.join(dir, `geometry-out-${index + 1}.png`);
    if (!fs.existsSync(leftFile) || !fs.existsSync(rightFile)) continue;
    const left = PNG.sync.read(fs.readFileSync(leftFile));
    const right = PNG.sync.read(fs.readFileSync(rightFile));
    const width = Math.min(left.width, right.width);
    const height = Math.min(left.height, right.height);
    const page = pages[index];
    const lineMask = new Uint8Array(width * height);
    const rectMask = new Uint8Array(width * height);
    for (const line of [...page.lines, ...(outputPages[index]?.lines || [])]) {
      const midY = (line.y1 + line.y2) / 2;
      const half = Math.max(line.width || 0.4, 0.4) / 2 + 3;
      const x0 = Math.min(line.x1, line.x2) * SCALE - 1;
      const x1 = Math.max(line.x1, line.x2) * SCALE + 1;
      const yTop = (page.height - (midY + half)) * SCALE;
      const yBot = (page.height - (midY - half)) * SCALE;
      mark(lineMask, width, height, x0, Math.min(yTop, yBot), x1, Math.max(yTop, yBot));
    }
    for (const rect of [...page.rects, ...(outputPages[index]?.rects || [])]) {
      const x0 = rect.x * SCALE - 1;
      const x1 = (rect.x + rect.width) * SCALE + 1;
      const yTop = (page.height - (rect.y + rect.height)) * SCALE - 1;
      const yBot = (page.height - rect.y) * SCALE + 1;
      mark(rectMask, width, height, x0, yTop, x1, yBot);
    }
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * left.width + x) * 4;
        const other = (y * right.width + x) * 4;
        if (left.data[offset] === right.data[other] && left.data[offset + 1] === right.data[other + 1] && left.data[offset + 2] === right.data[other + 2]) continue;
        total += 1;
        const slot = y * width + x;
        if (lineMask[slot]) linePixels += 1;
        else if (rectMask[slot]) rectPixels += 1;
        else otherPixels += 1;
      }
    }
  }
  console.log(JSON.stringify({ code, total, linePixels, rectPixels, otherPixels, paths: pages.reduce((sum, page) => sum + page.paths.length, 0), rects: pages.reduce((sum, page) => sum + page.rects.length, 0) }));
}

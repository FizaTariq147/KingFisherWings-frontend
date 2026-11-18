import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const dir = process.argv[2];
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
const width = Math.min(left.width, right.width);
const height = Math.min(left.height, right.height);
let count = 0;
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
const rows = new Map();
for (let y = 0; y < height; y += 1) {
  let row = 0;
  for (let x = 0; x < width; x += 1) {
    const a = (y * left.width + x) * 4;
    const b = (y * right.width + x) * 4;
    if (left.data[a] === right.data[b] && left.data[a + 1] === right.data[b + 1] && left.data[a + 2] === right.data[b + 2]) continue;
    count += 1;
    row += 1;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (row > 40) rows.set(y, row);
}
const hot = [...rows.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
let text = '';
try {
  text = execFileSync('pdftotext', ['-q', path.join(dir, 'geometry-ref.pdf'), '-'], { encoding: 'utf8' }).slice(0, 80);
} catch (error) {
  text = String(error.stdout || error.message).slice(0, 80);
}
console.log(JSON.stringify({
  count,
  ratio: count / (width * height),
  bbox: [minX, minY, maxX, maxY],
  size: [width, height],
  hotRows: hot,
  refText: JSON.stringify(text),
}, null, 2));

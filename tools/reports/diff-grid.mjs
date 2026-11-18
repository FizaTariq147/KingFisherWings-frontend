import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const dir = process.argv[2];
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
const grid = [];
for (let y = 40; y < left.height; y += Math.floor(left.height / 8)) {
  const row = [];
  for (let x = 40; x < left.width; x += Math.floor(left.width / 6)) {
    const a = (y * left.width + x) * 4;
    const b = (y * right.width + x) * 4;
    row.push(`${left.data[a]},${left.data[a + 1]},${left.data[a + 2]}/${right.data[b]},${right.data[b + 1]},${right.data[b + 2]}`);
  }
  grid.push({ y, row });
}
console.log(JSON.stringify(grid, null, 2));

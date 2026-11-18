import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const file = process.argv[2];
const target = process.argv[3].split(',').map(Number);
const image = PNG.sync.read(fs.readFileSync(file));
let count = 0;
let minX = image.width;
let minY = image.height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < image.height; y += 1) {
  for (let x = 0; x < image.width; x += 1) {
    const offset = (y * image.width + x) * 4;
    if (Math.abs(image.data[offset] - target[0]) > 8 || Math.abs(image.data[offset + 1] - target[1]) > 8 || Math.abs(image.data[offset + 2] - target[2]) > 8) continue;
    count += 1;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}
console.log(JSON.stringify({ file: path.basename(file), count, bbox: count ? [minX, minY, maxX, maxY] : null, size: [image.width, image.height] }));

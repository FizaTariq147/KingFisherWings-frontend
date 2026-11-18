import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const dir = process.argv[2];
const y0 = Number(process.argv[3]);
const y1 = Number(process.argv[4]);
const left = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-ref-1.png')));
const right = PNG.sync.read(fs.readFileSync(path.join(dir, 'geometry-out-1.png')));
const mid = Math.round((y0 + y1) / 2);
const samples = [];
for (const x of [80, 200, 400, 700, 1000]) {
  const a = (mid * left.width + x) * 4;
  const b = (mid * right.width + x) * 4;
  samples.push({ x, ref: [...left.data.subarray(a, a + 3)], out: [...right.data.subarray(b, b + 3)] });
}
console.log(JSON.stringify({ mid, samples }));

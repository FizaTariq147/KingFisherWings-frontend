import fs from 'node:fs';
import { PNG } from 'pngjs';

const image = PNG.sync.read(fs.readFileSync(process.argv[2]));
const rows = process.argv.slice(3).map(Number);
for (const y of rows) {
  const samples = [80, 400, 1000].map((x) => {
    const offset = (y * image.width + x) * 4;
    return [...image.data.subarray(offset, offset + 3)].join(',');
  });
  console.log(y, samples.join(' | '));
}

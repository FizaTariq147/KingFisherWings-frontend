import fs from 'node:fs';

const rows = fs.readFileSync('reports/full-run-track-a-before-a4.csv', 'utf8').trim().split(/\r?\n/).slice(1);
const r1 = [];
for (const line of rows) {
  const code = line.split(',')[0];
  const failure = line.split(',').slice(8).join(',');
  if (failure.includes('raster R1')) r1.push(code);
}
const rotated = new Set(JSON.parse(fs.readFileSync('reports/output/track-a4/page-boxes-before.json', 'utf8')).rotated.map((item) => item.code));
const plain = [...new Set(r1)].filter((code) => !rotated.has(code));
const rotatedR1 = [...new Set(r1)].filter((code) => rotated.has(code));
console.log(JSON.stringify({
  r1Rows: r1.length,
  uniqueR1: new Set(r1).size,
  rotatedR1,
  plain,
}, null, 2));

import fs from 'node:fs';
import path from 'node:path';
import { readPageBoxes, pageBoxMismatch } from './page-box.mjs';

function fileOf(code) {
  const mapped = fs.readFileSync('reports/references/code-map.csv', 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  const file = line?.match(/reports\/references\/files\/[^,]+/)?.[0];
  if (file) return file;
  const census = fs.readFileSync('reports/capability-census.csv', 'utf8');
  const censusFile = census.split(/\r?\n/).find((row) => row.startsWith(`${code},`))?.split(',')[1];
  return censusFile?.endsWith('.pdf') ? censusFile : '';
}

const codes = [...new Set(fs.readFileSync('reports/full-run-track-a-last.csv', 'utf8').trim().split(/\r?\n/).slice(1).map((line) => line.split(',')[0]).filter(Boolean))];
const mismatches = [];
const rotated = [];
let compared = 0;
for (const code of codes) {
  const reference = fileOf(code);
  const rendered = path.join('reports/output', `${code}.pdf`);
  if (!reference || !fs.existsSync(rendered)) {
    mismatches.push({ code, error: 'missing pdf' });
    continue;
  }
  const left = await readPageBoxes(reference);
  const right = await readPageBoxes(rendered);
  if (left.some((box) => box.rotate)) rotated.push({ code, rotate: left.map((box) => box.rotate), mediaBox: left[0].mediaBox });
  const pages = Math.max(left.length, right.length);
  const pageMismatches = [];
  for (let index = 0; index < pages; index += 1) {
    const fields = pageBoxMismatch(left[index], right[index]);
    if (fields.length || !left[index] || !right[index]) pageMismatches.push({ page: index + 1, fields, reference: left[index] || null, rendered: right[index] || null });
  }
  if (pageMismatches.length) mismatches.push({ code, pages: pageMismatches });
  compared += 1;
  if (compared % 50 === 0) console.log(JSON.stringify({ compared, mismatches: mismatches.length, rotated: rotated.length }));
}
fs.mkdirSync('reports/output/track-a4', { recursive: true });
fs.writeFileSync('reports/output/track-a4/page-boxes-before.json', `${JSON.stringify({ compared, mismatchDocuments: mismatches.length, mismatches, rotated }, null, 2)}\n`);
console.log(JSON.stringify({ compared, mismatchDocuments: mismatches.length, rotated: rotated.length }));

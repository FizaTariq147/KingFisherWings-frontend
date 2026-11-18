import fs from 'node:fs';
import path from 'node:path';

const data = JSON.parse(fs.readFileSync('reports/output/track-a2/r1-histogram.json', 'utf8'));
const worstDir = 'reports/output/track-a2/r1/worst';
fs.mkdirSync(worstDir, { recursive: true });
for (const code of data.worst10) {
  const source = path.join('reports/output/track-a2/r1', `${code}-far.png`);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(worstDir, `${code}.png`));
}
const lines = [
  '# R1 non-text distance',
  '',
  'Raster pixels at 150 dpi. Masks and limits are unchanged.',
  'over 8 is farther than 8 px from both the nearest text span box and the nearest allowed image box.',
  'clip is 0 because the spec does not record clip paths.',
  '',
  '| Document | 0-1 | 2-3 | 4-8 | over 8 | fills | strokes | images | other |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
];
for (const row of data.documents) {
  const either = row.toEither;
  lines.push(`| ${row.code} | ${either['0-1']} | ${either['2-3']} | ${either['4-8']} | ${either['over 8']} | ${row.far.fills} | ${row.far.strokes} | ${row.far.images} | ${row.far.other} |`);
}
fs.writeFileSync('reports/output/track-a2/r1-histogram.md', `${lines.join('\n')}\n`);
console.log(JSON.stringify({ rows: data.documents.length, worstCopied: data.worst10.length }));

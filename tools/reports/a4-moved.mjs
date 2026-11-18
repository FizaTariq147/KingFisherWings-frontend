import fs from 'node:fs';

function rows(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).map((line) => {
    const parts = [];
    let cur = '';
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') { quoted = !quoted; continue; }
      if (ch === ',' && !quoted) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  });
}
const before = new Map(rows('reports/full-run-track-a-before-a4.csv').map((parts) => [parts[0], parts[8] || '']));
const after = new Map(rows('reports/full-run-track-a-last.csv').map((parts) => [parts[0], parts[8] || '']));
const plain = JSON.parse(fs.readFileSync('reports/output/track-a4/plain-r1-codes.json', 'utf8'));
const cleared = [];
const gained = [];
for (const [code, was] of before) {
  const now = after.get(code) || '';
  const hadR1 = was.includes('raster R1');
  const hasR1 = now.includes('raster R1');
  if (hadR1 && !hasR1) cleared.push({ code, before: was || 'clean', after: now || 'clean' });
  if (!hadR1 && hasR1) gained.push(code);
}
const plainAfter = plain.map((code) => ({ code, before: before.get(code) || '', after: after.get(code) || 'clean' }));
console.log(JSON.stringify({ cleared, gainedR1: gained, plainAfter }, null, 2));

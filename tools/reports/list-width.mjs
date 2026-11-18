import fs from 'node:fs';

function parse(line) {
  const parts = [];
  let cur = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

const rows = fs.readFileSync('reports/full-run-track-a-subset.csv', 'utf8').trim().split(/\r?\n/).slice(1).map(parse);
const codes = [...new Set(rows.filter((parts) => (parts[8] || '').includes('width') || (parts[8] || '').includes('position')).map((parts) => parts[0]))];
fs.writeFileSync('reports/cache/width-codes.json', `${JSON.stringify({ codes }, null, 2)}\n`);
console.log(JSON.stringify({ count: codes.length, codes }));

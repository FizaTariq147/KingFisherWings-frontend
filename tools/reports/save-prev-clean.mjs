import fs from 'node:fs';

function parse(line) {
  const parts = [];
  let cur = '';
  let q = false;
  for (const ch of line) {
    if (ch === '"') {
      q = !q;
      continue;
    }
    if (ch === ',' && !q) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

const rows = fs.readFileSync('reports/full-run-track-a.csv', 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map(parse);
const clean = rows.filter((parts) => !(parts[8] || '').trim() && !String(parts.join(',')).includes('out of scope')).map((parts) => parts[0]);
fs.mkdirSync('reports/output/track-a', { recursive: true });
fs.writeFileSync('reports/output/track-a/prev-clean.json', `${JSON.stringify(clean, null, 2)}\n`);
console.log(JSON.stringify({ clean: clean.length }));

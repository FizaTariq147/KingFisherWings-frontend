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

const rows = fs.readFileSync('reports/full-run-track-a.csv', 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean)
  .map(parse)
  .filter((parts) => !String(parts.join(',')).includes('out of scope'));

const r1 = rows.filter((parts) => (parts[8] || '').includes('raster R1')).map((parts) => ({
  code: parts[0],
  nonText: Number(parts[10]),
  textInk: Number(parts[11]),
  masked: Number(parts[12]),
  cls: parts[8],
}));
const r2 = rows.filter((parts) => (parts[8] || '').includes('raster R2')).map((parts) => ({
  code: parts[0],
  nonText: Number(parts[10]),
  textInk: Number(parts[11]),
  masked: Number(parts[12]),
}));
const staticFail = rows.filter((parts) => (parts[8] || '').includes('static')).map((parts) => ({
  code: parts[0],
  cls: parts[8],
}));
const dynFail = rows.filter((parts) => (parts[8] || '').includes('dynamic')).map((parts) => ({
  code: parts[0],
  cls: parts[8],
}));

fs.mkdirSync('reports/output/track-a', { recursive: true });
const payload = {
  r1Count: r1.length,
  r2Count: r2.length,
  staticCount: staticFail.length,
  dynCount: dynFail.length,
  r1Top: [...r1].sort((a, b) => b.nonText - a.nonText).slice(0, 20),
  r2,
  staticFail,
  dynFail,
};
fs.writeFileSync('reports/output/track-a/first-run-failures.json', `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify(payload, null, 2));

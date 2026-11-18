import fs from 'node:fs';

const file = process.argv[2] || 'reports/full-run.csv';
const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);

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

const counts = {};
let clean = 0;
let docs = 0;
let r1 = 0;
let r2 = 0;
for (const line of lines) {
  if (line.includes('out of scope')) continue;
  docs += 1;
  const parts = parse(line);
  const headerHasMaskedFirst = fs.readFileSync(file, 'utf8').startsWith('code,pages,page,geometry,static,dynamic,raster,pagination,masked_fraction');
  const cls = headerHasMaskedFirst ? (parts[9] || '') : (parts[8] || '');
  const nonText = Number(headerHasMaskedFirst ? NaN : parts[10]);
  const textInk = Number(headerHasMaskedFirst ? NaN : parts[11]);
  const masked = Number(headerHasMaskedFirst ? parts[8] : parts[12]);
  if (!cls) clean += 1;
  else {
    for (const name of cls.split(' | ').filter(Boolean)) counts[name] = (counts[name] || 0) + 1;
  }
  if (parts[6] === 'fail') {
    if (cls.includes('R1') || (Number.isFinite(nonText) && nonText > 0.005)) r1 += 1;
    else r2 += 1;
  }
}

console.log(JSON.stringify({ file, docs, clean, r1, r2, counts }, null, 2));

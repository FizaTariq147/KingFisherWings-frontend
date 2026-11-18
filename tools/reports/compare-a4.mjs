import fs from 'node:fs';

function parse(line) {
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
}

function rows(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map(parse);
}

function tally(list) {
  const counts = {};
  let clean = 0;
  let r1 = 0;
  let r2 = 0;
  for (const parts of list) {
    const cls = parts[8] || '';
    if (!cls.trim()) clean += 1;
    else for (const name of cls.split(' | ').filter(Boolean)) counts[name] = (counts[name] || 0) + 1;
    if (parts[6] === 'fail') {
      if (cls.includes('R1')) r1 += 1;
      else r2 += 1;
    }
  }
  return { docs: list.length, clean, r1, r2, counts };
}

const before = rows('reports/full-run-track-a-before-a4.csv');
const after = rows('reports/full-run-track-a-last.csv');
const beforeBy = new Map(before.map((parts) => [parts[0], parts]));
const rotated = new Set(JSON.parse(fs.readFileSync('reports/output/track-a4/page-boxes-before.json', 'utf8')).rotated.map((item) => item.code));
const lostClean = [];
const rotatedRows = [];
const blind = [];
for (const parts of after) {
  const code = parts[0];
  const previous = beforeBy.get(code);
  const wasClean = previous && !(previous[8] || '').trim();
  const now = parts[8] || '';
  if (wasClean && now.trim()) lostClean.push({ code, classes: now, page: parts[2], geometry: parts[3], static: parts[4], dynamic: parts[5], raster: parts[6] });
  if (parts[3] === 'pass' && now.includes('geometry-only raster')) {
    blind.push({ code, classes: now, raster: parts[6], wasClean });
  }
  if (rotated.has(code)) {
    rotatedRows.push({
      code,
      before: previous ? (previous[8] || 'clean') : 'missing',
      after: now || 'clean',
      page: parts[2],
      geometry: parts[3],
      raster: parts[6],
    });
  }
}
const errors = after.filter((parts) => (parts[8] || '').includes('error') || (parts[6] || '').includes('error'));
console.log(JSON.stringify({
  before: tally(before),
  after: tally(after),
  lostClean,
  blind: blind.length,
  blindCodes: blind,
  rotated: rotatedRows,
  errors: errors.map((parts) => parts[0]),
}, null, 2));

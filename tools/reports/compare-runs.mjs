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

function load(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map(parse)
    .filter((parts) => parts[0] && !String(parts.join(',')).includes('out of scope'));
}

function summarize(rows) {
  const counts = {};
  let clean = 0;
  let r1 = 0;
  let r2 = 0;
  for (const parts of rows) {
    const cls = parts[8] || '';
    if (!cls.trim()) clean += 1;
    else cls.split(' | ').filter(Boolean).forEach((name) => { counts[name] = (counts[name] || 0) + 1; });
    if (parts[6] === 'fail') {
      if (cls.includes('R1') || Number(parts[10]) > 0.005) r1 += 1;
      else r2 += 1;
    }
  }
  return { docs: rows.length, clean, r1, r2, counts };
}

const leftFile = process.argv[2];
const rightFile = process.argv[3];
const only = process.argv[4] ? new Set(JSON.parse(fs.readFileSync(process.argv[4], 'utf8')).codes) : null;
const left = load(leftFile).filter((parts) => !only || only.has(parts[0]));
const right = load(rightFile);
const rightBy = new Map(right.map((parts) => [parts[0], parts]));
const gained = [];
const lost = [];
for (const parts of left) {
  const next = rightBy.get(parts[0]);
  if (!next) continue;
  const wasClean = !(parts[8] || '').trim();
  const nowClean = !(next[8] || '').trim();
  if (!wasClean && nowClean) gained.push(parts[0]);
  if (wasClean && !nowClean) lost.push({ code: parts[0], classes: next[8] });
}
console.log(JSON.stringify({
  left: summarize(left),
  right: summarize(right),
  gained: gained.length,
  gainedCodes: gained,
  lost: lost.length,
  lostCodes: lost,
}, null, 2));

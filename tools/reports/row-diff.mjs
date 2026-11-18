import fs from 'node:fs';

function codes(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).map((line) => line.split(',')[0]);
}
const before = codes('reports/full-run-track-a-before-a4.csv');
const after = codes('reports/full-run-track-a-last.csv');
const count = (list) => {
  const map = new Map();
  for (const code of list) map.set(code, (map.get(code) || 0) + 1);
  return map;
};
const beforeCount = count(before);
const afterCount = count(after);
const extra = [];
for (const [code, n] of afterCount) {
  const was = beforeCount.get(code) || 0;
  if (n !== was) extra.push({ code, before: was, after: n });
}
const missing = [...beforeCount.keys()].filter((code) => !afterCount.has(code));
console.log(JSON.stringify({
  beforeRows: before.length,
  afterRows: after.length,
  beforeUnique: beforeCount.size,
  afterUnique: afterCount.size,
  headers: fs.readFileSync('reports/full-run-track-a-last.csv', 'utf8').split(/\r?\n/).filter((line) => line.startsWith('code,')).length,
  extra,
  missing,
}, null, 2));

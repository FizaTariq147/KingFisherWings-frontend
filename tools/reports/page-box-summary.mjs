import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('reports/output/track-a4/page-boxes-before.json', 'utf8'));
const fieldCounts = {};
const examples = {};
for (const item of data.mismatches) {
  if (item.error) {
    fieldCounts.error = (fieldCounts.error || 0) + 1;
    continue;
  }
  const fields = new Set(item.pages.flatMap((page) => page.fields));
  const key = [...fields].sort().join('+') || 'page-count';
  fieldCounts[key] = (fieldCounts[key] || 0) + 1;
  if (!examples[key]) examples[key] = item.code;
}
const rotateValues = {};
for (const item of data.rotated) {
  const key = JSON.stringify(item.rotate);
  rotateValues[key] = (rotateValues[key] || 0) + 1;
}
console.log(JSON.stringify({
  compared: data.compared,
  mismatchDocuments: data.mismatchDocuments,
  rotated: data.rotated.length,
  fieldCounts,
  examples,
  rotateValues,
  rotatedCodes: data.rotated.map((item) => item.code),
}, null, 2));

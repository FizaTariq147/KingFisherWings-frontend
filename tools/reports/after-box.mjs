import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('reports/output/track-a4/page-boxes-before.json', 'utf8'));
console.log(JSON.stringify({
  compared: data.compared,
  mismatchDocuments: data.mismatchDocuments,
  rotated: data.rotated.length,
  mismatches: data.mismatches,
}, null, 2));

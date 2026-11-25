const fs = require('fs');
const m = fs.readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts','utf8');
const code = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
const key = '"code":"' + code + '"';
const mj = m.indexOf(key);
let depth = 0, start = mj - 1;
while (start > 0 && m[start] !== '{') start--;
let end = start;
for (let i = start; i < m.length; i++) {
  if (m[i] === '{') depth++;
  if (m[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const face = JSON.parse(m.slice(start, end));
console.log(JSON.stringify(face.fieldSlots, null, 2));

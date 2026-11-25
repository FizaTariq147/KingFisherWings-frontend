const fs = require('fs');
const b = fs.readFileSync('src/features/reports/templates/official/brandingSlots.generated.ts','utf8');
const code = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
const key = '"code":"' + code + '"';
const j = b.indexOf(key);
let depth = 0, start = j - 1;
while (start > 0 && b[start] !== '{') start--;
let end = start;
for (let i = start; i < b.length; i++) {
  if (b[i] === '{') depth++;
  if (b[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const obj = JSON.parse(b.slice(start, end));
console.log('headerBand', obj.headerBand);
console.log('companyWipes count', (obj.companyWipes||[]).length);
console.log('addressLines count', (obj.addressLines||[]).length);

const fs = require('fs');
const b = fs.readFileSync('src/features/reports/templates/official/brandingSlots.generated.ts','utf8');
const code = 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA';
const j = b.indexOf('"code":"' + code + '"');
let depth = 0, start = j - 1;
while (start > 0 && b[start] !== '{') start--;
let end = start;
for (let i = start; i < b.length; i++) {
  if (b[i] === '{') depth++;
  if (b[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const obj = JSON.parse(b.slice(start, end));
console.log(JSON.stringify({ logo: obj.logo, company: obj.company, headerBand: obj.headerBand, footer: obj.footer }, null, 2));

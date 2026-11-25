const fs = require('fs');
const code = 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA';
const m = fs.readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts','utf8');
const j = m.indexOf('"code":"' + code + '"');
let depth = 0, start = j - 1;
while (start > 0 && m[start] !== '{') start--;
let end = start;
for (let i = start; i < m.length; i++) {
  if (m[i] === '{') depth++;
  if (m[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const face = JSON.parse(m.slice(start, end));
const texts = face.pages[0].texts || [];
const interesting = texts.filter(t =>
  /company|fresa|printed|created|powered|page|your company|igm|ram@|demo/i.test(t[0]||'')
).map(t => ({s:t[0], x:t[1], y:t[2], sz:t[3]}));
console.log(JSON.stringify(interesting, null, 2));
console.log('total texts', texts.length);
// footer band high X
const footer = texts.filter(t => t[1] > 540).map(t => ({s:t[0], x:t[1], y:t[2], sz:t[3]}));
console.log('footer texts', JSON.stringify(footer, null, 2));

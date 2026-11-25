const fs = require('fs');
const code = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
const m = fs.readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts','utf8');
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
const page0 = face.pages[0];
const lines = page0.lines || [];
const rects = page0.rects || [];
const texts = page0.texts || [];
console.log('rects', JSON.stringify(rects, null, 2));
// Classify lines
const horiz = lines.filter(l => Math.abs(l[1]-l[3]) < 0.5).map(l => ({x1:l[0],y:l[1],x2:l[2],len:Math.abs(l[2]-l[0])}));
const vert = lines.filter(l => Math.abs(l[0]-l[2]) < 0.5).map(l => ({x:l[0],y1:l[1],y2:l[3],len:Math.abs(l[3]-l[1])}));
const topH = horiz.filter(h => h.y > 700).sort((a,b)=>b.y-a.y);
const longH = horiz.filter(h => h.len > 400).sort((a,b)=>b.y-a.y);
const longV = vert.filter(v => v.len > 400).sort((a,b)=>a.x-b.x);
console.log('long horiz', JSON.stringify(longH.slice(0,20), null, 2));
console.log('long vert', JSON.stringify(longV.slice(0,10), null, 2));
console.log('top horiz', JSON.stringify(topH.slice(0,15), null, 2));
const topTexts = texts.filter(t => t[2] > 700).map(t => ({str:t[0],x:t[1],y:t[2],size:t[3]})).sort((a,b)=>b.y-a.y);
console.log('top texts', JSON.stringify(topTexts.slice(0,30), null, 2));

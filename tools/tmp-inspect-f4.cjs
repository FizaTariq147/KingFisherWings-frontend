const fs = require('fs');
const code = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
const b = fs.readFileSync('src/features/reports/templates/official/brandingSlots.generated.ts','utf8');
const key = '"code":"' + code + '"';
const j = b.indexOf(key);
console.log('brand idx', j);
if (j >= 0) {
  let depth = 0, start = j - 1;
  while (start > 0 && b[start] !== '{') start--;
  let end = start;
  for (let i = start; i < b.length; i++) {
    if (b[i] === '{') depth++;
    if (b[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const obj = JSON.parse(b.slice(start, end));
  console.log(JSON.stringify({ logo: obj.logo, company: obj.company, addressLines: obj.addressLines?.slice(0,4), companyWipes: obj.companyWipes?.slice(0,3), footer: obj.footer }, null, 2));
}
const m = fs.readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts','utf8');
const mj = m.indexOf(key);
console.log('face idx', mj);
if (mj >= 0) {
  let depth = 0, start = mj - 1;
  while (start > 0 && m[start] !== '{') start--;
  let end = start;
  for (let i = start; i < m.length; i++) {
    if (m[i] === '{') depth++;
    if (m[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const face = JSON.parse(m.slice(start, end));
  const page0 = face.pages?.[0] || {};
  const rects = page0.rects || [];
  // Find large outer-ish rects (near page edges)
  const big = rects
    .map((r, i) => ({ i, x: r[0], y: r[1], w: r[2], h: r[3], rgba: r.slice(4) }))
    .filter(r => r.w > 400 || r.h > 500)
    .sort((a,b) => (b.w*b.h) - (a.w*a.h))
    .slice(0, 15);
  console.log(JSON.stringify({
    widthPt: face.widthPt, heightPt: face.heightPt, rotateDeg: face.rotateDeg,
    branding: face.branding, pageCount: face.pageCount,
    rectCount: rects.length, lineCount: (page0.lines||[]).length,
    bigRects: big,
    topRects: rects.filter(r => r[1] > 700).slice(0, 20).map((r,i)=>({i,x:r[0],y:r[1],w:r[2],h:r[3],fill:r.slice(4,7)}))
  }, null, 2));
}

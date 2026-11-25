const fs = require('fs');
function extract(path, code) {
  const b = fs.readFileSync(path, 'utf8');
  const j = b.indexOf('"code":"' + code + '"');
  if (j < 0) return null;
  let depth = 0, start = j - 1;
  while (start > 0 && b[start] !== '{') start--;
  let end = start;
  for (let i = start; i < b.length; i++) {
    if (b[i] === '{') depth++;
    if (b[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return JSON.parse(b.slice(start, end));
}
const face = extract('src/features/reports/templates/official/measuredFaces.generated.ts', 'FG_HBL_FORMAT_1');
const slots = extract('src/features/reports/templates/official/brandingSlots.generated.ts', 'FG_HBL_FORMAT_1');
const spec = JSON.parse(fs.readFileSync('reports/specs/FG_HBL_FORMAT_1.json','utf8'));
console.log(JSON.stringify({
  face: face && { w: face.widthPt, h: face.heightPt, rotate: face.rotateDeg, texts: face.pages?.[0]?.texts?.slice(0,8).map(t=>t[0]) },
  slots: slots && { logo: slots.logo, company: slots.company, addressLines: slots.addressLines?.slice(0,3) },
  images: (spec.images||[]).slice(0,6).map(i=>({c:i.proposedClass,x:i.x,y:i.y,w:i.width,h:i.height})),
  titleSpans: (spec.spans||[]).filter(s=>/BILL OF LADING|AIR WAYBILL|HOUSE|SHIPPER/i.test(s.text||'')).slice(0,15).map(s=>({t:s.text,x:s.x,y:s.y})),
}, null, 2));

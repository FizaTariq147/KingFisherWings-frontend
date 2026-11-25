const fs = require('fs');
const m = fs.readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts','utf8');
const hbl = [...m.matchAll(/"code":"(HBL_[^"]+|FG_HBL_[^"]+)"/g)].map(x => x[1]);
const hawb = [...m.matchAll(/"code":"(HAWB_[^"]+)"/g)].map(x => x[1]);
console.log('measured HBL', hbl.length, hbl);
console.log('measured HAWB', hawb.length, hawb);
function slots(code) {
  const b = fs.readFileSync('src/features/reports/templates/official/brandingSlots.generated.ts','utf8');
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
for (const c of ['FG_HBL_HKG','HAWB_DRAFT_REPORT_FORMAT','HAWB_DRAFT_REPORT_FORMAT_1','HAWB_DRAFT_REPORT_FORMAT_2']) {
  const s = slots(c);
  console.log(c, s ? JSON.stringify({logo:s.logo, company:s.company, headerBand:s.headerBand}) : 'NO SLOTS');
}

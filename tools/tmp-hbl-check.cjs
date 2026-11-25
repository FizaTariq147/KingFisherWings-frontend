const fs = require('fs');
const b = fs.readFileSync('src/features/reports/templates/official/brandingSlots.generated.ts','utf8');
function slots(code) {
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
const hkg = slots('FG_HBL_HKG');
console.log(JSON.stringify({ logo: hkg.logo, company: hkg.company, addressLines: hkg.addressLines?.slice(0,3), wipeCount: hkg.companyWipes?.length }, null, 2));
const all = [...b.matchAll(/"code":"(HBL_[^"]+|FG_HBL_[^"]+)"/g)].map(m => m[1]);
let withLogo = 0, leftLogo = 0, noLogo = 0;
for (const c of all) {
  const s = slots(c);
  if (!s?.logo) { noLogo++; continue; }
  withLogo++;
  if (s.logo.x < 280) leftLogo++;
}
console.log({ hblCodes: all.length, withLogo, leftLogo, noLogo });

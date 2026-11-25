const fs = require('fs');
const code = 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA';
function extract(path, key) {
  const b = fs.readFileSync(path, 'utf8');
  const j = b.indexOf('"code":"' + key + '"');
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
const face = extract('src/features/reports/templates/official/measuredFaces.generated.ts', code);
const slots = extract('src/features/reports/templates/official/brandingSlots.generated.ts', code);
console.log(JSON.stringify({
  rotateDeg: face?.rotateDeg,
  widthPt: face?.widthPt,
  heightPt: face?.heightPt,
  branding: face?.branding,
  fieldSlots: face?.fieldSlots,
  logo: slots?.logo,
  company: slots?.company,
  addressLines: slots?.addressLines?.slice(0,6),
  companyWipes: slots?.companyWipes?.slice(0,8),
  headerBand: slots?.headerBand,
  footer: slots?.footer,
  page0textsTop: (face?.pages?.[0]?.texts||[]).filter(t => t[1] > 500 || t[2] > 500).slice(0, 25).map(t => ({s:t[0],x:t[1],y:t[2],sz:t[3]})),
}, null, 2));

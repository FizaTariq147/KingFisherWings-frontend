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
const s = extract('src/features/reports/templates/official/brandingSlots.generated.ts', 'FG_HBL_FORMAT_1');
const hkg = extract('src/features/reports/templates/official/brandingSlots.generated.ts', 'FG_HBL_HKG');
console.log('FORMAT_1', JSON.stringify({ logo: s.logo, company: s.company, addressLines: s.addressLines?.slice(0,3) }, null, 2));
console.log('HKG', JSON.stringify({ logo: hkg.logo, company: hkg.company }, null, 2));

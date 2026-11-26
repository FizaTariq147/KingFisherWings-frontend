import { readFileSync } from 'fs';

const src = readFileSync('src/features/reports/templates/official/measuredFaces.generated.ts', 'utf8');
const re = /\{"code":"HAWB_DRAFT_REPORT_FORMAT"/g;
let m;
let found = -1;
while ((m = re.exec(src))) {
  const after = src.slice(m.index, m.index + 60);
  if (!after.includes('FORMAT_1') && !after.includes('FORMAT_2')) {
    found = m.index;
    break;
  }
}
let start = found;
while (start > 0 && src[start] !== '{') start--;
let depth = 0;
let end = start;
for (let i = start; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const obj = JSON.parse(src.slice(start, end));
const texts = obj.pages[0].texts.filter((t) => t[2] > 800 || /176|EMIRATES|FREIGHT|Issued/i.test(t[0]));
for (const t of texts) console.log(JSON.stringify(t));
console.log('CHGS sizes', obj.pages[0].texts.filter((t) => /CHGS|WT|PPD|Routing/i.test(t[0])).map((t) => t));

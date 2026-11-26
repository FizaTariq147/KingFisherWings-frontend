import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function dump(path, label) {
  const bytes = readFileSync(path);
  const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  const items = content.items
    .filter((i) => 'str' in i && i.str.trim())
    .map((i) => {
      const t = i.transform;
      return {
        y: +t[5].toFixed(1),
        x: +t[4].toFixed(1),
        sz: +Math.hypot(t[0], t[1]).toFixed(1),
        s: i.str,
      };
    });
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  console.log('\n==', label, items.length, '==');
  for (const it of items) {
    console.log(String(it.y).padStart(6), String(it.x).padStart(6), String(it.sz).padStart(4), JSON.stringify(it.s));
  }
  await pdf.destroy();
  return items;
}

await dump('tools/tmp-hawb-fresa/hawb-draft-report-format.pdf', 'FRESA DRAFT');
await dump('C:/Users/fizat/Downloads/f94274e9-bea2-412d-ac9e-68205b80ffba.pdf', 'SYS DRAFT');

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
console.log('\nface idx', found);
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
console.log(
  'slots\n',
  obj.fieldSlots.map((s) => `${s.key}@${s.x},${s.y} z${s.size}`).join('\n'),
);

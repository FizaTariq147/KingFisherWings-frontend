import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getOfficialMeasuredFace } from '../src/features/reports/templates/official/officialFaceRegistry.ts';

const face = getOfficialMeasuredFace('HAWB_DRAFT_REPORT_FORMAT_1');
console.log({
  code: face?.code,
  pageCount: face?.pageCount,
  w: face?.widthPt,
  h: face?.heightPt,
  fieldSlots: face?.fieldSlots?.length,
  pages: face?.pages?.length,
  rects: face?.pages?.[0]?.rects?.length,
  lines: face?.pages?.[0]?.lines?.length,
  labels: face?.pages?.[0]?.labels?.length,
});
console.log(
  'slots',
  face?.fieldSlots?.slice(0, 25).map((s) => `${s.key}@${s.x},${s.y} sz${s.size}`),
);

const measured = 'src/features/reports/qa/phase2-hawb-fixtures/measured/HAWB_DRAFT_REPORT_FORMAT_1-measured.pdf';
const bytes = readFileSync(measured);
const doc = await getDocument({ data: new Uint8Array(bytes) }).promise;
console.log('measured pages', doc.numPages);
const page = await doc.getPage(1);
const content = await page.getTextContent();
const items = content.items
  .filter((i) => 'str' in i && i.str.trim())
  .map((i) => {
    const t = i.transform;
    return { y: +t[5].toFixed(1), x: +t[4].toFixed(1), s: i.str };
  });
items.sort((a, b) => b.y - a.y || a.x - b.x);
for (const it of items.slice(0, 60)) {
  console.log(String(it.y).padStart(6), String(it.x).padStart(6), JSON.stringify(it.s));
}
await doc.destroy();

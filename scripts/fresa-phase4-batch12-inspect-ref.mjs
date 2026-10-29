import fs from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const path = 'tmp/fresa-references/pdfs/invoice-report-format-3-summary-invoice.pdf';
const buf = new Uint8Array(fs.readFileSync(path));
const doc = await getDocument({ data: buf }).promise;
const page = await doc.getPage(1);
const v = page.getViewport({ scale: 1 });
const tc = await page.getTextContent();
const lines = [];
let cur = '';
let lastY = null;
for (const i of tc.items) {
  const y = Math.round(i.transform[5]);
  if (lastY !== null && Math.abs(y - lastY) > 2) {
    if (cur.trim()) lines.push(cur.trim());
    cur = '';
  }
  cur += (cur && !cur.endsWith(' ') ? ' ' : '') + i.str;
  lastY = y;
}
if (cur.trim()) lines.push(cur.trim());
console.log(JSON.stringify({ width: v.width, height: v.height, rotate: page.rotate, lines }, null, 2));

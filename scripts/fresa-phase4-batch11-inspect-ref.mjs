import fs from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const buf = new Uint8Array(
  fs.readFileSync('tmp/fresa-references/pdfs/invoice-report-format-2-tax-invoice-india.pdf'),
);
const doc = await getDocument({ data: buf }).promise;
const page = await doc.getPage(1);
const tc = await page.getTextContent();
const items = tc.items
  .map((i) => {
    const t = i.transform;
    return {
      str: String(i.str || ''),
      x: Math.round(t[4] * 10) / 10,
      y: Math.round(t[5] * 10) / 10,
    };
  })
  .filter((i) => i.str.trim());

// Group by Y (PDF space); Format-2 is rotated so interpret carefully.
const byY = new Map();
for (const i of items) {
  const key = Math.round(i.y);
  if (!byY.has(key)) byY.set(key, []);
  byY.get(key).push(i);
}
const rows = [...byY.entries()]
  .sort((a, b) => b[0] - a[0])
  .map(([y, arr]) => ({
    y,
    text: arr
      .sort((a, b) => a.x - b.x)
      .map((a) => a.str)
      .join(' '),
    xs: arr
      .sort((a, b) => a.x - b.x)
      .map((a) => `${a.x}:${a.str}`)
      .join(' | '),
  }));

const interesting = rows.filter((r) =>
  /Client|Invoice|Shipper|Consignee|Remarks|Job|MBL|Origin|TAX INVOICE|Phone|GSTIN|Credit|PO No|IGM|Reference|ETD|ETA|INCO/i.test(
    r.text,
  ),
);
console.log(interesting.slice(0, 40).map((r) => `${r.y}\t${r.xs}`).join('\n'));

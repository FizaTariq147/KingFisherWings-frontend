import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('reports/output/track-a4/page-boxes-before.json', 'utf8'));
const want = new Set([
  'AIR_QUOTATION_WITH_AIRLINE_REPORT_FORMAT',
  'ADVANCE_SHIPPING_NOTE_FORMAT_1',
  'GL_REPORT_VOUCHER_REPORT_FORMAT',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
]);
for (const item of data.mismatches) {
  if (!want.has(item.code)) continue;
  console.log(JSON.stringify(item, null, 2));
}
const deltas = {};
for (const item of data.mismatches) {
  const page = item.pages?.[0];
  if (!page?.reference?.mediaBox || !page?.rendered?.mediaBox) continue;
  const key = page.fields.filter((field) => field === 'MediaBox').length
    ? page.reference.mediaBox.map((value, index) => {
      const delta = Math.round((value - page.rendered.mediaBox[index]) * 1000) / 1000;
      return delta;
    }).join(',')
    : '';
  if (!key) continue;
  deltas[key] = (deltas[key] || 0) + 1;
}
console.log('media deltas', JSON.stringify(deltas, null, 2));

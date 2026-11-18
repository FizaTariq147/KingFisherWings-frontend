import fs from 'node:fs';

function rows(file) {
  const out = new Map();
  for (const line of fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1)) {
    const parts = [];
    let cur = '';
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') { quoted = !quoted; continue; }
      if (ch === ',' && !quoted) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    if (!out.has(parts[0])) out.set(parts[0], { nonText: parts[10], textInk: parts[11], cls: parts[8] || 'clean' });
  }
  return out;
}
const before = rows('reports/full-run-track-a-before-a4.csv');
const after = rows('reports/full-run-track-a-last.csv');
const codes = [
  'GL_REPORT_VOUCHER_REPORT_FORMAT',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT',
  'AIR_QUOTATION_REPORT_FORMAT',
  'DELIVERY_ORDER_REPORT_FORMAT_13',
  'HBL_DRAFT_REPORT_FORMAT_36',
];
for (const code of codes) {
  console.log(JSON.stringify({ code, before: before.get(code), after: after.get(code) }));
}

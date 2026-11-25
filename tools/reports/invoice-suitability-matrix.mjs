/**
 * Suitability matrix for the 26 v2 invoice codes.
 * Real invoices come from the local download. The 15 extra records are the
 * anonymized synthetic set. Does not commit live invoices.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chargePageCapacity } from './invoice-rows.mjs';

const root = process.cwd();
const codes = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
  'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
  'INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE',
  'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
  'INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA',
  'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE',
  'INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND',
  'INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED',
  'INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA',
  'INVOICE_REPORT_FORMAT_14_INVOICE',
  'INVOICE_REPORT_FORMAT_15_INVOICE_FCY',
  'INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED',
  'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER',
  'INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE',
  'INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM',
  'INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE',
  'PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT',
  'PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES',
  'PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES',
  'PURCHASE_INVOICE_REPORT_FORMAT_1',
  'PURCHASE_INVOICE_REPORT_FORMAT_2',
];

const gstBlocked = new Set([
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_14_INVOICE',
  'INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA',
  'PURCHASE_INVOICE_REPORT_FORMAT_1',
  'PURCHASE_INVOICE_REPORT_FORMAT_2',
]);

const totalsPath = path.join(root, 'reports/invoice-v2-totals.json');
const totals = JSON.parse(fs.readFileSync(totalsPath, 'utf8'));

function num(value) {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function close(left, right) {
  return Math.abs(Math.round(left * 100) - Math.round(right * 100)) <= 1;
}
function lineAmount(line) {
  if (line?.line_total != null && Number.isFinite(Number(line.line_total))) return Number(line.line_total);
  return num(line?.quantity) * num(line?.unit_price) + num(line?.tax_amount);
}
function taxOwed(invoice, lines) {
  if (invoice.tax_total != null) return num(invoice.tax_total);
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return lines.reduce((sum, line) => sum + num(line.tax_amount), 0);
}
function recordHasTax(invoice, lines) {
  if (invoice.tax_total != null && Math.abs(num(invoice.tax_total)) > 0.009) return true;
  if (invoice.tax_amount != null && invoice.tax_amount !== '' && Math.abs(num(invoice.tax_amount)) > 0.009) return true;
  return lines.some((line) => Math.abs(num(line.tax_amount)) > 0.009);
}

function suitability(code, invoice) {
  const profile = totals[code] || {};
  if (!profile.total) return { suitable: false, reason: 'this layout does not print a total' };
  if (invoice.total_amount == null) return { suitable: false, reason: 'the total is not on the invoice' };
  const lines = invoice.lines || [];
  const lineSum = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const tax = taxOwed(invoice, lines);
  const discount = num(invoice.discount);
  const rounding = num(invoice.rounding);
  const total = num(invoice.total_amount);
  const taxShown = profile.tax ? (invoice.tax_total == null ? 0 : num(invoice.tax_total)) : 0;
  const discountShown = profile.discount ? discount : 0;
  const roundingShown = profile.rounding ? rounding : 0;
  const subtotal = invoice.subtotal == null ? lineSum : num(invoice.subtotal);
  const base = profile.subtotal ? subtotal : lineSum;
  if (close(base + taxShown - discountShown + roundingShown, total) && close(lineSum + taxShown - discountShown + roundingShown, total)) {
    return { suitable: true, reason: null };
  }
  if (!profile.tax && Math.abs(tax) > 0.009 && close(base + tax - discountShown + roundingShown, total)) {
    return { suitable: false, reason: 'the tax is not printed' };
  }
  if (!profile.discount && Math.abs(discount) > 0.009 && close(base + taxShown - discount + roundingShown, total)) {
    return { suitable: false, reason: 'the discount is not printed' };
  }
  if (!profile.rounding && Math.abs(rounding) > 0.009 && close(base + taxShown - discountShown + rounding, total)) {
    return { suitable: false, reason: 'the rounding is not printed' };
  }
  if (profile.subtotal) return { suitable: false, reason: 'the subtotal does not add up to the total' };
  return { suitable: false, reason: 'the lines do not add up to the total' };
}

function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + b.width)) - (span.x - (a.x + a.width)))[0];
  if (left) return left;
  return spans
    .filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0] || null;
}
function taxLabel(label) {
  if (!label || label.length > 32) return false;
  if (/\b(sgst|cgst|igst|vat no|vatno|customer vat|trn|gstin)\b/.test(label)) return false;
  return /\b(tax|vat)\b/.test(label);
}
function numeric(text) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(text || '').trim());
}

function lineTaxColumn(spec) {
  const spans = spec.pages?.[0]?.spans || [];
  const rows = [];
  for (const span of spans) {
    if (span.role !== 'dynamic' || !numeric(span.text)) continue;
    const row = rows.find((item) => Math.abs(item.y - span.y) <= 3);
    if (row) row.spans.push(span);
    else rows.push({ y: span.y, spans: [span] });
  }
  const charge = rows.filter((row) => row.spans.length >= 3);
  for (const row of charge) {
    for (const span of row.spans) {
      if (taxLabel(normalizeLabel(nearestLabel(span, spans)?.text || ''))) return true;
    }
  }
  const top = charge[0]?.y;
  if (top == null) return false;
  return spans.some((span) => span.role === 'static' && span.y > top + 4 && span.y < top + 28 && taxLabel(normalizeLabel(span.text)));
}

function line(quantity, unitPrice, tax) {
  const lineTotal = Math.round((quantity * unitPrice + tax) * 100) / 100;
  return { description: 'Charge', quantity, unit_price: unitPrice, tax_amount: tax, line_total: lineTotal };
}
function syntheticRecord(id, currency, rawLines, extra = {}) {
  const lines = rawLines.map(([quantity, unitPrice, tax]) => line(quantity, unitPrice, tax));
  const subtotal = Math.round(lines.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  const tax = Math.round(lines.reduce((sum, item) => sum + item.tax_amount, 0) * 100) / 100;
  const discount = extra.discount || 0;
  const rounding = extra.rounding || 0;
  const total = Math.round((subtotal + tax - discount + rounding) * 100) / 100;
  return {
    kind: 'synthetic',
    number: id.toUpperCase(),
    invoice: {
      invoice_number: id.toUpperCase(),
      currency_code: currency,
      subtotal,
      tax_total: tax,
      tax_amount: tax,
      discount,
      rounding,
      total_amount: total,
      lines,
    },
  };
}

const synthetic = [
  syntheticRecord('syn-01', 'USD', [[1, 100, 0], [2, 40, 0], [1, 15, 0]]),
  syntheticRecord('syn-02', 'EUR', [[1, 80, 8], [3, 20, 6], [1, 12, 1.2], [2, 5, 1]]),
  syntheticRecord('syn-03', 'INR', [[1, 1000, 180], [2, 500, 180], [1, 250, 45], [4, 100, 72], [1, 75, 13.5]]),
  syntheticRecord('syn-04', 'AED', [[1, 200, 10], [1, 50, 2.5], [2, 25, 2.5]], { discount: 40 }),
  syntheticRecord('syn-05', 'GBP', [[1, 30, 0], [1, 18, 0], [2, 7, 0], [1, 4, 0], [3, 2, 0], [1, 1, 0]], { rounding: 0.04 }),
  syntheticRecord('syn-06', 'USD', [[2, 60, 12], [1, 25, 2.5], [1, 10, 1]], { discount: 15 }),
  syntheticRecord('syn-07', 'AED', [[1, 10, 0.5], [1, 20, 1], [1, 30, 1.5], [1, 40, 2], [1, 15, 0.75], [1, 8, 0.4], [1, 6, 0.3], [1, 4, 0.2]]),
  syntheticRecord('syn-08', 'PKR', [[10, 100, 0], [5, 80, 0], [2, 45, 0]]),
  syntheticRecord('syn-09', 'EUR', [[1, 40, 4], [1, 22, 2.2], [1, 9, 0.9]], { rounding: -0.03 }),
  syntheticRecord('syn-10', 'INR', Array.from({ length: 12 }, (_, index) => [1, (index + 1) * 100, (index + 1) * 18])),
  syntheticRecord('syn-11', 'USD', [[1, 500, 25], [2, 40, 4], [1, 15, 0.75]]),
  syntheticRecord('syn-12', 'GBP', [[1, 90, 18], [1, 30, 6], [1, 12, 2.4], [1, 8, 1.6]], { discount: 20 }),
  syntheticRecord('syn-13', 'AED', [[1, 70, 0], [2, 15, 0], [1, 5, 0]]),
  syntheticRecord('syn-14', 'AED', [[3, 1000, 150], [1, 250, 12.5], [2, 80, 8]]),
  syntheticRecord('syn-15', 'PKR', [[1, 2000, 300], [4, 125, 75], [1, 60, 9]], { discount: 100, rounding: 0.05 }),
];

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const real = live.invoices
  .filter((row) => !String(row.id).startsWith('extra-') && !String(row.id).startsWith('syn-'))
  .map((row) => ({
    kind: 'real',
    number: row.invoice.invoice_number,
    invoice: row.invoice,
    taxTotalKey: Object.prototype.hasOwnProperty.call(row.invoice, 'tax_total'),
  }));

const layout = {};
for (const code of codes) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const band = chargePageCapacity(spec);
  const lineTax = lineTaxColumn(spec);
  totals[code] = { ...totals[code], lineTax };
  layout[code] = { ...band, lineTax, taxRow: Boolean(totals[code].tax), subtotal: Boolean(totals[code].subtotal) };
}
fs.writeFileSync(totalsPath, `${JSON.stringify(totals, null, 2)}\n`);

function pagination(code, invoice) {
  const band = layout[code];
  const count = (invoice.lines || []).length;
  if (!band.hasBand) return 'no charge band';
  return count <= band.capacity ? `fit (${count} of ${band.capacity})` : `paginate (${count} lines, ${band.capacity} per page)`;
}

function pair(code, record) {
  const decision = suitability(code, record.invoice);
  const lines = record.invoice.lines || [];
  const taxNote = decision.suitable && recordHasTax(record.invoice, lines) && !layout[code].taxRow && !layout[code].lineTax
    ? 'suitable for arithmetic, tax not shown'
    : '';
  return {
    code,
    record: record.number,
    kind: record.kind,
    suitable: decision.suitable ? 'suitable' : 'not suitable',
    reason: decision.reason || '',
    taxNote,
    taxRow: layout[code].taxRow ? 'yes' : 'no',
    lineTax: layout[code].lineTax ? 'yes' : 'no',
    subtotal: layout[code].subtotal ? 'yes' : 'no',
    gstBlocked: gstBlocked.has(code) ? 'yes' : 'no',
    lines: lines.length,
    pagination: pagination(code, record.invoice),
  };
}

const rows = [];
for (const code of codes) {
  for (const record of real) rows.push(pair(code, record));
  for (const record of synthetic) rows.push(pair(code, record));
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
const header = ['code', 'record', 'kind', 'suitable', 'reason', 'tax_note', 'tax_row', 'line_tax_column', 'subtotal_row', 'gst_blocked', 'charge_lines', 'pagination'];
const csv = [header.join(',')].concat(rows.map((row) => header.map((key) => csvCell({
  code: row.code,
  record: row.record,
  kind: row.kind,
  suitable: row.suitable,
  reason: row.reason,
  tax_note: row.taxNote,
  tax_row: row.taxRow,
  line_tax_column: row.lineTax,
  subtotal_row: row.subtotal,
  gst_blocked: row.gstBlocked,
  charge_lines: row.lines,
  pagination: row.pagination,
}[key])).join(',')));

function mdTable(kind) {
  const lines = [
    '| Code | Record | Suitable | Reason | Tax row | Line tax | Subtotal | GST-blocked | Lines |',
    '|---|---|---|---|---|---|---|---|---|',
  ];
  for (const row of rows.filter((item) => item.kind === kind)) {
    const reason = row.taxNote || row.reason;
    lines.push(`| ${row.code} | ${row.record} | ${row.suitable} | ${reason || '—'} | ${row.taxRow} | ${row.lineTax} | ${row.subtotal} | ${row.gstBlocked} | ${row.pagination} |`);
  }
  return lines.join('\n');
}

const ranked = codes
  .filter((code) => !gstBlocked.has(code) && !code.includes('PREPRINTED'))
  .map((code) => {
    const mine = rows.filter((row) => row.code === code && row.kind === 'real');
    return {
      code,
      suited: mine.filter((row) => row.suitable === 'suitable').length,
      showsTax: layout[code].taxRow || layout[code].lineTax,
    };
  })
  .sort((a, b) => b.suited - a.suited || Number(b.showsTax) - Number(a.showsTax) || a.code.localeCompare(b.code));

const withTax = real.filter((row) => recordHasTax(row.invoice, row.invoice.lines || [])).map((row) => row.number);
const lineTaxNoTotal = real
  .filter((row) => !row.taxTotalKey && (row.invoice.lines || []).some((item) => Math.abs(num(item.tax_amount)) > 0.009))
  .map((row) => row.number);

const md = [
  '# Invoice v2 suitability matrix',
  '',
  'Nothing is accepted. No totals row was added to a layout.',
  '',
  'Suitable means the rows that layout already prints add up to the printed total. `suitable for arithmetic, tax not shown` is a note, not a block: the code stays openable.',
  '',
  'A tax row is a totals label with a live amount beside it. A line-tax column is a charge column labeled tax or VAT, and not SGST, CGST, or IGST. GST-blocked codes need that split and do not draw it.',
  '',
  'Pagination uses the repeating charge band. `no charge band` means the spec has no three-cell charge row for the repeater to copy.',
  '',
  '## Real invoices with tax',
  '',
  withTax.length ? withTax.map((number) => `- ${number}`).join('\n') : 'None.',
  '',
  'The other real invoices have header `tax_amount` 0 and line tax 0.',
  '',
  '## tax_total',
  '',
  'The downloaded `GET /invoices/:id` body has no `tax_total` key on any of these 10. The header field that is present is `tax_amount` (a string). Line objects have `tax_amount`.',
  '',
  '`normalizeInvoice` in `src/features/invoices/utils/normalizeInvoice.ts` sets `tax_total` from `tax_total`, then `vat_amount`, then `taxTotal`. It does not copy header `tax_amount`. Classic still reads `tax_total` only. That file was not changed.',
  '',
  `Line tax is present and \`tax_total\` is absent on: ${lineTaxNoTotal.join(', ') || 'none'}.`,
  '',
  '## Ranked non-GST, non-preprinted codes',
  '',
  'Ordered by how many of the 10 real invoices they suit, then by whether they show a tax figure.',
  '',
  '| Rank | Code | Real invoices suited | Shows tax |',
  '|---|---|---|---|',
  ...ranked.map((row, index) => `| ${index + 1} | ${row.code} | ${row.suited} | ${row.showsTax ? 'yes' : 'no'} |`),
  '',
  '## Real invoices',
  '',
  mdTable('real'),
  '',
  '## Synthetic records',
  '',
  'These 15 records are anonymized and marked synthetic. The downloaded invoices do not include a discount, a rounding amount, or a three-line invoice that also has tax.',
  '',
  mdTable('synthetic'),
  '',
].join('\n');

const outDir = path.join(root, 'reports/invoice-v2');
fs.writeFileSync(path.join(outDir, 'suitability-matrix.md'), md);
fs.writeFileSync(path.join(outDir, 'suitability.csv'), `${csv.join('\n')}\n`);
console.log(JSON.stringify({
  real: real.length,
  synthetic: synthetic.length,
  rows: rows.length,
  lineTaxCodes: codes.filter((code) => layout[code].lineTax),
  withTax,
  lineTaxNoTotal,
  top: ranked.slice(0, 8),
}, null, 2));

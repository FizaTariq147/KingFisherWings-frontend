/**
 * Format 10: printed charge lines versus the printed total, plus the 40-line case.
 * Not a release check-in artifact.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { PDFDocument } from 'pdf-lib';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const code = 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE';
const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseMoney(text) {
  const number = Number(String(text || '').replace(/,/g, ''));
  return Number.isFinite(number) ? Math.round(number * 100) : null;
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
    id,
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

function printed(record) {
  const copy = JSON.parse(JSON.stringify(spec));
  const filled = fillInvoiceSpans(copy, { invoice: record.invoice, job: record.job || {}, party: record.party || {}, organization: {} });
  const spans = (copy.pages || []).flatMap((page) => page.spans || []);
  const byLine = new Map();
  for (const span of spans) {
    const match = String(span.id || '').match(/^line-(\d+)-/);
    if (!match || /-desc$/.test(span.id) || /-ccy$/.test(span.id)) continue;
    const value = filled.values[span.id];
    if (!/^\d[\d,]*\.\d{2}$/.test(String(value || ''))) continue;
    const current = byLine.get(match[1]);
    if (!current || span.x > current.x) byLine.set(match[1], { x: span.x, value });
  }
  const lineAmounts = [...byLine.values()].map((item) => parseMoney(item.value));
  const totalText = money(record.invoice.total_amount);
  const totalCents = parseMoney(totalText);
  const printedTotal = Object.values(filled.values).some((value) => String(value) === totalText);
  const sum = lineAmounts.reduce((total, cents) => total + (cents || 0), 0);
  return { id: record.invoice.invoice_number || record.id, lineCents: lineAmounts, sum, totalCents, printedTotal, addsUp: printedTotal && sum === totalCents };
}

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const real = live.invoices.filter((row) => row.invoice?.invoice_number && !String(row.id || '').startsWith('syn-') && !String(row.id || '').startsWith('extra-'));
const classic = real.map((row) => {
  const invoice = row.invoice || {};
  const subtotal = Number(invoice.subtotal ?? 0);
  const vat = invoice.tax_total == null || invoice.tax_total === '' ? 0 : Number(invoice.tax_total);
  const headerTax = Number(invoice.tax_amount ?? 0);
  const lineTax = (invoice.lines || []).reduce((sum, item) => sum + Number(item.tax_amount ?? 0), 0);
  return {
    number: invoice.invoice_number,
    subtotal,
    classicVat: vat,
    classicDiscount: 0,
    headerTax,
    lineTax: Math.round(lineTax * 100) / 100,
  };
});
const checks = [...real, ...synthetic].map((row) => printed(row));

const lines = Array.from({ length: 40 }, (_, index) => {
  const amount = (index + 1) * 10;
  return { description: `Charge line ${String(index + 1).padStart(2, '0')}`, quantity: 1, unit_price: amount, tax_amount: 0, line_total: amount };
});
const sum = lines.reduce((total, item) => total + item.line_total, 0);
const copy = JSON.parse(JSON.stringify(spec));
const filled = fillInvoiceSpans(copy, {
  invoice: { lines, subtotal: sum, tax_total: 0, total_amount: sum, currency_code: 'USD' },
  job: {}, party: {}, organization: {},
});
const outPath = path.join(os.tmpdir(), 'format-10-40.pdf');
await renderSpec(code, { spec: copy, values: filled.values, organization: { name: '', address: '', phone: '', email: '', website: '' }, quietArtifacts: true, outputPath: outPath });
const text = execFileSync('pdftotext', ['-layout', outPath, '-'], { encoding: 'utf8' });
const pdfPages = (await PDFDocument.load(fs.readFileSync(outPath))).getPageCount();
fs.rmSync(outPath, { force: true });
const missing = lines.filter((item) => !text.includes(item.description)).map((item) => item.description);
const pages = pdfPages;

console.log(JSON.stringify({
  classic,
  checks: checks.map((row) => ({ id: row.id, addsUp: row.addsUp, sum: row.sum, total: row.totalCents, lines: row.lineCents.length, printedTotal: row.printedTotal })),
  forty: { pages, specPages: copy.pages.length, missing: missing.length, totalPresent: text.includes(money(sum)) },
}, null, 2));

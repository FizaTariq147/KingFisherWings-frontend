/**
 * Reconcile flow totals against the invoice record (and classic money sheet)
 * for the 10 real + 15 synthetic invoices. Writes reports/flow-spike/reconcile-25.json
 * and docs/reports/backend-note-tax.md for classic VAT 0.00 vs line tax_amount.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';
import { flowTaxAmount, flowTotalsRows, money2 } from './invoice-flow-totals.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/flow-spike');
fs.mkdirSync(outDir, { recursive: true });

function line(quantity, unitPrice, tax) {
  const lineTotal = Math.round((quantity * unitPrice + tax) * 100) / 100;
  return {
    description: 'Charge',
    quantity,
    unit_price: unitPrice,
    tax_amount: tax,
    line_total: lineTotal,
  };
}

function synthetic(id, currency, rawLines, extra = {}) {
  const lines = rawLines.map(([quantity, unitPrice, tax]) => line(quantity, unitPrice, tax));
  const subtotal = Math.round(lines.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  const tax = Math.round(lines.reduce((sum, item) => sum + item.tax_amount, 0) * 100) / 100;
  const discount = extra.discount || 0;
  const rounding = extra.rounding || 0;
  const total = Math.round((subtotal + tax - discount + rounding) * 100) / 100;
  return {
    id,
    synthetic: true,
    invoice: {
      id,
      invoice_number: id.toUpperCase(),
      status: 'POSTED',
      currency_code: currency,
      subtotal,
      tax_amount: tax,
      discount,
      rounding,
      total_amount: total,
      lines,
    },
    job: null,
    party: { name: 'Sample Customer' },
  };
}

const SYNTHETIC = [
  synthetic('syn-01', 'USD', [[1, 100, 0], [2, 40, 0], [1, 15, 0]]),
  synthetic('syn-02', 'EUR', [[1, 80, 8], [3, 20, 6], [1, 12, 1.2], [2, 5, 1]]),
  synthetic('syn-03', 'INR', [[1, 1000, 180], [2, 500, 180], [1, 250, 45], [4, 100, 72], [1, 75, 13.5]]),
  synthetic('syn-04', 'AED', [[1, 200, 10], [1, 50, 2.5], [2, 25, 2.5]], { discount: 40 }),
  synthetic('syn-05', 'GBP', [[1, 30, 0], [1, 18, 0], [2, 7, 0], [1, 4, 0], [3, 2, 0], [1, 1, 0]], { rounding: 0.04 }),
  synthetic('syn-06', 'USD', [[2, 60, 12], [1, 25, 2.5], [1, 10, 1]], { discount: 15 }),
  synthetic('syn-07', 'AED', [[1, 10, 0.5], [1, 20, 1], [1, 30, 1.5], [1, 40, 2], [1, 15, 0.75], [1, 8, 0.4], [1, 6, 0.3], [1, 4, 0.2]]),
  synthetic('syn-08', 'PKR', [[10, 100, 0], [5, 80, 0], [2, 45, 0]]),
  synthetic('syn-09', 'EUR', [[1, 40, 4], [1, 22, 2.2], [1, 9, 0.9]], { rounding: -0.03 }),
  synthetic('syn-10', 'INR', Array.from({ length: 12 }, (_, index) => [1, (index + 1) * 100, (index + 1) * 18])),
  synthetic('syn-11', 'USD', [[1, 500, 25], [2, 40, 4], [1, 15, 0.75]]),
  synthetic('syn-12', 'GBP', [[1, 90, 18], [1, 30, 6], [1, 12, 2.4], [1, 8, 1.6]], { discount: 20 }),
  synthetic('syn-13', 'AED', [[1, 70, 0], [2, 15, 0], [1, 5, 0]]),
  synthetic('syn-14', 'AED', [[3, 1000, 150], [1, 250, 12.5], [2, 80, 8]]),
  synthetic('syn-15', 'PKR', [[1, 2000, 300], [4, 125, 75], [1, 60, 9]], { discount: 100, rounding: 0.05 }),
];

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function containsAmount(text, amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return false;
  const body = Math.abs(value).toFixed(2);
  const [whole, frac] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tokens = [`${grouped}.${frac}`, `${whole}.${frac}`];
  if (frac === '00') tokens.push(grouped, whole);
  return tokens.some((token) => {
    const escaped = token.replace(/\./g, '\\.');
    return new RegExp(`(?<![\\d,./])${escaped}(?![\\d.])`).test(text);
  });
}

async function classicMoneyPdf(record, outPath) {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const invoice = record.invoice || {};
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;
  const draw = (label, value, useBold = false) => {
    page.drawText(`${label}: ${value == null || value === '' ? '0.00' : value}`.slice(0, 110), {
      x: 40,
      y,
      size: 10,
      font: useBold ? bold : font,
    });
    y -= 14;
  };
  // Mirror classic invoiceToPdfModel: VAT from tax_total ?? 0
  const classicVat = invoice.tax_total ?? 0;
  draw('Invoice', invoice.invoice_number || '', true);
  draw('Subtotal', money2(invoice.subtotal ?? 0));
  draw('Discount', money2(invoice.discount ?? 0));
  draw('VAT', money2(classicVat));
  draw('Total', money2(invoice.total_amount ?? 0), true);
  for (const item of invoice.lines || []) {
    draw(item.description || 'line', money2(item.line_total));
    if (y < 60) break;
  }
  fs.writeFileSync(outPath, await doc.save());
  return { classicVat: Number(classicVat) || 0 };
}

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const org = live.organization || {};
const real = live.invoices
  .filter((row) => !String(row.id || '').startsWith('extra') && !String(row.invoice?.invoice_number || '').startsWith('EXTRA'))
  .map((row) => ({ ...row, synthetic: false }));

const rows = [...real, ...SYNTHETIC];
const results = [];
const classicVatZeroWithLineTax = [];

for (const row of rows) {
  const invoice = row.invoice;
  const number = invoice.invoice_number;
  const record = {
    code: 'INVOICE_FLOW_TAX_INVOICE_1',
    organization: org,
    invoice,
    job: row.job,
    party: row.party,
  };
  const slug = String(number).replace(/[^\w.-]+/g, '_');
  const flowPdf = path.join(outDir, `reconcile-${slug}.pdf`);
  await renderInvoiceFlowPdf(record, flowPdf);
  const classicPdf = path.join(outDir, `reconcile-classic-${slug}.pdf`);
  const { classicVat } = await classicMoneyPdf(record, classicPdf);
  const flowText = pdfText(flowPdf);
  const classicText = pdfText(classicPdf);
  const expected = flowTotalsRows(invoice);
  const vsRecord = expected.map((item) => ({
    key: item.key,
    label: item.label,
    amount: item.amount,
    inFlow: containsAmount(flowText, item.amount),
  }));
  const recordOk = vsRecord.every((item) => item.inFlow);
  const flowTax = flowTaxAmount(invoice);
  const lineTax = (invoice.lines || []).reduce((sum, line) => sum + Number(line.tax_amount || 0), 0);
  const vsClassic = {
    subtotal: {
      flow: containsAmount(flowText, invoice.subtotal ?? 0),
      classic: containsAmount(classicText, invoice.subtotal ?? 0),
    },
    tax: {
      flowAmount: flowTax,
      classicVat,
      flowPrintsTax: containsAmount(flowText, flowTax),
      classicPrintsVat: containsAmount(classicText, classicVat),
      differs: Math.abs(flowTax - classicVat) > 0.009,
    },
    total: {
      flow: containsAmount(flowText, invoice.total_amount ?? 0),
      classic: containsAmount(classicText, invoice.total_amount ?? 0),
    },
  };
  if (classicVat === 0 && (Math.abs(flowTax) > 0.009 || Math.abs(lineTax) > 0.009) && !row.synthetic) {
    classicVatZeroWithLineTax.push({
      invoice: number,
      tax_amount: invoice.tax_amount ?? null,
      tax_total: invoice.tax_total ?? null,
      lineTax: Math.round(lineTax * 100) / 100,
      classicVat,
      flowTax: Math.round(flowTax * 100) / 100,
    });
  }
  results.push({
    invoice: number,
    synthetic: Boolean(row.synthetic),
    recordOk,
    vsRecord,
    vsClassic,
    blanks: [
      !row.job ? 'job missing' : null,
      !(row.job?.containers || []).length && !row.job?.primary_container_number ? 'containers empty' : null,
    ].filter(Boolean),
  });
}

const summary = {
  total: results.length,
  recordPass: results.filter((row) => row.recordOk).length,
  flowClassicTaxDiffers: results.filter((row) => row.vsClassic.tax.differs).map((row) => row.invoice),
  classicVatZeroWithLineTax: classicVatZeroWithLineTax.map((row) => row.invoice),
};

fs.writeFileSync(path.join(outDir, 'reconcile-25.json'), `${JSON.stringify({ summary, results }, null, 2)}\n`);

const note = [
  '# Backend note: classic VAT vs line tax_amount',
  '',
  'Classic `invoiceToPdfModel` sets `vatAmount = invoice.tax_total ?? 0`.',
  'It does not read `invoice.tax_amount` or sum line `tax_amount`.',
  'Flow prints Tax from header/line `tax_amount` and never uses `tax_total`.',
  '',
  'Real invoices where classic would print VAT 0.00 while lines (or header tax_amount) contain tax:',
  '',
  ...classicVatZeroWithLineTax.map(
    (row) =>
      `- **${row.invoice}** — header tax_amount=${row.tax_amount}, tax_total=${row.tax_total}, line tax sum=${row.lineTax}, classic VAT=${row.classicVat}, flow Tax=${row.flowTax}`,
  ),
  '',
  'Do not change the classic generator. Backend should populate `tax_total` when VAT must appear on classic PDFs, or clients should prefer flow for tax_amount-backed totals.',
  '',
];
fs.mkdirSync(path.join(root, 'docs/reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/reports/backend-note-tax.md'), `${note.join('\n')}\n`);

console.log(JSON.stringify(summary, null, 2));

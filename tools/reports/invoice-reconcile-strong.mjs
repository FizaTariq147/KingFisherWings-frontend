/**
 * Money reconciliation for Formats 17 and 4.
 * The 10 downloaded invoices have no discount or rounding, and only one has
 * three lines. The extra 15 records are synthetic and anonymized.
 * Writes reports/invoice-v2/reconciliation-formats-17-4.md. Does not commit live data.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const codes = [
  'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER',
  'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
];

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

function record(id, currency, rawLines, extra = {}) {
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
      party_id: 'sample-party',
      party_name: 'Sample Customer',
      currency_code: currency,
      subtotal,
      tax_total: tax,
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

const synthetic = [
  record('syn-01', 'USD', [[1, 100, 0], [2, 40, 0], [1, 15, 0]]),
  record('syn-02', 'EUR', [[1, 80, 8], [3, 20, 6], [1, 12, 1.2], [2, 5, 1]]),
  record('syn-03', 'INR', [[1, 1000, 180], [2, 500, 180], [1, 250, 45], [4, 100, 72], [1, 75, 13.5]]),
  record('syn-04', 'AED', [[1, 200, 10], [1, 50, 2.5], [2, 25, 2.5]], { discount: 40 }),
  record('syn-05', 'GBP', [[1, 30, 0], [1, 18, 0], [2, 7, 0], [1, 4, 0], [3, 2, 0], [1, 1, 0]], { rounding: 0.04 }),
  record('syn-06', 'USD', [[2, 60, 12], [1, 25, 2.5], [1, 10, 1]], { discount: 15 }),
  record('syn-07', 'AED', [[1, 10, 0.5], [1, 20, 1], [1, 30, 1.5], [1, 40, 2], [1, 15, 0.75], [1, 8, 0.4], [1, 6, 0.3], [1, 4, 0.2]]),
  record('syn-08', 'PKR', [[10, 100, 0], [5, 80, 0], [2, 45, 0]]),
  record('syn-09', 'EUR', [[1, 40, 4], [1, 22, 2.2], [1, 9, 0.9]], { rounding: -0.03 }),
  record('syn-10', 'INR', Array.from({ length: 12 }, (_, index) => [1, (index + 1) * 100, (index + 1) * 18])),
  record('syn-11', 'USD', [[1, 500, 25], [2, 40, 4], [1, 15, 0.75]]),
  record('syn-12', 'GBP', [[1, 90, 18], [1, 30, 6], [1, 12, 2.4], [1, 8, 1.6]], { discount: 20 }),
  record('syn-13', 'AED', [[1, 70, 0], [2, 15, 0], [1, 5, 0]]),
  record('syn-14', 'AED', [[3, 1000, 150], [1, 250, 12.5], [2, 80, 8]]),
  record('syn-15', 'PKR', [[1, 2000, 300], [4, 125, 75], [1, 60, 9]], { discount: 100, rounding: 0.05 }),
];

function containsAmount(text, amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return false;
  const abs = Math.abs(value);
  const body = abs.toFixed(2);
  const [whole, frac] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tokens = [`${grouped}.${frac}`, `${whole}.${frac}`];
  if (frac === '00') tokens.push(grouped, whole);
  return tokens.some((token) => {
    const escaped = token.replace(/\./g, '\\.');
    return new RegExp(`(?<![\\d,./])${escaped}(?![\\d.])`).test(text);
  });
}

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const real = live.invoices.filter((row) => !String(row.id).startsWith('extra-') && !String(row.id).startsWith('syn-'));
const rows = [...real.map((row) => ({ ...row, synthetic: false })), ...synthetic];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reconcile-strong-'));
const classicDir = path.join(tmp, 'classic');
fs.mkdirSync(classicDir, { recursive: true });
fs.writeFileSync(path.join(tmp, 'batch-live.json'), `${JSON.stringify({ organization: { name: 'Sample Company' }, invoices: synthetic })}\n`);
execFileSync(process.execPath, [
  path.join(root, 'node_modules/vitest/vitest.mjs'),
  'run',
  '--project',
  'unit',
  'src/features/reports/engine/writeClassicInvoices.test.ts',
], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, LIVE_INVOICE_DIR: tmp, TZ: 'UTC' },
});

const mismatches = [];
const absent = [];
for (const code of codes) {
  for (const row of rows) {
    const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
    const filled = fillInvoiceSpans(spec, {
      invoice: row.invoice,
      job: row.job,
      party: row.party,
      organization: { name: 'Sample Company' },
    });
    const v2Path = path.join(tmp, `${code}-${row.id}.pdf`);
    await renderSpec(code, {
      spec,
      values: filled.values,
      organization: { name: 'Sample Company' },
      outputPath: v2Path,
      quietArtifacts: true,
    });
    const classicPath = row.synthetic
      ? path.join(classicDir, `${row.id}.pdf`)
      : path.join(root, 'reports/output/invoice-v2/classic', `${row.id}.pdf`);
    const classicText = pdfText(classicPath);
    const v2Text = pdfText(v2Path);
    const amounts = [
      ['subtotal', row.invoice.subtotal],
      ['tax', row.invoice.tax_total ?? 0],
      ['total', row.invoice.total_amount],
      ...(row.invoice.lines || []).map((item, index) => [`line ${index + 1}`, item.line_total]),
    ];
    if (row.invoice.discount) amounts.push(['discount', row.invoice.discount]);
    if (row.invoice.rounding) amounts.push(['rounding', row.invoice.rounding]);
    const split = amounts.map(([name, amount]) => ({
      name,
      amount,
      classic: containsAmount(classicText, amount),
      v2: containsAmount(v2Text, amount),
    }));
    const bad = split.filter((item) => item.classic !== item.v2);
    const missing = split.filter((item) => !item.classic && !item.v2 && Number(item.amount) !== 0);
    if (bad.length) {
      mismatches.push({
        code,
        id: row.invoice.invoice_number || row.id,
        synthetic: Boolean(row.synthetic),
        bad: bad.map((item) => `${item.name} ${Number(item.amount).toFixed(2)} classic=${item.classic} v2=${item.v2}`),
      });
    }
    if (missing.length) {
      absent.push({
        code,
        id: row.invoice.invoice_number || row.id,
        synthetic: Boolean(row.synthetic),
        missing: missing.map((item) => `${item.name} ${Number(item.amount).toFixed(2)}`),
      });
    }
  }
}

const lines = [
  '# Money reconciliation for Formats 17 and 4',
  '',
  'Nothing is accepted.',
  '',
  'The 10 downloaded invoices do not include a discount, a rounding amount, or a three-line invoice that also has tax. `INV/26/00101` has three lines and no tax. The other 15 records are synthetic anonymized copies, marked synthetic below.',
  '',
  `Records compared: ${rows.length}. Classic and v2 disagree on ${mismatches.length} sheets. Amounts printed on neither PDF: ${absent.length} sheets.`,
  '',
  'Subtotal, every line amount, and the total are in the check. A row below is an amount one PDF prints and the other does not. Classic always prints a VAT row from tax_total, and 0.00 when tax_total is null. Formats 17 and 4 print a subtotal and a total, and no tax, discount, or rounding row. Classic hardcodes Discount to 0.00 and has no rounding row.',
  '',
];
if (!mismatches.length) {
  lines.push('No mismatch.');
} else {
  lines.push('| Code | Record | Kind | One PDF has it |');
  lines.push('|---|---|---|---|');
  for (const row of mismatches) {
    lines.push(`| ${row.code} | ${row.id} | ${row.synthetic ? 'synthetic' : 'real'} | ${row.bad.join('; ')} |`);
  }
}
lines.push('');
if (absent.length) {
  lines.push('These amounts are on neither PDF. The classic discount is hardcoded to 0, and neither layout prints a rounding row.');
  lines.push('');
  lines.push('| Code | Record | Kind | On neither PDF |');
  lines.push('|---|---|---|---|');
  for (const row of absent) {
    lines.push(`| ${row.code} | ${row.id} | ${row.synthetic ? 'synthetic' : 'real'} | ${row.missing.join('; ')} |`);
  }
}
lines.push('');
const out = path.join(root, 'reports/invoice-v2/reconciliation-formats-17-4.md');
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ records: rows.length, mismatches: mismatches.length, absent: absent.length, out }, null, 2));

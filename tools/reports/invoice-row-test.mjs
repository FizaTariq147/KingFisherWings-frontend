/**
 * 12-line and 40-line invoices. Every description is painted, and the sum of
 * the line amounts equals the painted grand total.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
const specPath = path.join(root, 'reports/specs', `${code}.json`);

function money(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function contains(text, amount) {
  const body = String(amount).replace(/,/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\D)${body}(?:\\D|$)`).test(text.replace(/,/g, ''));
}

async function run(count) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const lines = Array.from({ length: count }, (_, index) => {
    const amount = (index + 1) * 10;
    return {
      description: `Charge line ${String(index + 1).padStart(2, '0')}`,
      quantity: 1,
      unit_price: amount,
      tax_amount: 0,
      line_total: amount,
    };
  });
  const sum = lines.reduce((total, line) => total + line.line_total, 0);
  const record = {
    invoice: { lines, subtotal: sum, tax_total: 0, total_amount: sum, currency_code: 'USD' },
    job: {},
    party: {},
    organization: {},
  };
  const filled = fillInvoiceSpans(spec, record);
  const outPath = path.join(os.tmpdir(), `rows-${count}.pdf`);
  await renderSpec(code, {
    spec,
    values: filled.values,
    organization: { name: '', address: '', phone: '', email: '', website: '' },
    quietArtifacts: true,
    outputPath: outPath,
  });
  const text = execFileSync('pdftotext', ['-layout', outPath, '-'], { encoding: 'utf8' });
  fs.rmSync(outPath, { force: true });
  const missing = lines.filter((line) => !text.includes(line.description)).map((line) => line.description);
  const totalOk = contains(text, money(sum));
  const lineOk = lines.every((line) => contains(text, money(line.line_total)));
  return { count, pages: (text.match(/\f/g) || []).length + 1, missing, totalOk, lineOk, sum: money(sum) };
}

const results = [await run(12), await run(40)];
console.log(JSON.stringify(results, null, 2));
if (results.some((row) => row.missing.length || !row.totalOk || !row.lineOk)) process.exit(1);

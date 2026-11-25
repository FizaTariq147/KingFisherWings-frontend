/**
 * An amount column whose sample has three decimals is money, not quantity.
 * Format 9: p1s96 sits under "32.AMOUNT IN USD" and its sample is 275.000.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fillInvoiceSpans } from './invoice-bindings.mjs';

const root = process.cwd();
const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs/INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA.json'), 'utf8'));

function filled(invoice) {
  const copy = JSON.parse(JSON.stringify(spec));
  return fillInvoiceSpans(copy, { invoice, job: {}, party: {}, organization: {} }).values;
}

const aed = filled({
  currency_code: 'AED',
  exchange_rate: '1',
  lines: [{ description: 'Freight', quantity: 10, unit_price: 12, tax_amount: 0, line_total: 120 }],
  subtotal: 120,
  tax_total: 0,
  total_amount: 120,
});
assert.equal(aed['line-0-p1s96'], '120.00', 'AMOUNT IN USD must not receive the quantity');
assert.notEqual(aed['line-0-p1s96'], '10');
assert.equal(aed['line-0-p1s97'], '10', 'QUANTITY column');
assert.equal(aed['line-0-p1s98'], '120.00', 'Amount (AED) is the line amount when the invoice is AED');

const usd = filled({
  currency_code: 'USD',
  exchange_rate: '3.67',
  lines: [{ description: 'Freight', quantity: 2, unit_price: 50, tax_amount: 0, line_total: 100 }],
  subtotal: 100,
  tax_total: 0,
  total_amount: 100,
});
assert.equal(usd['line-0-p1s96'], '100.00', 'USD column matches the invoice currency');
assert.equal(usd['line-0-p1s97'], '2');
assert.equal(usd['line-0-p1s98'], '367.00', 'AED column is the line amount times exchange_rate');

const noRate = filled({
  currency_code: 'USD',
  lines: [{ description: 'Freight', quantity: 2, unit_price: 50, tax_amount: 0, line_total: 100 }],
  subtotal: 100,
  tax_total: 0,
  total_amount: 100,
});
assert.equal(noRate['line-0-p1s96'], '100.00');
assert.equal(noRate['line-0-p1s98'], '', 'a different currency stays blank when exchange_rate is missing');

console.log(JSON.stringify({ usdColumn: aed['line-0-p1s96'], quantity: aed['line-0-p1s97'], aedColumn: aed['line-0-p1s98'] }));

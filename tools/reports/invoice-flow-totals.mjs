/**
 * Flow totals from the invoice record. Tax uses tax_amount only (never tax_total).
 */

function num(value) {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function flowTaxAmount(invoice = {}) {
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return (invoice.lines || []).reduce((sum, line) => sum + num(line.tax_amount), 0);
}

export function flowTotalsRows(invoice = {}) {
  return [
    { key: 'subtotal', label: 'Sub Total', amount: num(invoice.subtotal) },
    { key: 'discount', label: 'Discount', amount: num(invoice.discount) },
    { key: 'tax', label: 'Tax', amount: flowTaxAmount(invoice) },
    { key: 'rounding', label: 'Rounding', amount: num(invoice.rounding) },
    { key: 'total', label: 'Total', amount: num(invoice.total_amount) },
  ];
}

export function flowPrintedTotal(invoice = {}) {
  return num(invoice.subtotal) + flowTaxAmount(invoice) - num(invoice.discount) + num(invoice.rounding);
}

export function flowTotalsAddUp(invoice = {}) {
  if (invoice.total_amount == null || invoice.total_amount === '') return false;
  const printed = flowPrintedTotal(invoice);
  const total = num(invoice.total_amount);
  return Math.abs(Math.round(printed * 100) - Math.round(total * 100)) <= 1;
}

export function money2(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

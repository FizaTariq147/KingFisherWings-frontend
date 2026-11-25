/**
 * Flow totals from the invoice record. Tax uses tax_amount only (never tax_total).
 */

function num(value) {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cents(value) {
  return Math.round(num(value) * 100);
}

export function lineTaxSum(invoice = {}) {
  return (invoice.lines || []).reduce((sum, line) => sum + num(line.tax_amount), 0);
}

/**
 * Header tax_amount when set; otherwise sum of line tax_amount. Never tax_total.
 * Does not add header and lines together (no double count).
 */
export function flowTaxAmount(invoice = {}) {
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return lineTaxSum(invoice);
}

export function flowTotalsRows(invoice = {}) {
  return [
    { key: 'subtotal', label: 'Sub Total', amount: num(invoice.subtotal) },
    { key: 'discount', label: 'Discount', amount: num(invoice.discount ?? invoice.discount_amount) },
    { key: 'tax', label: 'Tax', amount: flowTaxAmount(invoice) },
    { key: 'rounding', label: 'Rounding', amount: num(invoice.rounding) },
    { key: 'total', label: 'Total', amount: num(invoice.total_amount) },
  ];
}

export function flowPrintedTotal(invoice = {}) {
  return num(invoice.subtotal) + flowTaxAmount(invoice) - num(invoice.discount ?? invoice.discount_amount) + num(invoice.rounding);
}

export function flowTotalsAddUp(invoice = {}) {
  if (invoice.total_amount == null || invoice.total_amount === '') return false;
  const printed = flowPrintedTotal(invoice);
  const total = num(invoice.total_amount);
  return Math.abs(cents(printed) - cents(total)) <= 1;
}

/**
 * Assertions for every record (real and synthetic):
 * 1. header tax_amount equals sum of line tax_amount (when header is set and lines carry tax)
 * 2. Sub Total + Tax + Rounding − Discount equals Total
 * 3. line tax is not counted twice (Tax figure is header OR line sum, never both added)
 *
 * @returns {{ ok: boolean, violations: Array<{ code: string, detail: string }> }}
 */
export function assertFlowTaxIntegrity(invoice = {}) {
  const violations = [];
  const headerSet = invoice.tax_amount != null && invoice.tax_amount !== '';
  const header = headerSet ? num(invoice.tax_amount) : null;
  const lines = lineTaxSum(invoice);
  const tax = flowTaxAmount(invoice);

  if (headerSet && (invoice.lines || []).length > 0) {
    if (Math.abs(cents(header) - cents(lines)) > 1) {
      violations.push({
        code: 'header_vs_line_tax',
        detail: `header tax_amount=${header} != sum(line tax_amount)=${lines}`,
      });
    }
  }

  if (invoice.total_amount != null && invoice.total_amount !== '' && !flowTotalsAddUp(invoice)) {
    violations.push({
      code: 'totals_equation',
      detail: `Sub Total(${num(invoice.subtotal)}) + Tax(${tax}) + Rounding(${num(invoice.rounding)}) - Discount(${num(invoice.discount ?? invoice.discount_amount)}) = ${flowPrintedTotal(invoice)} != Total(${num(invoice.total_amount)})`,
    });
  }

  // Tax figure must use header OR line sum exclusively (never both added).
  if (headerSet) {
    if (Math.abs(cents(tax) - cents(header)) > 1) {
      violations.push({
        code: 'tax_double_count',
        detail: `Tax figure ${tax} is not header tax_amount=${header} alone (would double-count lines=${lines})`,
      });
    }
  } else if (Math.abs(cents(tax) - cents(lines)) > 1) {
    violations.push({
      code: 'tax_double_count',
      detail: `Tax figure ${tax} is not line tax sum=${lines}`,
    });
  }

  return { ok: violations.length === 0, violations, tax, lineTaxSum: lines, headerTax: header };
}

export function money2(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

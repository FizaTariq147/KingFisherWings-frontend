/**
 * Flow totals rows from the invoice record.
 * Tax uses header/line tax_amount only — never tax_total.
 */
export type FlowTotalsInvoice = {
  subtotal?: number | string | null;
  tax_amount?: number | string | null;
  discount?: number | string | null;
  discount_amount?: number | string | null;
  rounding?: number | string | null;
  total_amount?: number | string | null;
  tax_total?: number | string | null;
  lines?: Array<{ tax_amount?: number | string | null; line_total?: number | string | null }> | null;
};

export type FlowTotalsRow = {
  key: 'subtotal' | 'discount' | 'tax' | 'rounding' | 'total';
  label: string;
  amount: number;
};

export type FlowTaxViolation = {
  code: 'header_vs_line_tax' | 'totals_equation' | 'tax_double_count';
  detail: string;
};

function num(value: unknown): number {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cents(value: unknown): number {
  return Math.round(num(value) * 100);
}

export function lineTaxSum(invoice: FlowTotalsInvoice): number {
  return (invoice.lines || []).reduce((sum, line) => sum + num(line.tax_amount), 0);
}

/** Header tax_amount when set; otherwise sum of line tax_amount. Never tax_total. */
export function flowTaxAmount(invoice: FlowTotalsInvoice): number {
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return lineTaxSum(invoice);
}

export function flowTotalsRows(invoice: FlowTotalsInvoice): FlowTotalsRow[] {
  return [
    { key: 'subtotal', label: 'Sub Total', amount: num(invoice.subtotal) },
    { key: 'discount', label: 'Discount', amount: num(invoice.discount ?? invoice.discount_amount) },
    { key: 'tax', label: 'Tax', amount: flowTaxAmount(invoice) },
    { key: 'rounding', label: 'Rounding', amount: num(invoice.rounding) },
    { key: 'total', label: 'Total', amount: num(invoice.total_amount) },
  ];
}

/** Printed arithmetic for engine=flow: Sub Total + Tax − Discount + Rounding. */
export function flowPrintedTotal(invoice: FlowTotalsInvoice): number {
  return (
    num(invoice.subtotal) +
    flowTaxAmount(invoice) -
    num(invoice.discount ?? invoice.discount_amount) +
    num(invoice.rounding)
  );
}

export function flowTotalsAddUp(invoice: FlowTotalsInvoice): boolean {
  if (invoice.total_amount == null || invoice.total_amount === '') return false;
  const printed = flowPrintedTotal(invoice);
  const total = num(invoice.total_amount);
  return Math.abs(cents(printed) - cents(total)) <= 1;
}

/**
 * Assertions: header tax_amount == sum(line tax_amount); totals equation;
 * Tax uses header OR lines exclusively (never both / never tax_total).
 */
export function assertFlowTaxIntegrity(invoice: FlowTotalsInvoice): {
  ok: boolean;
  violations: FlowTaxViolation[];
  tax: number;
  lineTaxSum: number;
  headerTax: number | null;
} {
  const violations: FlowTaxViolation[] = [];
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

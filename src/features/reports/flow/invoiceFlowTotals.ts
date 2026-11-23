/**
 * Flow totals rows from the invoice record.
 * Tax uses header/line tax_amount only — never tax_total.
 */
export type FlowTotalsInvoice = {
  subtotal?: number | string | null;
  tax_amount?: number | string | null;
  discount?: number | string | null;
  rounding?: number | string | null;
  total_amount?: number | string | null;
  lines?: Array<{ tax_amount?: number | string | null; line_total?: number | string | null }> | null;
};

export type FlowTotalsRow = {
  key: 'subtotal' | 'discount' | 'tax' | 'rounding' | 'total';
  label: string;
  amount: number;
};

function num(value: unknown): number {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Header tax_amount when set; otherwise sum of line tax_amount. Never tax_total. */
export function flowTaxAmount(invoice: FlowTotalsInvoice): number {
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return (invoice.lines || []).reduce((sum, line) => sum + num(line.tax_amount), 0);
}

export function flowTotalsRows(invoice: FlowTotalsInvoice): FlowTotalsRow[] {
  return [
    { key: 'subtotal', label: 'Sub Total', amount: num(invoice.subtotal) },
    { key: 'discount', label: 'Discount', amount: num(invoice.discount) },
    { key: 'tax', label: 'Tax', amount: flowTaxAmount(invoice) },
    { key: 'rounding', label: 'Rounding', amount: num(invoice.rounding) },
    { key: 'total', label: 'Total', amount: num(invoice.total_amount) },
  ];
}

/** Printed arithmetic for engine=flow: Sub Total + Tax − Discount + Rounding. */
export function flowPrintedTotal(invoice: FlowTotalsInvoice): number {
  return num(invoice.subtotal) + flowTaxAmount(invoice) - num(invoice.discount) + num(invoice.rounding);
}

export function flowTotalsAddUp(invoice: FlowTotalsInvoice): boolean {
  if (invoice.total_amount == null || invoice.total_amount === '') return false;
  const printed = flowPrintedTotal(invoice);
  const total = num(invoice.total_amount);
  return Math.abs(Math.round(printed * 100) - Math.round(total * 100)) <= 1;
}

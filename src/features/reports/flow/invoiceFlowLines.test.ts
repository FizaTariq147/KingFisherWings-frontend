import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { flowTaxAmount, flowTotalsRows } from './invoiceFlowTotals';

/**
 * Mirrors tools/reports/invoice-flow-doc.mjs linePreTaxAmount for the catalogue test.
 * Kept local so the TS suite does not import the Node pdfmake builder.
 */
function linePreTaxAmount(line: {
  quantity?: number | null;
  unit_price?: number | null;
  tax_amount?: number | null;
  line_total?: number | null;
}): number {
  const qty = Number(line.quantity);
  const rate = Number(line.unit_price);
  if (
    Number.isFinite(qty) &&
    Number.isFinite(rate) &&
    line.quantity != null &&
    line.unit_price != null &&
    line.quantity !== ('' as unknown as number)
  ) {
    return Math.round(qty * rate * 100) / 100;
  }
  const total = Number(line.line_total);
  const tax = Number(line.tax_amount || 0);
  if (Number.isFinite(total)) return Math.round((total - (Number.isFinite(tax) ? tax : 0)) * 100) / 100;
  return 0;
}

describe('flow charge lines show pre-tax + tax + total', () => {
  it('INV/26/00094: Sub Total (pre-tax sum) + Tax equals Total', () => {
    const live = JSON.parse(
      readFileSync(join(process.cwd(), 'reports/output/invoice-v2/batch-live.json'), 'utf8'),
    );
    const row = live.invoices.find(
      (item: { invoice?: { invoice_number?: string } }) => item.invoice?.invoice_number === 'INV/26/00094',
    );
    expect(row).toBeTruthy();
    const invoice = row.invoice;
    const lines = invoice.lines || [];
    const pretaxSum = lines.reduce(
      (sum: number, line: { quantity?: number; unit_price?: number; tax_amount?: number; line_total?: number }) =>
        sum + linePreTaxAmount(line),
      0,
    );
    const taxSum = lines.reduce(
      (sum: number, line: { tax_amount?: number }) => sum + Number(line.tax_amount || 0),
      0,
    );
    const lineTotalSum = lines.reduce(
      (sum: number, line: { line_total?: number }) => sum + Number(line.line_total || 0),
      0,
    );

    expect(pretaxSum).toBeCloseTo(Number(invoice.subtotal), 2);
    expect(taxSum).toBeCloseTo(flowTaxAmount(invoice), 2);
    expect(pretaxSum + taxSum).toBeCloseTo(Number(invoice.total_amount), 2);
    expect(lineTotalSum).toBeCloseTo(Number(invoice.total_amount), 2);

    const rows = flowTotalsRows(invoice);
    expect(rows.find((r) => r.key === 'subtotal')?.amount).toBeCloseTo(pretaxSum, 2);
    expect(rows.find((r) => r.key === 'tax')?.amount).toBeCloseTo(taxSum, 2);
    expect(rows.find((r) => r.key === 'total')?.amount).toBeCloseTo(pretaxSum + taxSum, 2);

    // Per-line visibility: each taxed line has distinct pre-tax, tax, and total.
    for (const line of lines) {
      const pretax = linePreTaxAmount(line);
      const tax = Number(line.tax_amount || 0);
      expect(pretax + tax).toBeCloseTo(Number(line.line_total), 2);
      expect(pretax).toBeGreaterThan(0);
    }
  });
});

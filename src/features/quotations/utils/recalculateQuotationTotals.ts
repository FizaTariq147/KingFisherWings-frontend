import type { QuotationLine } from '../types/quotation.types';

export interface QuotationTotals {
  revenueSubtotal: number;
  costSubtotal: number;
  taxTotal: number;
  discountAmount: number;
  totalAmount: number;
  gpAmount: number;
  gpPercent: number;
}

function lineAmount(line: QuotationLine): number {
  if (typeof line.line_total === 'number' && Number.isFinite(line.line_total)) {
    return line.line_total;
  }
  const qty = line.quantity ?? 1;
  const price = line.unit_price ?? 0;
  const fx = line.exchange_rate ?? 1;
  return qty * price * fx;
}

function lineTax(line: QuotationLine): number {
  if (typeof line.tax_amount === 'number' && Number.isFinite(line.tax_amount)) {
    return line.tax_amount;
  }
  const pct = line.tax_percent ?? 0;
  return lineAmount(line) * (pct / 100);
}

/** Client-side totals for display; server totals win after refetch. */
export function recalculateQuotationTotals(
  lines: QuotationLine[],
  opts?: { discount_percent?: number; discount_amount?: number },
): QuotationTotals {
  let revenueSubtotal = 0;
  let costSubtotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const amount = lineAmount(line);
    const tax = lineTax(line);
    if (line.is_cost) costSubtotal += amount;
    else {
      revenueSubtotal += amount;
      taxTotal += tax;
    }
  }

  const fromPercent =
    opts?.discount_percent != null && opts.discount_percent > 0
      ? (revenueSubtotal * opts.discount_percent) / 100
      : 0;
  const discountAmount = Math.max(opts?.discount_amount ?? 0, fromPercent);
  const totalAmount = Math.max(0, revenueSubtotal + taxTotal - discountAmount);
  const gpAmount = revenueSubtotal - costSubtotal;
  const gpPercent = revenueSubtotal > 0 ? (gpAmount / revenueSubtotal) * 100 : 0;

  return {
    revenueSubtotal,
    costSubtotal,
    taxTotal,
    discountAmount,
    totalAmount,
    gpAmount,
    gpPercent,
  };
}

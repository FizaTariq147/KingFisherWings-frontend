import type { QuotationTotals } from '../../utils/recalculateQuotationTotals';

interface QuotationTotalsSummaryProps {
  currencyCode: string;
  totals: QuotationTotals;
  serverTotal?: number;
  /** When false, show awaiting-pricing instead of a misleading 0/seeded total. */
  hasChargeLines?: boolean;
}

export function QuotationTotalsSummary({
  currencyCode,
  totals,
  serverTotal,
  hasChargeLines = true,
}: QuotationTotalsSummaryProps) {
  const unpriced = !hasChargeLines && (totals.totalAmount === 0 || totals.revenueSubtotal === 0);

  const rows = [
    { label: 'Revenue subtotal', value: totals.revenueSubtotal },
    { label: 'Cost subtotal', value: totals.costSubtotal },
    { label: 'Tax', value: totals.taxTotal },
    { label: 'Discount', value: totals.discountAmount },
    { label: 'Total', value: totals.totalAmount, strong: true },
    { label: 'GP', value: totals.gpAmount },
  ];

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 space-y-2">
      <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Totals</h3>
      {unpriced ? (
        <p className="text-sm text-[var(--color-neutral-600)]">
          Not priced yet — add charge lines for this job type (or wait for catalog services the
          customer selected).
        </p>
      ) : null}
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex justify-between text-sm ${
            row.strong ? 'font-semibold text-[var(--color-neutral-900)]' : 'text-[var(--color-neutral-600)]'
          }`}
        >
          <span>{row.label}</span>
          <span className="font-mono">
            {currencyCode}{' '}
            {row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
      {serverTotal != null && Math.abs(serverTotal - totals.totalAmount) > 0.01 && (
        <p className="text-[11px] text-[var(--color-neutral-400)] pt-1">
          Server total: {currencyCode} {serverTotal.toLocaleString()}
        </p>
      )}
      <p className="text-[11px] text-[var(--color-neutral-400)]">
        GP {totals.gpPercent.toFixed(1)}%
      </p>
    </div>
  );
}

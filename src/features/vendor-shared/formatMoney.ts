export function formatVendorMoney(amount?: number, currency?: string): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
}

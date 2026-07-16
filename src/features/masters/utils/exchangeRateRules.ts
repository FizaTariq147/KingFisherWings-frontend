/** Shared exchange-rate business rules for masters forms. */

export const EXCHANGE_RATE_SAME_CURRENCY =
  'Currency and base currency must be different';

export const EXCHANGE_RATE_POSITIVE = 'Rate must be greater than zero';

export function currenciesAreSame(
  currencyCode: string | undefined | null,
  baseCurrency: string | undefined | null,
): boolean {
  const a = String(currencyCode ?? '')
    .trim()
    .toUpperCase();
  const b = String(baseCurrency ?? '')
    .trim()
    .toUpperCase();
  return Boolean(a && b && a === b);
}

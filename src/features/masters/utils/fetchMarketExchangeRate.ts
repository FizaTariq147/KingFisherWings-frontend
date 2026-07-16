/**
 * Fetch live FX from trusted public sources (ECB via Frankfurter, then open.er-api).
 * Rate = units of `to` per 1 unit of `from` (matches CreateExchangeRateDto usage).
 */

export interface MarketExchangeRateResult {
  rate: number;
  source: string;
  date?: string;
}

function isPositiveRate(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

async function fetchFrankfurter(
  from: string,
  to: string,
): Promise<MarketExchangeRateResult | null> {
  try {
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      rates?: Record<string, number>;
      date?: string;
    };
    const rate = data.rates?.[to];
    if (!isPositiveRate(rate)) return null;
    return { rate, source: 'frankfurter.app (ECB)', date: data.date };
  } catch {
    return null;
  }
}

async function fetchOpenErApi(
  from: string,
  to: string,
): Promise<MarketExchangeRateResult | null> {
  try {
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result && data.result !== 'success') return null;
    const rate = data.rates?.[to];
    if (!isPositiveRate(rate)) return null;
    return {
      rate,
      source: 'open.er-api.com',
      date: data.time_last_update_utc?.slice(0, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Try Frankfurter (ECB) first, then open.er-api.com as fallback.
 * Both are free, no API key, commonly used for live mid-market rates.
 */
export async function fetchMarketExchangeRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<MarketExchangeRateResult> {
  const from = String(fromCurrency ?? '')
    .trim()
    .toUpperCase();
  const to = String(toCurrency ?? '')
    .trim()
    .toUpperCase();

  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
    throw new Error('Currencies must be ISO 4217 codes (e.g. USD, AED).');
  }
  if (from === to) {
    throw new Error('Currency and base currency must be different.');
  }

  const primary = await fetchFrankfurter(from, to);
  if (primary) return primary;

  const fallback = await fetchOpenErApi(from, to);
  if (fallback) return fallback;

  throw new Error(
    `Could not fetch a live rate for ${from} → ${to}. Try again or enter the rate manually.`,
  );
}

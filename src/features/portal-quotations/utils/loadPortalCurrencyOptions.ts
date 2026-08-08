import axios from 'axios';
import { LOCALE_API } from '@/features/locale/api/locale.api';
import { normalizeLocaleSettings } from '@/features/locale/utils/normalizeLocale';

function publicApiBase(): string {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/backend'
  );
}

/**
 * Resolve a country's base currency via public GET /locale/{countryCode}.
 * Uses an unauthenticated client — portal JWTs cannot call staff `/masters/*`.
 */
export async function fetchLocaleCurrencyForCountry(
  countryCode: string,
): Promise<string | null> {
  const cc = String(countryCode ?? '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return null;

  const res = await axios.get<unknown>(`${publicApiBase()}${LOCALE_API.profile(cc)}`, {
    timeout: 60_000,
    withCredentials: false,
  });

  const currency = normalizeLocaleSettings(res.data).baseCurrency;
  return currency && /^[A-Z]{3}$/.test(currency) ? currency : null;
}

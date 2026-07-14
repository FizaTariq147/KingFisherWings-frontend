import { getCountry } from '@/lib/countries';
import { LOCALE_PATCHES } from './catalog';
import type { LocaleCatalog } from './types';

const FALLBACK: Omit<LocaleCatalog, 'iso2' | 'dial' | 'dialCode'> = {
  defaultCurrency: 'USD',
  timezones: ['UTC'],
  defaultTimezone: 'UTC',
  language: 'en',
  taxIdLabel: 'Tax ID',
  postalLabel: 'Postal code',
};

/** True when an ISO country code is set (locale catalog applies). */
export function hasLocaleCountry(countryCode?: string | null): boolean {
  return Boolean(
    String(countryCode ?? '')
      .trim()
      .toUpperCase(),
  );
}

/**
 * Resolve dial, default currency, timezones, and tax/postal patterns for a country.
 * Returns `null` when country is unset — callers must not force AE/defaults.
 */
export function resolveLocaleCatalog(countryCode?: string | null): LocaleCatalog | null {
  const iso2 = String(countryCode ?? '')
    .trim()
    .toUpperCase();
  if (!iso2) return null;

  const country = getCountry(iso2);
  if (!country) return null;

  const patch = LOCALE_PATCHES[iso2] ?? {};

  const timezones =
    patch.timezones && patch.timezones.length > 0 ? patch.timezones : FALLBACK.timezones;
  const defaultTimezone =
    patch.defaultTimezone && timezones.includes(patch.defaultTimezone)
      ? patch.defaultTimezone
      : timezones[0]!;

  return {
    iso2: country.iso2,
    dial: country.dial,
    dialCode: `+${country.dial}`,
    defaultCurrency: patch.defaultCurrency ?? FALLBACK.defaultCurrency,
    timezones,
    defaultTimezone,
    language: patch.language ?? FALLBACK.language,
    taxIdLabel: patch.taxIdLabel ?? FALLBACK.taxIdLabel,
    taxIdPattern: patch.taxIdPattern,
    taxIdExample: patch.taxIdExample,
    postalLabel: patch.postalLabel ?? FALLBACK.postalLabel,
    postalPattern: patch.postalPattern,
    postalExample: patch.postalExample,
    postalPlaceholder: patch.postalPlaceholder ?? patch.postalExample,
  };
}

/** Timezone options for selects — country zones when set; otherwise unrestricted (empty = no filter). */
export function timezoneOptionsForCountry(countryCode?: string | null): string[] | null {
  const catalog = resolveLocaleCatalog(countryCode);
  return catalog ? catalog.timezones : null;
}

export function isTimezoneAllowedForCountry(
  timezone: string,
  countryCode?: string | null,
): boolean {
  const tz = String(timezone ?? '').trim();
  if (!tz) return false;
  if (!hasLocaleCountry(countryCode)) return true;
  const zones = timezoneOptionsForCountry(countryCode);
  if (!zones) return true;
  return zones.includes(tz) || tz === 'UTC';
}

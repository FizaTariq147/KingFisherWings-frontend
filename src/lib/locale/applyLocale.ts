import { resolveLocaleCatalog } from './resolveLocale';
import type { LocaleCatalog } from './types';

export interface LocaleApplyResult {
  catalog: LocaleCatalog;
  base_currency?: string;
  timezone?: string;
  language?: string;
}

export interface ApplyLocaleOptions {
  /** Current form values — used to decide whether to overwrite. */
  current?: {
    base_currency?: string | null;
    timezone?: string | null;
    language?: string | null;
  };
  /**
   * Previous country defaults (so we only overwrite when the user still has the
   * prior catalog suggestion, not a deliberate custom value).
   */
  previousCatalog?: LocaleCatalog | null;
  /** Always overwrite currency / timezone / language from the new catalog. */
  force?: boolean;
  applyCurrency?: boolean;
  applyTimezone?: boolean;
  applyLanguage?: boolean;
}

/**
 * Given a newly selected `country_code`, compute recommended locale fields.
 * Returns `null` when country is unset (currency/timezone keep their own values).
 */
export function applyLocaleFromCountry(
  countryCode: string,
  opts: ApplyLocaleOptions = {},
): LocaleApplyResult | null {
  const catalog = resolveLocaleCatalog(countryCode);
  if (!catalog) return null;

  const prev = opts.previousCatalog;
  const current = opts.current ?? {};
  const force = opts.force === true;

  const result: LocaleApplyResult = { catalog };

  if (opts.applyCurrency !== false) {
    const cur = String(current.base_currency ?? '').trim().toUpperCase();
    const wasDefault = !cur || (prev && cur === prev.defaultCurrency);
    if (force || wasDefault) {
      result.base_currency = catalog.defaultCurrency;
    }
  }

  if (opts.applyTimezone !== false) {
    const tz = String(current.timezone ?? '').trim();
    const allowed = catalog.timezones.includes(tz) || tz === 'UTC';
    const wasDefault = !tz || (prev && tz === prev.defaultTimezone);
    if (force || wasDefault || !allowed) {
      result.timezone = catalog.defaultTimezone;
    }
  }

  if (opts.applyLanguage === true) {
    const lang = String(current.language ?? '').trim();
    const wasDefault = !lang || (prev && lang === prev.language);
    if (force || wasDefault) {
      result.language = catalog.language;
    }
  }

  return result;
}

export function isValidTaxId(value: string, countryCode?: string | null): boolean {
  const v = String(value ?? '').trim();
  if (!v) return true;
  const country = String(countryCode ?? '')
    .trim()
    .toUpperCase();
  if (!country) return v.length <= 100;
  const { taxIdPattern } = resolveLocaleCatalog(country) ?? {};
  if (!taxIdPattern) return v.length <= 100;
  return taxIdPattern.test(v);
}

export function isValidPostalCode(value: string, countryCode?: string | null): boolean {
  const v = String(value ?? '').trim();
  if (!v) return true;
  const country = String(countryCode ?? '')
    .trim()
    .toUpperCase();
  if (!country) return v.length <= 20;
  const { postalPattern } = resolveLocaleCatalog(country) ?? {};
  if (!postalPattern) return v.length <= 20;
  return postalPattern.test(v);
}

export function taxIdErrorMessage(countryCode?: string | null): string {
  const cat = resolveLocaleCatalog(countryCode);
  if (!cat) return 'Enter a valid tax / VAT number';
  if (cat.taxIdExample) {
    return `Enter a valid ${cat.taxIdLabel} (e.g. ${cat.taxIdExample})`;
  }
  return `Enter a valid ${cat.taxIdLabel} for ${cat.iso2}`;
}

export function postalErrorMessage(countryCode?: string | null): string {
  const cat = resolveLocaleCatalog(countryCode);
  if (!cat) return 'Enter a valid postal code';
  if (cat.postalExample) {
    return `Enter a valid ${cat.postalLabel} (e.g. ${cat.postalExample})`;
  }
  return `Enter a valid ${cat.postalLabel} for ${cat.iso2}`;
}

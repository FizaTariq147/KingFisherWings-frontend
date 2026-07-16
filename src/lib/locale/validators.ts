import { z } from 'zod';
import {
  isValidPostalCode,
  isValidTaxId,
  postalErrorMessage,
  taxIdErrorMessage,
} from './applyLocale';
import { isTimezoneAllowedForCountry } from './resolveLocale';

/**
 * Object-level refine: tax ID + optional timezone against resolved locale catalog.
 */
export function withLocaleCatalogRefine<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  opts: {
    countryKey?: string;
    taxIdKey?: string;
    timezoneKey?: string;
    /** When true, timezone must be in the country's zone list. */
    restrictTimezone?: boolean;
  } = {},
) {
  const countryKey = opts.countryKey ?? 'country_code';
  const taxIdKey = opts.taxIdKey ?? 'vat_number';
  const timezoneKey = opts.timezoneKey ?? 'timezone';

  return schema.superRefine((data, ctx) => {
    const record = data as Record<string, unknown>;
    const country = String(record[countryKey] ?? '').trim().toUpperCase();
    if (!country) return;

    if (taxIdKey in record) {
      const tax = String(record[taxIdKey] ?? '').trim();
      if (tax && !isValidTaxId(tax, country)) {
        ctx.addIssue({
          code: 'custom',
          message: taxIdErrorMessage(country),
          path: [taxIdKey],
        });
      }
    }

    if (opts.restrictTimezone && timezoneKey in record) {
      const tz = String(record[timezoneKey] ?? '').trim();
      if (tz && !isTimezoneAllowedForCountry(tz, country)) {
        ctx.addIssue({
          code: 'custom',
          message: `Timezone must be one of the zones for ${country}`,
          path: [timezoneKey],
        });
      }
    }
  });
}

export function withPostalCountryRefine<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  opts: {
    countryKey?: string;
    postalKey?: string;
  } = {},
) {
  const countryKey = opts.countryKey ?? 'country_code';
  const postalKey = opts.postalKey ?? 'postal_code';

  return schema.superRefine((data, ctx) => {
    const record = data as Record<string, unknown>;
    const country = String(record[countryKey] ?? '').trim().toUpperCase();
    const postal = String(record[postalKey] ?? '').trim();
    if (!country || !postal) return;
    if (!isValidPostalCode(postal, country)) {
      ctx.addIssue({
        code: 'custom',
        message: postalErrorMessage(country),
        path: [postalKey],
      });
    }
  });
}

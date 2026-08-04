/** Raw API shape for GET /locale/defaults and GET /locale/{countryCode}. */
export interface LocaleApiResponse {
  country_code: string | null;
  dial_code: string | null;
  base_currency: string | null;
  timezone: string | null;
  timezones: string[];
  tax_id_label: string | null;
  has_postal_pattern: boolean;
  has_tax_pattern: boolean;
  country_required: boolean;
}

/** Normalized locale settings stored in Redux. */
export interface LocaleSettings {
  countryCode: string | null;
  dialCode: string | null;
  baseCurrency: string | null;
  timezone: string | null;
  timezones: string[];
  taxIdLabel: string | null;
  hasPostalPattern: boolean;
  hasTaxPattern: boolean;
  countryRequired: boolean;
}

/** Resolved formatting context derived from Redux locale state. */
export interface LocaleFormatContext {
  /** BCP 47 language tag for Intl formatters. */
  locale: string;
  currency: string;
  timezone: string;
  countryCode: string | null;
  dialCode: string | null;
}

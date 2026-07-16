/** Resolved locale defaults driven by `country_code` (mirrors backend locale catalog flow). */

export interface LocaleCatalog {
  iso2: string;
  /** Dial without leading +, e.g. `971`. */
  dial: string;
  /** Dial for display / E.164 prefix, e.g. `+971`. */
  dialCode: string;
  defaultCurrency: string;
  /** IANA zones allowed for this country once a profile exists. */
  timezones: string[];
  defaultTimezone: string;
  /** Suggested UI language (BCP 47 / app language codes). */
  language: string;
  /** Label for tax identifier field (VAT / GST / EIN / TRN…). */
  taxIdLabel: string;
  /** When set, non-empty tax IDs must match. */
  taxIdPattern?: RegExp;
  taxIdExample?: string;
  postalLabel: string;
  postalPattern?: RegExp;
  postalExample?: string;
  postalPlaceholder?: string;
}

/** Partial overrides keyed by ISO 3166-1 alpha-2. */
export interface LocaleCatalogPatch {
  defaultCurrency?: string;
  timezones?: string[];
  defaultTimezone?: string;
  language?: string;
  taxIdLabel?: string;
  taxIdPattern?: RegExp;
  taxIdExample?: string;
  postalLabel?: string;
  postalPattern?: RegExp;
  postalExample?: string;
  postalPlaceholder?: string;
}

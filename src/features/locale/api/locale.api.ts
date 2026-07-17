export const LOCALE_API = {
  /** LocaleController_getDefaults — optional ?country=ISO2 for form suggestions; omit for null defaults. */
  defaults: '/locale/defaults',
  /** LocaleController_getProfile — country-specific locale suggestions. */
  profile: (countryCode: string) => `/locale/${encodeURIComponent(countryCode)}`,
} as const;

const OPTIONAL_STRING_FIELDS = [
  'domain',
  'website',
  'logo_url',
  'vat_number',
  'cr_number',
  'company_legal_name',
  'company_registration_number',
] as const;

const DATE_FIELDS = ['trial_ends', 'subscription_ends'] as const;

/** Strip empty optionals and format date fields for the API. */
export function prepareTenantPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = { ...dto };

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (out[key] === '') delete out[key];
  }

  for (const key of DATE_FIELDS) {
    const value = out[key];
    if (value === '' || value == null) {
      delete out[key];
      continue;
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      out[key] = new Date(`${value}T00:00:00.000Z`).toISOString();
    }
  }

  return out as T;
}

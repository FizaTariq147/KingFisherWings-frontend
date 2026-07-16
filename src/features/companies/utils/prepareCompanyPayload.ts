const OPTIONAL_STRING_FIELDS = [
  'legal_name',
  'registration_number',
  'vat_number',
] as const;

export function prepareCompanyPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = { ...dto };

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (out[key] === '') delete out[key];
  }

  return out as T;
}

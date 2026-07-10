const FORM_ONLY_FIELDS = ['selected_company_id'] as const;

/** Only fields documented on CreateTenantDto / UpdateTenantDto. */
const ALLOWED_TENANT_FIELDS = new Set([
  'code',
  'name',
  'display_name',
  'slug',
  'password',
  'admin_first_name',
  'admin_last_name',
  'domain',
  'website',
  'logo_url',
  'primary_color',
  'language',
  'base_currency',
  'timezone',
  'country_code',
  'financial_year_start',
  'vat_number',
  'cr_number',
  'address',
  'city',
  'phone',
  'email',
  'company_code',
  'company_name',
  'company_legal_name',
  'company_registration_number',
  'subscription_plan',
  'status',
  'trial_ends',
  'subscription_ends',
  'max_users',
  'max_branches',
  'max_storage_gb',
  'is_active',
]);

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

const ENUM_FIELDS = ['subscription_plan', 'status'] as const;

/** Strip empty optionals, format dates, and uppercase enums for the API. */
export function prepareTenantPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dto as Record<string, unknown>)) {
    if (!ALLOWED_TENANT_FIELDS.has(key)) continue;
    out[key] = value;
  }

  if (typeof out.slug === 'string') {
    out.slug = out.slug.trim().toLowerCase();
  }
  if (typeof out.code === 'string') {
    out.code = out.code.trim().toUpperCase();
  }
  if (typeof out.company_code === 'string') {
    out.company_code = out.company_code.trim().toUpperCase();
  }
  if (typeof out.email === 'string') {
    out.email = out.email.trim().toLowerCase();
  }

  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value === '' || value === null || value === undefined) {
      delete out[key];
    }
    if (typeof value === 'number' && Number.isNaN(value)) {
      delete out[key];
    }
  }

  if ('password' in dto && (typeof out.password !== 'string' || !out.password)) {
    throw new Error('Tenant password is required before create.');
  }

  for (const key of FORM_ONLY_FIELDS) {
    delete out[key];
  }

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (out[key] === '') delete out[key];
  }

  for (const key of ENUM_FIELDS) {
    if (typeof out[key] === 'string') {
      out[key] = (out[key] as string).toUpperCase();
    }
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

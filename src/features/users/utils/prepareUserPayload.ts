import { isUuid } from '@/lib/isUuid';

/** Fields accepted by CreateUserDto / UpdateUserDto (Swagger). */
const ALLOWED_USER_FIELDS = new Set([
  'tenant_id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'avatar_url',
  'company_id',
  'branch_id',
  'department_id',
  'role',
  'status',
  'is_salesperson',
  'is_cs_rep',
  'is_operations',
  'is_finance',
  'can_see_sales',
  'can_see_cost',
  'can_see_gp',
  'can_see_invoices',
  'can_see_payments',
  'can_see_bank_balances',
  'can_see_ar_ap',
  'can_see_mgmt_reports',
  'can_see_job_pnl',
  'allowed_ips',
  'allowed_mac_addresses',
  'office_hours_start',
  'office_hours_end',
  'office_hours_timezone',
  'two_factor_enabled',
  'max_concurrent_sessions',
  'role_ids',
  'permission_ids',
  'single_device_login',
  'single_device_policy',
]);

const OPTIONAL_UUID_FIELDS = ['company_id', 'branch_id', 'department_id', 'tenant_id'] as const;
const OPTIONAL_UUID_ARRAY_FIELDS = ['role_ids', 'permission_ids'] as const;
const OPTIONAL_STRING_FIELDS = [
  'phone',
  'avatar_url',
  'office_hours_start',
  'office_hours_end',
  'office_hours_timezone',
] as const;

/** Strip empty / invalid optional values before sending to the API. */
export function prepareUserPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dto as Record<string, unknown>)) {
    if (!ALLOWED_USER_FIELDS.has(key)) continue;
    out[key] = value;
  }

  if (typeof out.email === 'string') {
    out.email = out.email.trim().toLowerCase();
  }
  if (typeof out.role === 'string') {
    out.role = out.role.trim().toUpperCase();
  }
  if (typeof out.status === 'string') {
    out.status = out.status.trim().toUpperCase();
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

  for (const key of OPTIONAL_UUID_FIELDS) {
    const value = out[key];
    if (typeof value !== 'string' || !isUuid(value.trim())) {
      delete out[key];
    } else {
      out[key] = value.trim();
    }
  }

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (out[key] === '') delete out[key];
  }

  for (const key of OPTIONAL_UUID_ARRAY_FIELDS) {
    const value = out[key];
    if (!Array.isArray(value)) {
      delete out[key];
      continue;
    }
    const valid = value.filter((id): id is string => typeof id === 'string' && isUuid(id.trim()));
    if (valid.length === 0) delete out[key];
    else out[key] = valid;
  }

  if (Array.isArray(out.allowed_ips) && out.allowed_ips.length === 0) {
    delete out.allowed_ips;
  }

  if (Array.isArray(out.allowed_mac_addresses) && out.allowed_mac_addresses.length === 0) {
    delete out.allowed_mac_addresses;
  }

  // Staff users must be ACTIVE to sign in via /auth/login.
  if (!out.status) out.status = 'ACTIVE';

  return out as T;
}

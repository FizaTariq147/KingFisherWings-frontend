import { isUuid } from '@/lib/isUuid';

const OPTIONAL_UUID_FIELDS = ['company_id', 'branch_id', 'department_id'] as const;
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
  const out: Record<string, unknown> = { ...dto };

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

  return out as T;
}

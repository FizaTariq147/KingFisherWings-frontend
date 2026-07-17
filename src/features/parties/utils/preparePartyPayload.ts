import { isUuid } from '@/lib/isUuid';

const ALLOWED_PARTY_FIELDS = new Set([
  'company_id',
  'party_type',
  'code',
  'name',
  'short_name',
  'vat_number',
  'cr_number',
  'country_code',
  'city',
  'address',
  'phone',
  'email',
  'credit_limit',
  'credit_days',
  'currency_code',
  'salesperson_id',
  'portal_access',
  'marketing_subscription',
  'iata_code',
  'scac_code',
  'tags',
  'notes',
  'is_active',
]);

const UUID_FIELDS = new Set(['company_id', 'salesperson_id']);

/** Strip empties / invalid UUIDs before POST/PATCH party bodies. */
export function preparePartyPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED_PARTY_FIELDS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;
    if (Array.isArray(value) && value.length === 0) continue;

    if (UUID_FIELDS.has(key)) {
      const id = String(value).trim();
      if (!isUuid(id)) continue;
      out[key] = id;
      continue;
    }

    if (key === 'party_type' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase();
      continue;
    }
    if (key === 'country_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 2);
      continue;
    }
    if (key === 'currency_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 3);
      continue;
    }
    if (key === 'email' && typeof value === 'string') {
      out[key] = value.trim().toLowerCase();
      continue;
    }
    if (key === 'tags' && Array.isArray(value)) {
      const tags: string[] = [];
      for (const t of value) {
        const trimmed = String(t).trim();
        if (trimmed) tags.push(trimmed);
      }
      out[key] = tags;
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value.trim();
      continue;
    }

    out[key] = value;
  }

  return out as T;
}

export function prepareContactPayload<T extends Record<string, unknown>>(dto: T): T {
  const allowed = new Set([
    'name',
    'designation',
    'phone',
    'mobile',
    'email',
    'is_primary',
  ]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (key === 'email' && typeof value === 'string') {
      out[key] = value.trim().toLowerCase();
      continue;
    }
    out[key] = typeof value === 'string' ? value.trim() : value;
  }
  return out as T;
}

export function prepareAddressPayload<T extends Record<string, unknown>>(dto: T): T {
  const allowed = new Set([
    'label',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country_code',
    'is_default',
  ]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (key === 'country_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 2);
      continue;
    }
    out[key] = typeof value === 'string' ? value.trim() : value;
  }
  return out as T;
}

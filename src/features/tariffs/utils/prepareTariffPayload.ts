import { isUuid } from '@/lib/isUuid';
import { TARIFF_SERVICE_TYPES } from '../constants/tariff.constants';

const ALLOWED = new Set([
  'service_type',
  'origin_port_id',
  'dest_port_id',
  'container_type_id',
  'charge_code_id',
  'customer_id',
  'unit',
  'sale_rate',
  'cost_rate',
  'currency_code',
  'valid_from',
  'valid_to',
  'is_active',
]);

const UUID_FIELDS = new Set([
  'origin_port_id',
  'dest_port_id',
  'container_type_id',
  'charge_code_id',
  'customer_id',
]);

export const OPTIONAL_TARIFF_UUID_FIELDS = [
  'origin_port_id',
  'dest_port_id',
  'container_type_id',
  'customer_id',
] as const;

export function prepareTariffPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;

    if (UUID_FIELDS.has(key)) {
      const id = String(value).trim();
      if (!isUuid(id)) continue;
      out[key] = id;
      continue;
    }

    if (key === 'service_type' && typeof value === 'string') {
      const s = value.trim().toUpperCase();
      if ((TARIFF_SERVICE_TYPES as readonly string[]).includes(s)) out[key] = s;
      continue;
    }
    if (key === 'currency_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 3);
      continue;
    }
    if ((key === 'valid_from' || key === 'valid_to') && typeof value === 'string') {
      out[key] = value.trim().slice(0, 10);
      continue;
    }
    if (key === 'sale_rate' || key === 'cost_rate') {
      const n = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(n) || n < 0) continue;
      out[key] = n;
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

/** Required fields only — used as a safe retry when optional FKs crash the backend. */
export function prepareMinimalTariffPayload<T extends Record<string, unknown>>(dto: T): T {
  const full = prepareTariffPayload(dto) as Record<string, unknown>;
  for (const key of OPTIONAL_TARIFF_UUID_FIELDS) {
    delete full[key];
  }
  return full as T;
}

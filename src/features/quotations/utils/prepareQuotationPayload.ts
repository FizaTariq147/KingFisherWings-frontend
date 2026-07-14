import { isUuid } from '@/lib/isUuid';

const ALLOWED_HEADER_FIELDS = new Set([
  'company_id',
  'job_type',
  'customer_id',
  'salesperson_id',
  'branch_id',
  'department_id',
  'carrier_id',
  'origin_port_id',
  'dest_port_id',
  'incoterm',
  'commodity',
  'hs_code',
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'pieces',
  'container_count',
  'container_type_id',
  'is_dg',
  'dg_class',
  'special_requirements',
  'carrier_preference',
  'routing_notes',
  'remarks',
  'internal_notes',
  'transit_time_days',
  'valid_until',
  'currency_code',
  'exchange_rate',
  'discount_percent',
  'discount_amount',
]);

const UUID_FIELDS = new Set([
  'company_id',
  'customer_id',
  'salesperson_id',
  'branch_id',
  'department_id',
  'carrier_id',
  'origin_port_id',
  'dest_port_id',
  'container_type_id',
  'charge_code_id',
  'tax_rate_id',
  'supplier_id',
]);

const ALLOWED_LINE_FIELDS = new Set([
  'charge_code_id',
  'description',
  'unit',
  'quantity',
  'unit_price',
  'currency_code',
  'exchange_rate',
  'tax_rate_id',
  'is_cost',
  'supplier_id',
  'sort_order',
]);

function preparePayload(
  dto: Record<string, unknown>,
  allowed: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;

    if (UUID_FIELDS.has(key)) {
      const id = String(value).trim();
      if (!isUuid(id)) continue;
      out[key] = id;
      continue;
    }

    if (key === 'currency_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 3);
      continue;
    }
    if (key === 'job_type' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase();
      continue;
    }
    if (key === 'incoterm' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase();
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value.trim();
      continue;
    }

    out[key] = value;
  }

  return out;
}

export function prepareQuotationPayload<T extends Record<string, unknown>>(dto: T): T {
  return preparePayload(dto, ALLOWED_HEADER_FIELDS) as T;
}

export function prepareQuotationLinePayload<T extends Record<string, unknown>>(dto: T): T {
  return preparePayload(dto, ALLOWED_LINE_FIELDS) as T;
}

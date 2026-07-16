import type { CreateTariffFormValues } from '../types/tariff.types';

/**
 * Build a CreateTariffDto matching Swagger examples, using live master/party UUIDs.
 * Never uses Swagger’s fake placeholder UUID (3fa85f64-…).
 */
export function buildTariffDemoValues(refs: {
  chargeCodeId: string;
  originPortId?: string;
  destPortId?: string;
  containerTypeId?: string;
  customerId?: string;
  currencyCode?: string;
}): CreateTariffFormValues {
  return {
    service_type: 'AIR_EXPORT',
    origin_port_id: refs.originPortId || undefined,
    dest_port_id: refs.destPortId || undefined,
    container_type_id: refs.containerTypeId || undefined,
    charge_code_id: refs.chargeCodeId,
    customer_id: refs.customerId || undefined,
    unit: 'KG',
    sale_rate: 850,
    cost_rate: 620,
    currency_code: refs.currencyCode || 'AED',
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    is_active: true,
  };
}

/** Exact CreateTariffDto field set (Swagger). */
export const CREATE_TARIFF_DTO_FIELDS = [
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
] as const;

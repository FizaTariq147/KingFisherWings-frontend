import type { CreateTariffFormValues } from '../types/tariff.types';
import type { Tariff } from '../types/tariff.types';

/**
 * Create defaults leave required fields empty so Zod/RHF validation runs on submit.
 * Use Fill demo data for Swagger-shaped samples.
 */
export const TARIFF_FORM_DEFAULTS: Partial<CreateTariffFormValues> = {
  service_type: 'AIR_EXPORT',
  origin_port_id: undefined,
  dest_port_id: undefined,
  container_type_id: undefined,
  charge_code_id: '',
  customer_id: undefined,
  unit: undefined,
  sale_rate: undefined,
  cost_rate: undefined,
  currency_code: '',
  valid_from: '',
  valid_to: undefined,
  is_active: true,
};

export function tariffToFormValues(t: Tariff): CreateTariffFormValues {
  return {
    service_type: t.service_type,
    origin_port_id: t.origin_port_id || undefined,
    dest_port_id: t.dest_port_id || undefined,
    container_type_id: t.container_type_id || undefined,
    charge_code_id: t.charge_code_id,
    customer_id: t.customer_id || undefined,
    unit: t.unit || undefined,
    sale_rate: t.sale_rate,
    cost_rate: t.cost_rate,
    currency_code: t.currency_code,
    valid_from: t.valid_from,
    valid_to: t.valid_to || undefined,
    is_active: t.is_active !== false,
  };
}

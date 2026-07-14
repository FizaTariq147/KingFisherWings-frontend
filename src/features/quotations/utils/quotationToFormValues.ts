import type { CreateQuotationFormValues } from '../types/quotation.types';
import type { Quotation } from '../types/quotation.types';

export function quotationToFormValues(q: Quotation): CreateQuotationFormValues {
  return {
    company_id: q.company_id || undefined,
    job_type: q.job_type,
    customer_id: q.customer_id,
    salesperson_id: q.salesperson_id || undefined,
    branch_id: q.branch_id || undefined,
    department_id: q.department_id || undefined,
    carrier_id: q.carrier_id || undefined,
    origin_port_id: q.origin_port_id || undefined,
    dest_port_id: q.dest_port_id || undefined,
    incoterm: (q.incoterm as CreateQuotationFormValues['incoterm']) || undefined,
    commodity: q.commodity || undefined,
    hs_code: q.hs_code || undefined,
    gross_weight: q.gross_weight,
    chargeable_weight: q.chargeable_weight,
    volume_cbm: q.volume_cbm,
    pieces: q.pieces,
    container_count: q.container_count,
    container_type_id: q.container_type_id || undefined,
    is_dg: q.is_dg ?? false,
    dg_class: q.dg_class || undefined,
    special_requirements: q.special_requirements || undefined,
    carrier_preference: q.carrier_preference || undefined,
    routing_notes: q.routing_notes || undefined,
    remarks: q.remarks || undefined,
    internal_notes: q.internal_notes || undefined,
    transit_time_days: q.transit_time_days,
    valid_until: q.valid_until || undefined,
    currency_code: q.currency_code || 'AED',
    exchange_rate: q.exchange_rate ?? 1,
    discount_percent: q.discount_percent,
    discount_amount: q.discount_amount,
  };
}

export const QUOTATION_FORM_DEFAULTS: CreateQuotationFormValues = {
  job_type: 'SEA_FCL_EXPORT',
  customer_id: '',
  currency_code: 'AED',
  exchange_rate: 1,
  is_dg: false,
  discount_percent: 0,
  discount_amount: 0,
};

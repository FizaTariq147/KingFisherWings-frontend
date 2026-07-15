import type { CreateQuotationFormValues } from '../types/quotation.types';

/** Build realistic FCL export demo values using live master/party ids from the form. */
export function buildQuotationDemoValues(refs: {
  customerId: string;
  companyId?: string;
  originPortId?: string;
  destPortId?: string;
  currencyCode?: string;
}): CreateQuotationFormValues {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  const valid_until = validUntil.toISOString().slice(0, 10);

  return {
    company_id: refs.companyId || undefined,
    job_type: 'SEA_FCL_EXPORT',
    customer_id: refs.customerId,
    origin_port_id: refs.originPortId || undefined,
    dest_port_id: refs.destPortId || undefined,
    incoterm: 'FOB',
    commodity: 'General merchandise — cartons',
    hs_code: '8471.30',
    gross_weight: 12500,
    chargeable_weight: 12500,
    volume_cbm: 28.5,
    pieces: 240,
    container_count: 1,
    is_dg: false,
    transit_time_days: 18,
    valid_until,
    currency_code: refs.currencyCode || 'AED',
    exchange_rate: 1,
    discount_percent: 0,
    discount_amount: 0,
    special_requirements: 'Customs dual clearance required at destination.',
    carrier_preference: 'Preferred carrier: MSC / Hapag',
    routing_notes: 'Jebel Ali → Rotterdam via direct service when available.',
    remarks: 'Rate validity 14 days. Subject to space and equipment.',
    internal_notes: 'Demo quotation seeded for FE validation — replace FKs with live masters.',
  };
}

export const DEMO_QUOTATION_LINE = {
  description: 'Ocean freight — 40HC FCL AEJEA to NLRTM',
  unit: 'CNT',
  quantity: 1,
  unit_price: 1850,
  currency_code: 'AED',
  exchange_rate: 1,
  is_cost: false,
  sort_order: 0,
} as const;

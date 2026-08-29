import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  hsCode,
  integerField,
  optionalTextUndef,
  optionalUuid,
  requiredText,
  requiredUuid,
} from '@/lib/validation';
import {
  NVOCC_CARGO_TYPES,
  NVOCC_COMMODITY_TYPES,
  NVOCC_TARIFF_STATUSES,
} from '../constants/nvocc.constants';
import type { CreateNvoccTariffDto } from '../types/nvocc.types';

const cargoType = z.enum(NVOCC_CARGO_TYPES, { error: 'Select FCL or LCL' });
const commodityType = z.enum(NVOCC_COMMODITY_TYPES, { error: 'Select a commodity type' });
const tariffStatus = z.enum(NVOCC_TARIFF_STATUSES, { error: 'Select tariff status' });

const isoDate = z.preprocess(
  emptyToUndefined,
  z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)'),
);

const optionalIsoDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)')
    .optional(),
);

const mblNumber = z.preprocess(
  emptyToUndefined,
  z.string().max(50, 'MBL number must be at most 50 characters').optional(),
);

export const createNvoccTariffFormSchema = z
  .object({
    trade_lane: requiredText({ min: 3, max: 200 }),
    pol_region: optionalTextUndef({ max: 100 }),
    pod_region: optionalTextUndef({ max: 100 }),
    origin_port_id: optionalUuid(),
    dest_port_id: optionalUuid(),
    commodity_type: z.preprocess(emptyToUndefined, commodityType.optional()),
    fcl_rate: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    lcl_rate_cbm: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    lcl_minimum_charge: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    origin_thc: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    dest_thc: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    bl_fee: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    rate_valid_from: isoDate,
    rate_valid_to: optionalIsoDate,
    currency_code: currencyCode(true),
    status: z.preprocess(emptyToUndefined, tariffStatus.optional()),
  })
  .superRefine((data, ctx) => {
    if (data.rate_valid_to && data.rate_valid_from && data.rate_valid_to < data.rate_valid_from) {
      ctx.addIssue({
        code: 'custom',
        message: 'Valid to must be on or after valid from',
        path: ['rate_valid_to'],
      });
    }
  });

export const createNvoccVoyageFormSchema = z
  .object({
    vessel_id: optionalUuid(),
    shipping_line_id: optionalUuid(),
    pol_id: optionalUuid(),
    pod_id: optionalUuid(),
    etd: optionalIsoDate,
    eta: optionalIsoDate,
    si_cutoff: optionalIsoDate,
    vgm_cutoff: optionalIsoDate,
    cy_cutoff: optionalIsoDate,
    cargo_cutoff: optionalIsoDate,
    slot_allocation_containers: integerField({ min: 0, max: 10_000 }),
    lcl_capacity_cbm: amountField({ min: 0, max: 999_999, maxDecimals: 2 }),
    mbl_number: mblNumber,
    nvocc_freight_rate: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    carrier_cost: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    remarks: optionalTextUndef({ max: 500 }),
  })
  .superRefine((data, ctx) => {
    if (data.etd && data.eta && data.eta < data.etd) {
      ctx.addIssue({
        code: 'custom',
        message: 'ETA must be on or after ETD',
        path: ['eta'],
      });
    }
    if (data.etd && data.si_cutoff && data.si_cutoff > data.etd) {
      ctx.addIssue({
        code: 'custom',
        message: 'SI cutoff should be on or before ETD',
        path: ['si_cutoff'],
      });
    }
  });

export const createNvoccEnquiryFormSchema = z
  .object({
    customer_id: optionalUuid(),
    voyage_id: optionalUuid(),
    cargo_type: cargoType,
    container_count: integerField({ min: 1, max: 500 }),
    cbm: amountField({ min: 0, max: 999_999, maxDecimals: 3 }),
    gross_weight: amountField({ min: 0, max: 999_999_999, maxDecimals: 3 }),
    pieces: integerField({ min: 1, max: 999_999 }),
    commodity: optionalTextUndef({ max: 500 }),
    hs_code: hsCode(false),
    incoterms: optionalTextUndef({ max: 10 }),
    freight_terms: optionalTextUndef({ max: 30 }),
    rate_quoted: amountField({ min: 0, max: 9_999_999, maxDecimals: 2 }),
    rate_validity: optionalIsoDate,
    follow_up_date: optionalIsoDate,
  })
  .superRefine((data, ctx) => {
    if (data.cargo_type === 'FCL' && !data.container_count) {
      ctx.addIssue({
        code: 'custom',
        message: 'Container count is required for FCL',
        path: ['container_count'],
      });
    }
    if (data.cargo_type === 'LCL' && !data.cbm) {
      ctx.addIssue({
        code: 'custom',
        message: 'CBM is required for LCL',
        path: ['cbm'],
      });
    }
  });

export const createNvoccBookingFormSchema = z.object({
  voyage_id: requiredUuid('Enter a valid voyage UUID'),
  enquiry_id: optionalUuid(),
  shipper_id: optionalUuid(),
  consignee_id: optionalUuid(),
  cargo_type: cargoType,
  container_count: integerField({ min: 1, max: 500 }),
  cbm_allocated: amountField({ min: 0, max: 999_999, maxDecimals: 3 }),
  gross_weight: amountField({ min: 0, max: 999_999_999, maxDecimals: 3 }),
  pieces: integerField({ min: 1, max: 999_999 }),
  commodity: optionalTextUndef({ max: 500 }),
  hs_code: hsCode(false),
  shipper_ref: optionalTextUndef({ max: 100 }),
  incoterms: optionalTextUndef({ max: 10 }),
  freight_terms: optionalTextUndef({ max: 30 }),
  apply_tariff: z.boolean().optional(),
});

export const sendNvoccRateFormSchema = z.object({
  to_email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  cc_email: z.preprocess(emptyToUndefined, z.string().email('Enter a valid CC email').optional()),
  subject: optionalTextUndef({ max: 200 }),
  message: optionalTextUndef({ max: 2000 }),
});

export const markNvoccEnquiryLostFormSchema = z.object({
  loss_reason: requiredText({ min: 3, max: 100 }),
});

export type CreateNvoccTariffFormValues = z.infer<typeof createNvoccTariffFormSchema>;
export type CreateNvoccVoyageFormValues = z.infer<typeof createNvoccVoyageFormSchema>;
export type CreateNvoccEnquiryFormValues = z.infer<typeof createNvoccEnquiryFormSchema>;
export type CreateNvoccBookingFormValues = z.infer<typeof createNvoccBookingFormSchema>;

/** String-friendly form state (inputs bind to strings). */
export type NvoccTariffFormState = {
  trade_lane: string;
  pol_region: string;
  pod_region: string;
  origin_port_id: string;
  dest_port_id: string;
  commodity_type: string;
  fcl_rate: string;
  lcl_rate_cbm: string;
  lcl_minimum_charge: string;
  origin_thc: string;
  dest_thc: string;
  bl_fee: string;
  rate_valid_from: string;
  rate_valid_to: string;
  currency_code: string;
  status: string;
};

export type NvoccVoyageFormState = {
  vessel_id: string;
  shipping_line_id: string;
  pol_id: string;
  pod_id: string;
  etd: string;
  eta: string;
  si_cutoff: string;
  vgm_cutoff: string;
  cy_cutoff: string;
  cargo_cutoff: string;
  slot_allocation_containers: string;
  lcl_capacity_cbm: string;
  mbl_number: string;
  nvocc_freight_rate: string;
  carrier_cost: string;
  remarks: string;
};

export type NvoccEnquiryFormState = {
  customer_id: string;
  voyage_id: string;
  cargo_type: string;
  container_count: string;
  cbm: string;
  gross_weight: string;
  pieces: string;
  commodity: string;
  hs_code: string;
  incoterms: string;
  freight_terms: string;
  rate_quoted: string;
  rate_validity: string;
  follow_up_date: string;
};

export type NvoccBookingFormState = {
  voyage_id: string;
  enquiry_id: string;
  shipper_id: string;
  consignee_id: string;
  cargo_type: string;
  container_count: string;
  cbm_allocated: string;
  gross_weight: string;
  pieces: string;
  commodity: string;
  hs_code: string;
  shipper_ref: string;
  incoterms: string;
  freight_terms: string;
  apply_tariff: boolean;
};

export function toTariffPayload(values: CreateNvoccTariffFormValues): CreateNvoccTariffDto {
  return {
    trade_lane: values.trade_lane,
    rate_valid_from: values.rate_valid_from,
    currency_code: values.currency_code ?? 'USD',
    pol_region: values.pol_region,
    pod_region: values.pod_region,
    origin_port_id: values.origin_port_id,
    dest_port_id: values.dest_port_id,
    commodity_type: values.commodity_type,
    fcl_rate: values.fcl_rate,
    lcl_rate_cbm: values.lcl_rate_cbm,
    lcl_minimum_charge: values.lcl_minimum_charge,
    origin_thc: values.origin_thc,
    dest_thc: values.dest_thc,
    bl_fee: values.bl_fee,
    rate_valid_to: values.rate_valid_to,
    status: values.status,
  };
}

export function toVoyagePayload(values: CreateNvoccVoyageFormValues) {
  return { ...values };
}

export function toEnquiryPayload(values: CreateNvoccEnquiryFormValues) {
  return { ...values };
}

export function toBookingPayload(values: CreateNvoccBookingFormValues) {
  return {
    ...values,
    apply_tariff: values.apply_tariff ?? true,
  };
}

/** Map string form state → schema input (numbers/booleans). */
export function tariffFormToSchemaInput(form: NvoccTariffFormState) {
  return {
    ...form,
    commodity_type: form.commodity_type || undefined,
    status: form.status || undefined,
    fcl_rate: form.fcl_rate || undefined,
    lcl_rate_cbm: form.lcl_rate_cbm || undefined,
    lcl_minimum_charge: form.lcl_minimum_charge || undefined,
    origin_thc: form.origin_thc || undefined,
    dest_thc: form.dest_thc || undefined,
    bl_fee: form.bl_fee || undefined,
    rate_valid_to: form.rate_valid_to || undefined,
    origin_port_id: form.origin_port_id || undefined,
    dest_port_id: form.dest_port_id || undefined,
    pol_region: form.pol_region || undefined,
    pod_region: form.pod_region || undefined,
  };
}

export function voyageFormToSchemaInput(form: NvoccVoyageFormState) {
  return {
    ...form,
    vessel_id: form.vessel_id || undefined,
    shipping_line_id: form.shipping_line_id || undefined,
    pol_id: form.pol_id || undefined,
    pod_id: form.pod_id || undefined,
    etd: form.etd || undefined,
    eta: form.eta || undefined,
    si_cutoff: form.si_cutoff || undefined,
    vgm_cutoff: form.vgm_cutoff || undefined,
    cy_cutoff: form.cy_cutoff || undefined,
    cargo_cutoff: form.cargo_cutoff || undefined,
    slot_allocation_containers: form.slot_allocation_containers || undefined,
    lcl_capacity_cbm: form.lcl_capacity_cbm || undefined,
    mbl_number: form.mbl_number || undefined,
    nvocc_freight_rate: form.nvocc_freight_rate || undefined,
    carrier_cost: form.carrier_cost || undefined,
    remarks: form.remarks || undefined,
  };
}

export function enquiryFormToSchemaInput(form: NvoccEnquiryFormState) {
  return {
    ...form,
    customer_id: form.customer_id || undefined,
    voyage_id: form.voyage_id || undefined,
    container_count: form.container_count || undefined,
    cbm: form.cbm || undefined,
    gross_weight: form.gross_weight || undefined,
    pieces: form.pieces || undefined,
    commodity: form.commodity || undefined,
    hs_code: form.hs_code || undefined,
    incoterms: form.incoterms || undefined,
    freight_terms: form.freight_terms || undefined,
    rate_quoted: form.rate_quoted || undefined,
    rate_validity: form.rate_validity || undefined,
    follow_up_date: form.follow_up_date || undefined,
  };
}

export function bookingFormToSchemaInput(form: NvoccBookingFormState) {
  return {
    ...form,
    enquiry_id: form.enquiry_id || undefined,
    shipper_id: form.shipper_id || undefined,
    consignee_id: form.consignee_id || undefined,
    container_count: form.container_count || undefined,
    cbm_allocated: form.cbm_allocated || undefined,
    gross_weight: form.gross_weight || undefined,
    pieces: form.pieces || undefined,
    commodity: form.commodity || undefined,
    hs_code: form.hs_code || undefined,
    shipper_ref: form.shipper_ref || undefined,
    incoterms: form.incoterms || undefined,
    freight_terms: form.freight_terms || undefined,
  };
}

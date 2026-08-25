import { z } from 'zod';
import {
  amountField,
  integerField,
  optionalTextUndef,
  optionalUuid,
  requiredText,
} from '@/lib/validation';
import { CUSTOMS_STATUSES, JOB_TYPES } from '../constants/job.constants';

const jobTypeSchema = z.enum(JOB_TYPES);

function refineJobBusinessRules(
  data: {
    is_dg?: boolean;
    dg_class?: string;
    etd?: string;
    eta?: string;
    origin_port_id?: string;
    dest_port_id?: string;
    shipper_id?: string;
    consignee_id?: string;
    container_type_id?: string;
    container_count?: number;
    commodity?: string;
    hs_code?: string;
    incoterms?: string;
  },
  ctx: z.RefinementCtx,
) {
  const origin = data.origin_port_id?.trim();
  const dest = data.dest_port_id?.trim();
  if (origin && dest && origin === dest) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Origin and destination ports must be different',
      path: ['dest_port_id'],
    });
  }

  if (
    data.shipper_id &&
    data.consignee_id &&
    data.shipper_id === data.consignee_id
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Consignee must be different from shipper',
      path: ['consignee_id'],
    });
  }

  if (data.is_dg && !(data.dg_class && data.dg_class.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'DG class is required when dangerous goods is selected',
      path: ['dg_class'],
    });
  }

  if (data.etd && data.eta && data.etd > data.eta) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ETA must be on or after ETD',
      path: ['eta'],
    });
  }

  if (data.container_type_id && (data.container_count == null || data.container_count < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a container count of at least 1',
      path: ['container_count'],
    });
  }

  if (
    data.container_count != null &&
    data.container_count > 0 &&
    !data.container_type_id
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Select a container type',
      path: ['container_type_id'],
    });
  }

  if (data.commodity) {
    if (data.commodity.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Commodity must be at least 2 characters',
        path: ['commodity'],
      });
    }
    if (/\s{2,}/.test(data.commodity)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Remove consecutive spaces',
        path: ['commodity'],
      });
    }
  }

  if (data.hs_code) {
    const hs = data.hs_code.trim();
    if (!/^[0-9]{2,10}(\.[0-9]{1,4})?$/.test(hs)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid HS code (e.g. 8471.30)',
        path: ['hs_code'],
      });
    }
  }

  if (data.incoterms) {
    const code = data.incoterms.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Incoterms must be a 3-letter code (e.g. FOB)',
        path: ['incoterms'],
      });
    }
  }
}

export const createJobBaseSchema = z.object({
  job_type: jobTypeSchema,
  shipper_id: z.string().uuid('Select a valid shipper'),
  company_id: optionalUuid(),
  branch_id: optionalUuid(),
  department_id: optionalUuid(),
  parent_job_id: optionalUuid(),
  consignee_id: optionalUuid(),
  agent_id: optionalUuid(),
  salesperson_id: optionalUuid(),
  ops_user_id: optionalUuid(),
  origin_port_id: optionalUuid(),
  dest_port_id: optionalUuid(),
  commodity: optionalTextUndef({ min: 2, max: 500 }),
  hs_code: optionalTextUndef({ max: 20 }),
  gross_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  chargeable_weight: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 3,
  }),
  volume_cbm: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  pieces: integerField({ required: false, min: 0, allowNegative: false }),
  container_type_id: optionalUuid(),
  container_count: integerField({ required: false, min: 0, allowNegative: false }),
  incoterms: optionalTextUndef({ max: 10 }),
  is_dg: z.boolean().optional(),
  dg_class: optionalTextUndef({ max: 50 }),
  notes: optionalTextUndef({ max: 2000 }),
  customer_remarks: optionalTextUndef({ max: 2000 }),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  etd: optionalTextUndef({ max: 32 }),
  eta: optionalTextUndef({ max: 32 }),
});

export const createJobSchema = createJobBaseSchema.superRefine(refineJobBusinessRules);

export const updateJobSchema = createJobBaseSchema.partial().superRefine(refineJobBusinessRules);

export const createJobChargeSchema = z.object({
  charge_code_id: z.string().uuid('Select a charge code'),
  description: requiredText({ min: 1, max: 500 }),
  unit_price: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
  currency_code: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, 'Use a 3-letter currency code')
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter currency code'),
  quantity: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
  exchange_rate: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 6 }),
  tax_rate_id: optionalUuid(),
  is_cost: z.boolean().optional(),
  is_provisional: z.boolean().optional(),
  is_billable: z.boolean().optional(),
  party_id: optionalUuid(),
});

export const updateJobChargeSchema = createJobChargeSchema.partial();

export const createJobNoteSchema = z.object({
  note: requiredText({ min: 1, max: 5000 }),
  is_private: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
});

export const updateJobNoteSchema = createJobNoteSchema.partial();

export const createJobMilestoneSchema = z.object({
  milestone: requiredText({ min: 1, max: 100 }),
  planned_date: optionalTextUndef({ max: 32 }),
  actual_date: optionalTextUndef({ max: 32 }),
  notes: optionalTextUndef({ max: 2000 }),
});

export const updateJobMilestoneSchema = z.object({
  actual_date: optionalTextUndef({ max: 32 }),
  planned_date: optionalTextUndef({ max: 32 }),
  notes: optionalTextUndef({ max: 2000 }),
});

export const createJobCargoSchema = z.object({
  container_id: optionalUuid(),
  consignee_id: optionalUuid(),
  commodity: optionalTextUndef({ max: 500 }),
  hs_code: optionalTextUndef({ max: 20 }),
  description: optionalTextUndef({ max: 2000 }),
  marks_numbers: optionalTextUndef({ max: 500 }),
  packages: integerField({ required: false, min: 0, allowNegative: false }),
  gross_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  measurement: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
});

export const createJobContainerSchema = z.object({
  container_type_id: z.string().uuid('Select a container type'),
  container_number: optionalTextUndef({ max: 20 }),
  seal_number: optionalTextUndef({ max: 50 }),
  tare_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  max_payload: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  cubic_capacity: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  gross_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  vgm_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  cbm: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  status: z
    .enum(['EMPTY', 'STUFFED', 'GATED_IN', 'LOADED', 'IN_TRANSIT', 'DISCHARGED', 'RETURNED'])
    .optional(),
  gate_in_at: optionalTextUndef({ max: 32 }),
  is_soc: z.boolean().optional(),
});

export const createStuffingRecordSchema = z.object({
  supervisor_name: requiredText({ min: 2, max: 100 }),
  stuffing_date: requiredText({ min: 1, max: 32 }),
  container_id: optionalUuid(),
  location: optionalTextUndef({ max: 200 }),
  goods_condition: optionalTextUndef({ max: 500 }),
  notes: optionalTextUndef({ max: 2000 }),
});

export const createJobDepositSchema = z.object({
  deposit_type: requiredText({ min: 1, max: 100 }),
  deposit_amount: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
  currency_code: z
    .string()
    .trim()
    .toUpperCase()
    .length(3)
    .regex(/^[A-Z]{3}$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  deposit_receipt_number: optionalTextUndef({ max: 100 }),
  deposit_expiry_date: optionalTextUndef({ max: 32 }),
  remarks: optionalTextUndef({ max: 2000 }),
});

export const upsertContainerFreeDaysSchema = z.object({
  container_id: z.string().uuid('Select a container'),
  free_days_allowed: integerField({ required: false, min: 0, allowNegative: false }),
  last_free_day_date: optionalTextUndef({ max: 32 }),
  demurrage_start_date: optionalTextUndef({ max: 32 }),
  detention_start_date: optionalTextUndef({ max: 32 }),
  demurrage_rate_per_day: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 4,
  }),
  detention_rate_per_day: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 4,
  }),
});

export const createDamageReportSchema = z.object({
  damage_description: requiredText({ min: 1, max: 5000 }),
  container_id: optionalUuid(),
  photo_urls: z.array(z.string().url()).optional(),
  survey_report_number: optionalTextUndef({ max: 100 }),
  reported_at: optionalTextUndef({ max: 32 }),
});

export const createPartDeliverySchema = z.object({
  delivery_date: requiredText({ min: 1, max: 32 }),
  packages_delivered: integerField({ required: true, min: 1, allowNegative: false }),
  container_id: optionalUuid(),
  consignee_id: optionalUuid(),
  remarks: optionalTextUndef({ max: 2000 }),
});

export const createProofOfDeliverySchema = z.object({
  actual_delivery_date: requiredText({ min: 1, max: 32 }),
  container_id: optionalUuid(),
  delivered_by: optionalTextUndef({ max: 100 }),
  received_by: optionalTextUndef({ max: 100 }),
  signature_image_path: optionalTextUndef({ max: 500 }),
  remarks: optionalTextUndef({ max: 2000 }),
});

export const createPaymentRequestFromJobSchema = z.object({
  party_id: optionalUuid(),
  remarks: optionalTextUndef({ max: 2000 }),
  amount: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
  currency_code: z
    .string()
    .trim()
    .toUpperCase()
    .length(3)
    .regex(/^[A-Z]{3}$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const createSubJobSchema = z.object({
  job_type: jobTypeSchema.optional(),
  shipper_id: optionalUuid(),
  consignee_id: optionalUuid(),
  agent_id: optionalUuid(),
  commodity: optionalTextUndef({ max: 500 }),
  notes: optionalTextUndef({ max: 2000 }),
});

export const updateCustomsStatusSchema = z.object({
  customs_status: z.enum(CUSTOMS_STATUSES),
  customs_clearance_date: optionalTextUndef({ max: 32 }),
});

export const calculateCfsStorageSchema = z.object({
  as_of_date: optionalTextUndef({ max: 32 }),
});

export const linkTranshipmentSchema = z.object({
  export_job_id: z.string().uuid('Select a valid export job'),
});

export const returnContainerSchema = z.object({
  returned_at: optionalTextUndef({ max: 32 }),
  return_condition: optionalTextUndef({ max: 500 }),
});

export const sendPreAlertSchema = z.object({
  to_email: z.string().trim().email('Enter a valid email'),
  message: optionalTextUndef({ max: 500 }),
});

export const schedulePreAlertSchema = z.object({
  to_email: z.string().trim().email('Enter a valid email'),
  scheduled_at: requiredText({ min: 1, max: 32 }),
  message: optionalTextUndef({ max: 500 }),
});

export const sendWhatsAppStatusSchema = z.object({
  to_phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Use international format, e.g. +971501234567'),
  message: requiredText({ min: 1, max: 1000 }),
});

export const assignCargoToContainerFormSchema = z.object({
  container_id: z.string().uuid('Select a container'),
  cargo_id: z.string().uuid('Select cargo'),
});

export const prorateCostFormSchema = z.object({
  charge_code_id: z.string().uuid('Enter a valid charge code UUID'),
});

export const splitContainerFormSchema = z.object({
  container_id: z.string().uuid('Select a container'),
  portions: z
    .array(
      z.object({
        consignee_id: optionalUuid(),
        packages: integerField({ required: false, min: 0, allowNegative: false }),
        gross_weight: amountField({
          required: false,
          min: 0,
          allowNegative: false,
          maxDecimals: 3,
        }),
      }),
    )
    .min(1, 'Add at least one split portion'),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;
export type CreateJobChargeFormValues = z.infer<typeof createJobChargeSchema>;
export type CreateJobNoteFormValues = z.infer<typeof createJobNoteSchema>;

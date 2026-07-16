import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  hsCode,
  optionalEmail,
  optionalTextUndef,
  optionalUuid,
  requiredEmail,
  requiredText,
  requiredUuid,
} from '@/lib/validation';
import {
  INCOTERMS,
  JOB_TYPES,
  LOST_REASONS,
  PDF_MODES,
} from '../constants/quotation.constants';

const jobTypeSchema = z.enum(JOB_TYPES);
const incotermSchema = z.enum(INCOTERMS);
const lostReasonSchema = z.enum(LOST_REASONS);
const pdfModeSchema = z.enum(PDF_MODES);

const optionalNonNegNumber = amountField({
  required: false,
  min: 0,
  allowNegative: false,
  maxDecimals: 6,
});

const optionalPercent = amountField({
  required: false,
  min: 0,
  max: 100,
  allowNegative: false,
  maxDecimals: 2,
});

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const quotationHeaderObject = z.object({
  company_id: optionalUuid(),
  job_type: jobTypeSchema,
  customer_id: requiredUuid('Customer'),
  salesperson_id: optionalUuid(),
  branch_id: optionalUuid(),
  department_id: optionalUuid(),
  carrier_id: optionalUuid(),
  origin_port_id: optionalUuid(),
  dest_port_id: optionalUuid(),
  incoterm: z.preprocess(emptyToUndefined, incotermSchema.optional()),
  commodity: optionalTextUndef({ max: 200 }),
  hs_code: hsCode(false),
  gross_weight: optionalNonNegNumber,
  chargeable_weight: optionalNonNegNumber,
  volume_cbm: optionalNonNegNumber,
  pieces: optionalNonNegNumber,
  container_count: optionalNonNegNumber,
  container_type_id: optionalUuid(),
  is_dg: z.boolean().optional(),
  dg_class: optionalTextUndef({ max: 20 }),
  special_requirements: optionalTextUndef({ max: 2000 }),
  carrier_preference: optionalTextUndef({ max: 200 }),
  routing_notes: optionalTextUndef({ max: 2000 }),
  remarks: optionalTextUndef({ max: 2000 }),
  internal_notes: optionalTextUndef({ max: 2000 }),
  transit_time_days: optionalNonNegNumber,
  valid_until: optionalDate,
  currency_code: currencyCode(true),
  exchange_rate: optionalNonNegNumber,
  discount_percent: optionalPercent,
  discount_amount: optionalNonNegNumber,
});

function refineQuotationHeader(
  data: z.infer<typeof quotationHeaderObject>,
  ctx: z.RefinementCtx,
) {
  if (
    data.origin_port_id &&
    data.dest_port_id &&
    data.origin_port_id === data.dest_port_id
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dest_port_id'],
      message: 'Destination must differ from origin',
    });
  }
  if (data.valid_until) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = new Date(`${data.valid_until}T00:00:00`);
    if (Number.isFinite(until.getTime()) && until < today) {
      ctx.addIssue({
        code: 'custom',
        path: ['valid_until'],
        message: 'Validity date cannot be in the past',
      });
    }
  }
  if (data.is_dg && !(data.dg_class && String(data.dg_class).trim())) {
    ctx.addIssue({
      code: 'custom',
      path: ['dg_class'],
      message: 'DG class is required when Dangerous Goods is checked',
    });
  }
}

export const createQuotationSchema = quotationHeaderObject.superRefine(refineQuotationHeader);

export const updateQuotationSchema = quotationHeaderObject
  .partial()
  .superRefine((data, ctx) => {
    refineQuotationHeader(data as z.infer<typeof quotationHeaderObject>, ctx);
  });

export const createQuotationLineSchema = z.object({
  charge_code_id: requiredUuid('Charge code'),
  description: requiredText({ min: 1, max: 300 }),
  unit: optionalTextUndef({ max: 50 }),
  quantity: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
  unit_price: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
  currency_code: currencyCode(true),
  exchange_rate: optionalNonNegNumber,
  tax_rate_id: optionalUuid(),
  is_cost: z.boolean().optional(),
  supplier_id: optionalUuid(),
  sort_order: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 0 }),
});

export const updateQuotationLineSchema = createQuotationLineSchema.partial();

export const approvalDecisionSchema = z.object({
  comments: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
});

export const markLostSchema = z.object({
  reason: lostReasonSchema,
  notes: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
});

export const generateQuotationPdfSchema = z.object({
  mode: pdfModeSchema.default('CUSTOMER'),
  layout_variant: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
});

export const sendQuotationEmailSchema = z.object({
  to_email: requiredEmail(),
  cc_email: optionalEmail(),
  pdf_mode: z.preprocess(emptyToUndefined, pdfModeSchema.optional()),
  message: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
});

export const createOnlineQuoteSchema = z
  .object({
    tenant_slug: requiredText({ min: 1, max: 100 }),
    job_type: jobTypeSchema,
    currency_code: currencyCode(true),
    customer_id: optionalUuid(),
    contact_email: optionalEmail(),
    contact_name: optionalTextUndef({ min: 2, max: 100 }),
    origin_port_id: optionalUuid(),
    dest_port_id: optionalUuid(),
    commodity: optionalTextUndef({ max: 200 }),
    gross_weight: optionalNonNegNumber,
    chargeable_weight: optionalNonNegNumber,
    volume_cbm: optionalNonNegNumber,
    pieces: optionalNonNegNumber,
    special_requirements: optionalTextUndef({ max: 2000 }),
    valid_until: optionalDate,
  })
  .superRefine((data, ctx) => {
    if (
      data.origin_port_id &&
      data.dest_port_id &&
      data.origin_port_id === data.dest_port_id
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dest_port_id'],
        message: 'Destination must differ from origin',
      });
    }
    if (!data.customer_id) {
      if (!data.contact_name?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['contact_name'],
          message: 'Contact name is required when customer is not selected',
        });
      }
      if (!data.contact_email?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['contact_email'],
          message: 'Contact email is required when customer is not selected',
        });
      }
    }
  });

export type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationFormValues = z.infer<typeof updateQuotationSchema>;
export type CreateQuotationLineFormValues = z.infer<typeof createQuotationLineSchema>;
export type UpdateQuotationLineFormValues = z.infer<typeof updateQuotationLineSchema>;
export type ApprovalDecisionFormValues = z.infer<typeof approvalDecisionSchema>;
export type MarkLostFormValues = z.infer<typeof markLostSchema>;
export type GenerateQuotationPdfFormValues = z.infer<typeof generateQuotationPdfSchema>;
export type SendQuotationEmailFormValues = z.infer<typeof sendQuotationEmailSchema>;
export type CreateOnlineQuoteFormValues = z.infer<typeof createOnlineQuoteSchema>;

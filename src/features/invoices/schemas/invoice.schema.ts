import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredEmail,
  requiredText,
  requiredUuid,
} from '@/lib/validation';

const optionalNonNegNumber = amountField({
  required: false,
  min: 0,
  allowNegative: false,
  maxDecimals: 6,
});

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

export const createInvoiceLineSchema = z.object({
  description: requiredText({ min: 1, max: 300 }),
  quantity: optionalNonNegNumber,
  unit_price: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 6 }),
  charge_code_id: optionalUuid(),
  tax_rate_id: optionalUuid(),
  is_taxable: z.boolean().optional(),
  sort_order: optionalNonNegNumber,
});

export const updateInvoiceLineSchema = z.object({
  description: z.preprocess(
    emptyToUndefined,
    z.string().min(1).max(300).optional(),
  ),
  quantity: optionalNonNegNumber,
  unit_price: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 6 }),
  charge_code_id: optionalUuid(),
  tax_rate_id: optionalUuid(),
  is_taxable: z.boolean().optional(),
  sort_order: optionalNonNegNumber,
});

const invoiceHeaderObject = z.object({
  party_id: requiredUuid('Party'),
  company_id: optionalUuid(),
  job_id: optionalUuid(),
  branch_id: optionalUuid(),
  department_id: optionalUuid(),
  currency_code: currencyCode(true),
  exchange_rate: optionalNonNegNumber,
  vat_rate: optionalNonNegNumber,
  invoice_date: optionalDate,
  due_date: optionalDate,
  lpo_number: optionalTextUndef({ min: 1, max: 100 }),
  remarks: optionalTextUndef({ max: 2000 }),
  internal_notes: optionalTextUndef({ max: 2000 }),
  lines: z.array(createInvoiceLineSchema).optional(),
});

function refineInvoiceDates(
  data: { invoice_date?: string; due_date?: string },
  ctx: z.RefinementCtx,
) {
  if (data.invoice_date && data.due_date && data.due_date < data.invoice_date) {
    ctx.addIssue({
      code: 'custom',
      path: ['due_date'],
      message: 'Due date must be on or after invoice date',
    });
  }
}

export const createInvoiceSchema = invoiceHeaderObject.superRefine(refineInvoiceDates);

export const updateInvoiceSchema = z
  .object({
    party_id: optionalUuid(),
    company_id: optionalUuid(),
    job_id: optionalUuid(),
    branch_id: optionalUuid(),
    department_id: optionalUuid(),
    currency_code: currencyCode(false),
    exchange_rate: optionalNonNegNumber,
    vat_rate: optionalNonNegNumber,
    invoice_date: optionalDate,
    due_date: optionalDate,
    lpo_number: optionalTextUndef({ min: 1, max: 100 }),
    remarks: optionalTextUndef({ max: 2000 }),
    internal_notes: optionalTextUndef({ max: 2000 }),
  })
  .superRefine(refineInvoiceDates);

export const sendInvoiceEmailSchema = z.object({
  to_email: requiredEmail(),
  message: z.preprocess(
    emptyToUndefined,
    z.string().min(1).max(500).optional(),
  ),
});

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormValues = z.infer<typeof updateInvoiceSchema>;
export type CreateInvoiceLineFormValues = z.infer<typeof createInvoiceLineSchema>;
export type UpdateInvoiceLineFormValues = z.infer<typeof updateInvoiceLineSchema>;
export type SendInvoiceEmailFormValues = z.infer<typeof sendInvoiceEmailSchema>;

import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredUuid,
} from '@/lib/validation';
import {
  createInvoiceLineSchema,
  updateInvoiceLineSchema,
} from '@/features/invoices/schemas/invoice.schema';

export { createInvoiceLineSchema, updateInvoiceLineSchema };

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

const purchaseInvoiceHeaderObject = z.object({
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

/** Swagger `CreatePurchaseInvoiceDto`. */
export const createPurchaseInvoiceSchema =
  purchaseInvoiceHeaderObject.superRefine(refineInvoiceDates);

/** Swagger `UpdateInvoiceDto` — all optional, header fields + optional lines. */
export const updatePurchaseInvoiceSchema = z
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
    lines: z.array(createInvoiceLineSchema).optional(),
  })
  .superRefine(refineInvoiceDates);

export type CreatePurchaseInvoiceFormValues = z.infer<typeof createPurchaseInvoiceSchema>;
export type UpdatePurchaseInvoiceFormValues = z.infer<typeof updatePurchaseInvoiceSchema>;
export type CreatePurchaseInvoiceLineFormValues = z.infer<typeof createInvoiceLineSchema>;

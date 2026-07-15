import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredText,
  requiredUuid,
} from '@/lib/validation';

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const amountRequired = amountField({
  required: true,
  min: 0.01,
  allowNegative: false,
  maxDecimals: 6,
});

const amountOptional = amountField({
  required: false,
  min: 0.01,
  allowNegative: false,
  maxDecimals: 6,
});

/** Swagger `CreatePaymentRequestDto`. */
export const createPaymentRequestSchema = z.object({
  party_id: requiredUuid('Party'),
  amount: amountRequired,
  currency_code: currencyCode(true),
  invoice_id: optionalUuid(),
  job_id: optionalUuid(),
  due_date: optionalDate,
  remarks: optionalTextUndef({ max: 2000 }),
});

/** Swagger `UpdatePaymentRequestDto` — all optional. */
export const updatePaymentRequestSchema = z.object({
  party_id: optionalUuid(),
  amount: amountOptional,
  currency_code: currencyCode(false),
  invoice_id: optionalUuid(),
  job_id: optionalUuid(),
  due_date: optionalDate,
  remarks: optionalTextUndef({ max: 2000 }),
});

/** Swagger `RejectPaymentRequestDto`. */
export const rejectPaymentRequestSchema = z.object({
  rejected_reason: requiredText({ min: 1, max: 500 }),
});

export type CreatePaymentRequestFormValues = z.infer<typeof createPaymentRequestSchema>;
export type UpdatePaymentRequestFormValues = z.infer<typeof updatePaymentRequestSchema>;
export type RejectPaymentRequestFormValues = z.infer<typeof rejectPaymentRequestSchema>;

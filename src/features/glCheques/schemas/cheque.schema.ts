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
import { CHEQUE_TYPES } from '../constants/cheque.constants';

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const chequeAmount = amountField({
  required: true,
  min: 0.0001,
  allowNegative: false,
  maxDecimals: 6,
});

const chequeAmountOptional = amountField({
  required: false,
  min: 0.0001,
  allowNegative: false,
  maxDecimals: 6,
});

const chequeFields = {
  cheque_number: requiredText({ min: 1, max: 50 }),
  cheque_type: z.enum(CHEQUE_TYPES),
  party_id: requiredUuid(),
  amount: chequeAmount,
  currency_code: currencyCode(true),
  cheque_date: z
    .string()
    .min(1, 'Cheque date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  due_date: optionalDate,
  is_pdc: z.boolean().optional(),
  company_id: optionalUuid(),
  bank_account_id: optionalUuid(),
  bank_name: optionalTextUndef({ max: 200 }),
  remarks: optionalTextUndef({ max: 2000 }),
};

function pdcDueDateRefine<T extends { is_pdc?: boolean; due_date?: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.is_pdc && !data.due_date?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['due_date'],
      message: 'Due date is required for post-dated cheques',
    });
  }
}

/** Swagger `CreateChequeDto`. */
export const createChequeSchema = z
  .object(chequeFields)
  .superRefine(pdcDueDateRefine);

/** Swagger `UpdateChequeDto`. */
export const updateChequeSchema = z
  .object({
    cheque_number: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).max(50).optional(),
    ),
    cheque_type: z.preprocess(emptyToUndefined, z.enum(CHEQUE_TYPES).optional()),
    party_id: optionalUuid(),
    amount: chequeAmountOptional,
    currency_code: currencyCode(false),
    cheque_date: optionalDate,
    due_date: optionalDate,
    is_pdc: z.boolean().optional(),
    company_id: optionalUuid(),
    bank_account_id: optionalUuid(),
    bank_name: optionalTextUndef({ max: 200 }),
    remarks: optionalTextUndef({ max: 2000 }),
  })
  .superRefine(pdcDueDateRefine);

/** Swagger `BounceChequeDto`. */
export const bounceChequeSchema = z.object({
  reason: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1, 'Reason is required').max(500).optional(),
  ),
});

export type CreateChequeFormValues = z.infer<typeof createChequeSchema>;
export type UpdateChequeFormValues = z.infer<typeof updateChequeSchema>;
export type BounceChequeFormValues = z.infer<typeof bounceChequeSchema>;

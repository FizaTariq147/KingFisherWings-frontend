import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredUuid,
} from '@/lib/validation';
import { VOUCHER_TYPES } from '../constants/voucher.constants';

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const nonNegAmount = amountField({
  required: false,
  min: 0,
  allowNegative: false,
  maxDecimals: 6,
});

/** Swagger `CreateVoucherLineDto`. */
export const createVoucherLineSchema = z
  .object({
    account_id: requiredUuid('Account'),
    debit_amount: nonNegAmount,
    credit_amount: nonNegAmount,
    currency_code: currencyCode(false),
    exchange_rate: amountField({
      required: false,
      min: 0,
      allowNegative: false,
      maxDecimals: 8,
    }),
    narration: optionalTextUndef({ min: 1, max: 500 }),
    party_id: optionalUuid(),
    job_id: optionalUuid(),
    cost_center: optionalTextUndef({ min: 1, max: 50 }),
  })
  .superRefine((data, ctx) => {
    const debit = data.debit_amount ?? 0;
    const credit = data.credit_amount ?? 0;
    if (debit <= 0 && credit <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['debit_amount'],
        message: 'Enter a debit or credit amount',
      });
    }
    if (debit > 0 && credit > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['credit_amount'],
        message: 'Use either debit or credit, not both',
      });
    }
  });

/** Swagger `UpdateVoucherLineDto` — all optional. */
export const updateVoucherLineSchema = z.object({
  account_id: optionalUuid(),
  debit_amount: nonNegAmount,
  credit_amount: nonNegAmount,
  currency_code: currencyCode(false),
  exchange_rate: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 8,
  }),
  narration: optionalTextUndef({ min: 1, max: 500 }),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  cost_center: optionalTextUndef({ min: 1, max: 50 }),
});

/** Swagger `CreateVoucherDto`. */
export const createVoucherSchema = z.object({
  voucher_type: z.enum(VOUCHER_TYPES),
  currency_code: currencyCode(false),
  exchange_rate: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 8,
  }),
  voucher_date: optionalDate,
  narration: optionalTextUndef({ max: 2000 }),
  reference_number: optionalTextUndef({ min: 1, max: 100 }),
  company_id: optionalUuid(),
  branch_id: optionalUuid(),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  invoice_id: optionalUuid(),
  lines: z.array(createVoucherLineSchema).optional(),
});

/** Swagger `UpdateVoucherDto` — header fields (lines managed via line APIs on detail). */
export const updateVoucherSchema = z.object({
  voucher_type: z.preprocess(emptyToUndefined, z.enum(VOUCHER_TYPES).optional()),
  currency_code: currencyCode(false),
  exchange_rate: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 8,
  }),
  voucher_date: optionalDate,
  narration: optionalTextUndef({ max: 2000 }),
  reference_number: optionalTextUndef({ min: 1, max: 100 }),
  company_id: optionalUuid(),
  branch_id: optionalUuid(),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  invoice_id: optionalUuid(),
});

export type CreateVoucherLineFormValues = z.infer<typeof createVoucherLineSchema>;
export type UpdateVoucherLineFormValues = z.infer<typeof updateVoucherLineSchema>;
export type CreateVoucherFormValues = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherFormValues = z.infer<typeof updateVoucherSchema>;

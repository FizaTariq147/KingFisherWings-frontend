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
  PAYMENT_DIRECTIONS,
  PAYMENT_METHODS,
} from '../constants/glPayment.constants';

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const paymentAmount = amountField({
  required: true,
  min: 0.0001,
  allowNegative: false,
  maxDecimals: 6,
});

const paymentAmountOptional = amountField({
  required: false,
  min: 0.0001,
  allowNegative: false,
  maxDecimals: 6,
});

const allocationAmount = amountField({
  required: true,
  min: 0.0001,
  allowNegative: false,
  maxDecimals: 6,
});

/** Swagger `PaymentAllocationInputDto`. */
export const paymentAllocationInputSchema = z.object({
  invoice_id: requiredUuid('Invoice'),
  amount: allocationAmount,
});

/** Swagger `CreatePaymentDto`. */
export const createGlPaymentSchema = z
  .object({
    direction: z.enum(PAYMENT_DIRECTIONS),
    payment_method: z.preprocess(
      emptyToUndefined,
      z.enum(PAYMENT_METHODS).optional(),
    ),
    party_id: requiredUuid('Party'),
    amount: paymentAmount,
    currency_code: currencyCode(true),
    exchange_rate: amountField({
      required: false,
      min: 0,
      allowNegative: false,
      maxDecimals: 8,
    }),
    payment_date: optionalDate,
    company_id: optionalUuid(),
    branch_id: optionalUuid(),
    bank_account_id: optionalUuid(),
    gl_account_id: optionalUuid(),
    reference_number: optionalTextUndef({ min: 1, max: 100 }),
    narration: optionalTextUndef({ max: 2000 }),
    allocations: z.array(paymentAllocationInputSchema).optional(),
    cheque_number: optionalTextUndef({ max: 100 }),
    cheque_date: optionalDate,
    cheque_due_date: optionalDate,
    cheque_bank_name: optionalTextUndef({ max: 200 }),
    is_pdc: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === 'CHEQUE' && !data.cheque_number?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['cheque_number'],
        message: 'Cheque number is required when method is Cheque',
      });
    }
  });

/** Swagger `UpdatePaymentDto`. */
export const updateGlPaymentSchema = z.object({
  direction: z.preprocess(emptyToUndefined, z.enum(PAYMENT_DIRECTIONS).optional()),
  payment_method: z.preprocess(emptyToUndefined, z.enum(PAYMENT_METHODS).optional()),
  party_id: optionalUuid(),
  amount: paymentAmountOptional,
  currency_code: currencyCode(false),
  exchange_rate: amountField({
    required: false,
    min: 0,
    allowNegative: false,
    maxDecimals: 8,
  }),
  payment_date: optionalDate,
  company_id: optionalUuid(),
  branch_id: optionalUuid(),
  bank_account_id: optionalUuid(),
  gl_account_id: optionalUuid(),
  reference_number: optionalTextUndef({ min: 1, max: 100 }),
  narration: optionalTextUndef({ max: 2000 }),
  allocations: z.array(paymentAllocationInputSchema).optional(),
  cheque_number: optionalTextUndef({ max: 100 }),
  cheque_date: optionalDate,
  cheque_due_date: optionalDate,
  cheque_bank_name: optionalTextUndef({ max: 200 }),
  is_pdc: z.boolean().optional(),
});

export type PaymentAllocationInputFormValues = z.infer<typeof paymentAllocationInputSchema>;
export type CreateGlPaymentFormValues = z.infer<typeof createGlPaymentSchema>;
export type UpdateGlPaymentFormValues = z.infer<typeof updateGlPaymentSchema>;

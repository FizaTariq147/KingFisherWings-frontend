import { z } from 'zod';
import {
  amountField,
  emptyToUndefined,
  normalizeName,
  optionalTextUndef,
  optionalUuid,
  toUpperCaseCode,
  V,
} from '@/lib/validation';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_SUB_TYPES,
  ACCOUNT_TYPES,
  OPENING_BALANCE_TYPES,
} from '../constants/chartOfAccount.constants';

const accountCodeField = z.preprocess(
  toUpperCaseCode,
  z
    .string({ error: V.required })
    .min(1, V.required)
    .max(30, V.maxLength(30))
    .regex(/^[A-Z0-9][A-Z0-9._-]{0,29}$/, 'Use letters, numbers, dots, hyphens, or underscores'),
);

const accountNameField = z.preprocess(
  (v) => normalizeName(v),
  z
    .string({ error: V.required })
    .min(1, V.required)
    .max(200, V.maxLength(200))
    .refine((v) => !/\s{2,}/.test(v), V.consecutiveSpaces),
);

const optionalAccountNameAr = z.preprocess(
  (v) => {
    if (v == null || v === '') return undefined;
    return normalizeName(v);
  },
  z
    .string()
    .min(1, V.minLength(1))
    .max(200, V.maxLength(200))
    .refine((v) => !/\s{2,}/.test(v), V.consecutiveSpaces)
    .optional(),
);

const optionalCurrency = z.preprocess(
  (v) => {
    const cleaned = emptyToUndefined(typeof v === 'string' ? v.trim().toUpperCase() : v);
    return cleaned;
  },
  z
    .string()
    .length(3, V.currencyCode)
    .regex(/^[A-Z]{3}$/, V.currencyCode)
    .optional(),
);

const boolField = z.boolean().optional();

export const createChartOfAccountSchema = z.object({
  account_code: accountCodeField,
  account_name: accountNameField,
  account_name_ar: optionalAccountNameAr,
  account_group: z.enum(ACCOUNT_GROUPS, { error: V.required }),
  account_type: z.enum(ACCOUNT_TYPES, { error: V.required }),
  account_sub_type: z.preprocess(
    emptyToUndefined,
    z.enum(ACCOUNT_SUB_TYPES).optional(),
  ),
  company_id: optionalUuid(),
  parent_id: optionalUuid(),
  is_header: boolField,
  is_postable: boolField,
  is_bank_account: boolField,
  is_cash_account: boolField,
  currency_code: optionalCurrency,
  opening_balance: amountField({
    required: false,
    allowNegative: true,
    min: -1_000_000_000_000,
    maxDecimals: 4,
  }),
  opening_balance_type: z.preprocess(
    emptyToUndefined,
    z.enum(OPENING_BALANCE_TYPES).optional(),
  ),
  allow_manual_entry: boolField,
  is_active: boolField,
  sort_order: z.preprocess(
    (v) => {
      if (v === '' || v == null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    },
    z.number().optional(),
  ),
  notes: optionalTextUndef({ max: 2000 }),
});

export const updateChartOfAccountSchema = z.object({
  account_code: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .min(1)
      .max(30)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,29}$/, 'Use letters, numbers, dots, hyphens, or underscores')
      .transform((s) => s.trim().toUpperCase())
      .optional(),
  ),
  account_name: z.preprocess(
    (v) => {
      if (v == null || v === '') return undefined;
      return normalizeName(v);
    },
    z
      .string()
      .min(1)
      .max(200)
      .refine((v) => !/\s{2,}/.test(v), V.consecutiveSpaces)
      .optional(),
  ),
  account_name_ar: optionalAccountNameAr,
  account_group: z.preprocess(emptyToUndefined, z.enum(ACCOUNT_GROUPS).optional()),
  account_type: z.preprocess(emptyToUndefined, z.enum(ACCOUNT_TYPES).optional()),
  account_sub_type: z.preprocess(emptyToUndefined, z.enum(ACCOUNT_SUB_TYPES).optional()),
  company_id: optionalUuid(),
  parent_id: optionalUuid(),
  is_header: boolField,
  is_postable: boolField,
  is_bank_account: boolField,
  is_cash_account: boolField,
  currency_code: optionalCurrency,
  opening_balance: amountField({
    required: false,
    allowNegative: true,
    min: -1_000_000_000_000,
    maxDecimals: 4,
  }),
  opening_balance_type: z.preprocess(
    emptyToUndefined,
    z.enum(OPENING_BALANCE_TYPES).optional(),
  ),
  allow_manual_entry: boolField,
  is_active: boolField,
  sort_order: z.preprocess(
    (v) => {
      if (v === '' || v == null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    },
    z.number().optional(),
  ),
  notes: optionalTextUndef({ max: 2000 }),
});

export type CreateChartOfAccountFormValues = z.infer<typeof createChartOfAccountSchema>;
export type UpdateChartOfAccountFormValues = z.infer<typeof updateChartOfAccountSchema>;

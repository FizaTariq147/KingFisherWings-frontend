import { z } from 'zod';
import { withLocaleCatalogRefine } from '@/lib/locale';
import {
  countryCode,
  hexColor,
  integerField,
  optionalName,
  optionalPhone,
  optionalText,
  optionalUrlOrEmpty,
  optionalUuid,
  prefixCode,
  requiredName,
  requiredText,
  RULES,
  swiftBic,
  V,
  withPhoneCountryRefine,
} from '@/lib/validation';
import {
  DOCUMENT_TYPES,
  RESET_FREQUENCIES,
} from '../constants/organization.constants';

const optionalEmailOrEmpty = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .toLowerCase()
    .max(RULES.EMAIL_MAX, V.emailMax)
    .regex(RULES.EMAIL, V.email),
]);

const optionalCurrencyOrEmpty = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .pipe(z.string().length(3, V.currencyCode).regex(/^[A-Z]{3}$/, V.currencyCode)),
]);

const updateOrganizationProfileObject = z.object({
  name: requiredName(),
  display_name: optionalName(),
  logo_url: optionalUrlOrEmpty(),
  primary_color: z.union([z.literal(''), hexColor()]).optional(),
  website: optionalUrlOrEmpty(),
  address: optionalText({ max: 500 }),
  city: optionalText({ max: 100 }),
  country_code: countryCode(false),
  phone: optionalPhone(),
  email: optionalEmailOrEmpty.optional(),
  language: optionalText({ max: 10 }),
  base_currency: optionalCurrencyOrEmpty.optional(),
  timezone: optionalText({ max: 64 }),
  financial_year_start: z.union([
    z.literal(''),
    z.coerce.number().int().min(1).max(12),
  ]),
  vat_number: optionalText({ max: 100 }),
  cr_number: optionalText({ max: 100 }),
  iata_cargo_agent_code: optionalText({ max: 50 }),
  customs_code: optionalText({ max: 50 }),
  customs_license_no: optionalText({ max: 50 }),
});

export const updateOrganizationProfileSchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(updateOrganizationProfileObject, { required: false }),
  { restrictTimezone: true, taxIdKey: 'vat_number' },
);

export const createBankAccountSchema = z.object({
  bank_name: requiredName(),
  account_name: requiredName(),
  account_number: requiredText({ min: 1, max: 50 }),
  iban: optionalText({ max: 34 }),
  swift_code: swiftBic(false),
  currency_code: optionalCurrencyOrEmpty.optional(),
  branch_id: optionalUuid(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export const updateBankAccountSchema = createBankAccountSchema.partial().extend({
  bank_name: requiredName().optional(),
  account_name: requiredName().optional(),
  account_number: requiredText({ min: 1, max: 50 }).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const createNumberFormatSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  prefix: prefixCode({ required: true, max: 10 }),
  include_branch_code: z.boolean(),
  include_year: z.boolean(),
  year_digits: integerField({ required: true, min: 2, max: 4 }),
  include_month: z.boolean(),
  sequence_length: integerField({ required: true, min: 3, max: 10 }),
  separator: z.string().max(3, V.maxLength(3)),
  reset_frequency: z.enum(RESET_FREQUENCIES),
  is_active: z.boolean(),
});

export const updateNumberFormatSchema = createNumberFormatSchema.partial().extend({
  document_type: z.enum(DOCUMENT_TYPES).optional(),
  prefix: prefixCode({ required: true, max: 10 }).optional(),
});

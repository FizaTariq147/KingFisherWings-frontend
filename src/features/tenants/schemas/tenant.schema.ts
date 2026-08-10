import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';
import { withLocaleCatalogRefine } from '@/lib/locale';
import {
  countryCode,
  currencyCode,
  entityCode,
  hexColor,
  integerField,
  optionalName,
  optionalText,
  optionalUrlOrEmpty,
  passwordField,
  requiredEmail,
  requiredName,
  requiredPhone,
  requiredText,
  slugLower,
  withPhoneCountryRefine,
} from '@/lib/validation';

export const SUBSCRIPTION_PLANS = [
  'TRIAL',
  'BASIC',
  'STANDARD',
  'PROFESSIONAL',
  'ENTERPRISE',
] as const;

export const TENANT_STATUSES = [
  'TRIAL',
  'ACTIVE',
  'SUSPENDED',
  'EXPIRED',
  'ARCHIVED',
] as const;

const createTenantObject = z.object({
  code: entityCode({ min: 3, max: 20 }),
  name: requiredName(),
  display_name: requiredName(),
  slug: slugLower(),
  password: passwordField({
    minLength: 8,
    requireUpper: true,
    requireLower: true,
    requireNumber: true,
    requireSpecial: false,
  }),
  admin_first_name: requiredName(),
  admin_last_name: requiredName(),
  domain: optionalText({ max: 200 }),
  website: optionalUrlOrEmpty(),
  logo_url: optionalUrlOrEmpty(),
  primary_color: hexColor(),
  language: requiredText({ min: 1, max: 10 }),
  base_currency: currencyCode(true),
  timezone: requiredText({ min: 1, max: 64 }),
  country_code: countryCode(false),
  financial_year_start: integerField({ required: true, min: 1, max: 12 }),
  vat_number: optionalText({ max: 100 }),
  cr_number: optionalText({ max: 100 }),
  address: requiredText({ min: 1, max: 500 }),
  city: requiredText({ min: 2, max: 100 }),
  phone: requiredPhone(),
  email: requiredEmail(),
  selected_company_id: z
    .string()
    .min(1, 'Select a company profile')
    .refine((value) => isUuid(value), 'Select a valid company'),
  company_code: entityCode(),
  company_name: requiredName(),
  company_legal_name: optionalName(),
  company_registration_number: optionalText({ max: 100 }),
  subscription_plan: z.enum(SUBSCRIPTION_PLANS),
  status: z.enum(TENANT_STATUSES),
  trial_ends: z.string().optional(),
  subscription_ends: z.string().optional(),
  max_users: integerField({ required: true, min: 1, allowNegative: false }),
  max_branches: integerField({ required: true, min: 1, allowNegative: false }),
  max_storage_gb: integerField({ required: true, min: 1, allowNegative: false }),
  is_active: z.boolean(),
});

export const createTenantSchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(createTenantObject, { required: true }),
  { restrictTimezone: true, taxIdKey: 'vat_number' },
);

export type CreateTenantFormValues = z.infer<typeof createTenantObject>;

const updateTenantObject = createTenantObject.omit({
  slug: true,
  password: true,
  admin_first_name: true,
  admin_last_name: true,
  selected_company_id: true,
});

export const updateTenantSchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(updateTenantObject, { required: true }),
  { restrictTimezone: true, taxIdKey: 'vat_number' },
);

export type UpdateTenantFormValues = z.infer<typeof updateTenantObject>;

import { z } from 'zod';
import {
  DOCUMENT_TYPES,
  RESET_FREQUENCIES,
} from '../constants/organization.constants';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const updateOrganizationProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  display_name: z.string().max(200).optional().or(z.literal('')),
  logo_url: z.string().optional().or(z.literal('')),
  primary_color: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  language: z.string().max(10).optional().or(z.literal('')),
  base_currency: z
    .string()
    .length(3, 'Currency must be 3 letters')
    .optional()
    .or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  financial_year_start: z.union([
    z.literal(''),
    z.coerce.number().int().min(1).max(12),
  ]),
  vat_number: z.string().optional().or(z.literal('')),
  cr_number: z.string().optional().or(z.literal('')),
  iata_cargo_agent_code: z.string().optional().or(z.literal('')),
  customs_code: z.string().optional().or(z.literal('')),
  customs_license_no: z.string().optional().or(z.literal('')),
});

export const createBankAccountSchema = z.object({
  bank_name: z.string().min(2, 'Bank name is required').max(200),
  account_name: z.string().min(2, 'Account name is required').max(200),
  account_number: z.string().min(1, 'Account number is required').max(50),
  iban: z.string().optional().or(z.literal('')),
  swift_code: z.string().optional().or(z.literal('')),
  currency_code: z
    .string()
    .length(3, 'Currency must be 3 letters')
    .optional()
    .or(z.literal('')),
  branch_id: z.preprocess(
    emptyToUndefined,
    z.string().uuid('Branch id must be a valid UUID').optional(),
  ),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export const updateBankAccountSchema = createBankAccountSchema.partial().extend({
  bank_name: z.string().min(2).max(200).optional(),
  account_name: z.string().min(2).max(200).optional(),
  account_number: z.string().min(1).max(50).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const createNumberFormatSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  prefix: z.string().min(1, 'Prefix is required').max(20),
  include_branch_code: z.boolean(),
  include_year: z.boolean(),
  year_digits: z.coerce.number().int().min(2).max(4),
  include_month: z.boolean(),
  sequence_length: z.coerce.number().int().min(3).max(10),
  separator: z.string().max(3),
  reset_frequency: z.enum(RESET_FREQUENCIES),
  is_active: z.boolean(),
});

export const updateNumberFormatSchema = createNumberFormatSchema.partial().extend({
  document_type: z.enum(DOCUMENT_TYPES).optional(),
  prefix: z.string().min(1).max(20).optional(),
});

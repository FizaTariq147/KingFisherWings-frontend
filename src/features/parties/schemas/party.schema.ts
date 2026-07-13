import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';
import { CREDIT_STATUSES, PARTY_TYPES } from '../constants/party.constants';

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.string().refine((v) => isUuid(v), 'Must be a valid UUID').optional(),
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email('Enter a valid email').optional(),
);

const partyTypeSchema = z.enum(PARTY_TYPES);
const creditStatusSchema = z.enum(CREDIT_STATUSES);

export const createPartySchema = z.object({
  company_id: optionalUuid,
  party_type: partyTypeSchema,
  code: z.string().trim().min(1, 'Code is required').max(30),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(300),
  short_name: z.preprocess(emptyToUndefined, z.string().optional()),
  vat_number: z.preprocess(emptyToUndefined, z.string().optional()),
  cr_number: z.preprocess(emptyToUndefined, z.string().optional()),
  country_code: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .length(2, 'Country must be a 2-letter ISO code')
      .transform((v) => v.toUpperCase())
      .optional(),
  ),
  city: z.preprocess(emptyToUndefined, z.string().optional()),
  address: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  email: optionalEmail,
  credit_limit: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  credit_days: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).max(365).optional(),
  ),
  currency_code: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .length(3, 'Currency must be 3 letters')
      .transform((v) => v.toUpperCase())
      .optional(),
  ),
  salesperson_id: optionalUuid,
  portal_access: z.boolean().optional(),
  marketing_subscription: z.boolean().optional(),
  iata_code: z.preprocess(emptyToUndefined, z.string().optional()),
  scac_code: z.preprocess(emptyToUndefined, z.string().optional()),
  tags: z.array(z.string()).optional(),
  notes: z.preprocess(emptyToUndefined, z.string().optional()),
  is_active: z.boolean().optional(),
});

export const updatePartySchema = createPartySchema.partial();

export const createPartyContactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  designation: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  mobile: z.preprocess(emptyToUndefined, z.string().optional()),
  email: optionalEmail,
  is_primary: z.boolean().optional(),
});

export const updatePartyContactSchema = createPartyContactSchema.partial();

export const createPartyAddressSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(50),
  address_line1: z.string().trim().min(1, 'Address line 1 is required'),
  address_line2: z.preprocess(emptyToUndefined, z.string().optional()),
  city: z.preprocess(emptyToUndefined, z.string().optional()),
  state: z.preprocess(emptyToUndefined, z.string().optional()),
  postal_code: z.preprocess(emptyToUndefined, z.string().optional()),
  country_code: z
    .string()
    .trim()
    .length(2, 'Country must be a 2-letter ISO code')
    .transform((v) => v.toUpperCase()),
  is_default: z.boolean().optional(),
});

export const updatePartyAddressSchema = createPartyAddressSchema.partial();

export const updateCreditStatusSchema = z.object({
  credit_status: creditStatusSchema,
  reason: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
});

export type CreatePartyFormValues = z.infer<typeof createPartySchema>;
export type UpdatePartyFormValues = z.infer<typeof updatePartySchema>;
export type CreatePartyContactFormValues = z.infer<typeof createPartyContactSchema>;
export type CreatePartyAddressFormValues = z.infer<typeof createPartyAddressSchema>;
export type UpdateCreditStatusFormValues = z.infer<typeof updateCreditStatusSchema>;

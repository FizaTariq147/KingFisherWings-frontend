import { z } from 'zod';
import { withLocaleCatalogRefine, withPostalCountryRefine } from '@/lib/locale';
import {
  amountField,
  countryCode,
  currencyCode,
  emptyToUndefined,
  entityCode,
  integerField,
  optionalEmail,
  optionalName,
  optionalPhone,
  optionalTextUndef,
  optionalUuid,
  iataCode,
  requiredName,
  requiredText,
  withPhoneCountryRefine,
} from '@/lib/validation';
import { CREDIT_STATUSES, PARTY_TYPES } from '../constants/party.constants';

const partyTypeSchema = z.enum(PARTY_TYPES);
const creditStatusSchema = z.enum(CREDIT_STATUSES);

const createPartyObject = z.object({
  company_id: optionalUuid(),
  party_type: partyTypeSchema,
  code: entityCode(),
  name: requiredName(),
  short_name: optionalName(),
  vat_number: optionalTextUndef({ max: 100 }),
  cr_number: optionalTextUndef({ max: 100 }),
  country_code: countryCode(false),
  city: optionalTextUndef({ max: 100 }),
  address: optionalTextUndef({ max: 500 }),
  phone: optionalPhone(),
  email: optionalEmail(),
  credit_limit: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 2 }),
  credit_days: integerField({ required: false, min: 0, max: 365, allowNegative: false }),
  currency_code: currencyCode(false),
  salesperson_id: optionalUuid(),
  portal_access: z.boolean().optional(),
  marketing_subscription: z.boolean().optional(),
  iata_code: iataCode(false),
  scac_code: optionalTextUndef({ max: 20 }),
  tags: z.array(z.string()).optional(),
  notes: optionalTextUndef({ max: 2000 }),
  is_active: z.boolean().optional(),
});

export const createPartySchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(createPartyObject, { required: false }),
  { taxIdKey: 'vat_number' },
);

export const updatePartySchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(createPartyObject.partial(), { required: false }),
  { taxIdKey: 'vat_number' },
);

export const createPartyContactSchema = z.object({
  name: requiredName(),
  designation: optionalTextUndef({ max: 100 }),
  phone: optionalPhone(),
  mobile: optionalPhone(),
  email: optionalEmail(),
  is_primary: z.boolean().optional(),
});

export const updatePartyContactSchema = createPartyContactSchema.partial();

const createPartyAddressObject = z.object({
  label: requiredText({ min: 1, max: 50 }),
  address_line1: requiredText({ min: 1, max: 300 }),
  address_line2: optionalTextUndef({ max: 300 }),
  city: optionalTextUndef({ max: 100 }),
  state: optionalTextUndef({ max: 100 }),
  postal_code: optionalTextUndef({ max: 20 }),
  country_code: countryCode(true),
  is_default: z.boolean().optional(),
});

export const createPartyAddressSchema = withPostalCountryRefine(createPartyAddressObject);

export const updatePartyAddressSchema = withPostalCountryRefine(createPartyAddressObject.partial());

export const updateCreditStatusSchema = z.object({
  credit_status: creditStatusSchema,
  reason: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
});

export type CreatePartyFormValues = z.infer<typeof createPartyObject>;
export type UpdatePartyFormValues = z.infer<typeof updatePartySchema>;
export type CreatePartyContactFormValues = z.infer<typeof createPartyContactSchema>;
export type CreatePartyAddressFormValues = z.infer<typeof createPartyAddressObject>;
export type UpdateCreditStatusFormValues = z.infer<typeof updateCreditStatusSchema>;

import { z } from 'zod';
import { withLocaleCatalogRefine } from '@/lib/locale';
import {
  countryCode,
  entityCode,
  optionalName,
  optionalText,
  requiredEmail,
  requiredName,
  requiredPhone,
  requiredText,
  withPhoneCountryRefine,
} from '@/lib/validation';

const createCompanyObject = z.object({
  code: entityCode(),
  name: requiredName(),
  legal_name: optionalName(),
  registration_number: optionalText({ max: 100 }),
  vat_number: optionalText({ max: 100 }),
  address: requiredText({ min: 1, max: 500 }),
  city: requiredText({ min: 2, max: 100 }),
  country_code: countryCode(true),
  phone: requiredPhone(),
  email: requiredEmail(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export const createCompanySchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(createCompanyObject, { required: true }),
  { taxIdKey: 'vat_number' },
);

export type CreateCompanyFormValues = z.infer<typeof createCompanyObject>;

const updateCompanyObject = createCompanyObject.omit({ code: true });

export const updateCompanySchema = withLocaleCatalogRefine(
  withPhoneCountryRefine(updateCompanyObject, { required: true }),
  { taxIdKey: 'vat_number' },
);

export type UpdateCompanyFormValues = z.infer<typeof updateCompanyObject>;

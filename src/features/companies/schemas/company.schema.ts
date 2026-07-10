import { z } from 'zod';

export const createCompanySchema = z.object({
  code: z.string().regex(/^[A-Z0-9-]{2,20}$/, 'Uppercase letters, numbers, hyphens only'),
  name: z.string().min(1, 'Required'),
  legal_name: z.string().optional().or(z.literal('')),
  registration_number: z.string().optional().or(z.literal('')),
  vat_number: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  country_code: z.string().regex(/^[A-Z]{2}$/, 'ISO 3166-1 alpha-2, e.g. AE'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Must be a valid email'),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.omit({ code: true });

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;

// PASTE THIS AT: src/features/tenants/schemas/tenant.schema.ts

import { z } from 'zod';

export const createTenantSchema = z.object({
  code: z.string().regex(/^[A-Z0-9-]{3,20}$/, 'Uppercase letters, numbers, hyphens only'),
  name: z.string().min(1, 'Required'),
  display_name: z.string().min(1, 'Required'),
  slug: z
    .string()
    .regex(
      /^\/[a-zA-Z0-9-]+\/$/,
      'Path-style slug with leading and trailing slashes, e.g. /abc-xyz/',
    ),
  password: z.string().min(8, 'At least 8 characters'),
  admin_first_name: z.string().min(1, 'Required'),
  admin_last_name: z.string().min(1, 'Required'),
  domain: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Must be a hex color'),
  language: z.string().min(1),
  base_currency: z.string().min(1),
  timezone: z.string().min(1),
  country_code: z.string().regex(/^[A-Z]{2}$/, 'ISO 3166-1 alpha-2, e.g. AE'),
  financial_year_start: z.number().int().min(1).max(12),
  vat_number: z.string().optional().or(z.literal('')),
  cr_number: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Must be a valid email'),
  company_code: z.string().min(1, 'Required'),
  company_name: z.string().min(1, 'Required'),
  company_legal_name: z.string().optional().or(z.literal('')),
  company_registration_number: z.string().optional().or(z.literal('')),
  subscription_plan: z.enum(['starter', 'growth', 'enterprise']),
  status: z.enum(['trial', 'active']),
  trial_ends: z.string().optional(),
  subscription_ends: z.string().optional(),
  max_users: z.number().int().min(1),
  max_branches: z.number().int().min(1),
  max_storage_gb: z.number().int().min(1),
  is_active: z.boolean(),
});

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;

// Edit mode never touches code/slug/password/admin identity — those are
// set once at provisioning time, not editable afterwards.
export const updateTenantSchema = createTenantSchema.omit({
  code: true,
  slug: true,
  password: true,
  admin_first_name: true,
  admin_last_name: true,
});

export type UpdateTenantFormValues = z.infer<typeof updateTenantSchema>;

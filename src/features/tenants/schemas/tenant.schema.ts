import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';

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

export const createTenantSchema = z.object({
  code: z.string().regex(/^[A-Z0-9-]{3,20}$/, 'Uppercase letters, numbers, hyphens only'),
  name: z.string().min(1, 'Required'),
  display_name: z.string().min(1, 'Required'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
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
  selected_company_id: z
    .string()
    .min(1, 'Select a company profile')
    .refine((value) => isUuid(value), 'Select a valid company'),
  company_code: z.string().min(1, 'Required'),
  company_name: z.string().min(1, 'Required'),
  company_legal_name: z.string().optional().or(z.literal('')),
  company_registration_number: z.string().optional().or(z.literal('')),
  subscription_plan: z.enum(SUBSCRIPTION_PLANS),
  status: z.enum(TENANT_STATUSES),
  trial_ends: z.string().optional(),
  subscription_ends: z.string().optional(),
  max_users: z.number().int().min(1),
  max_branches: z.number().int().min(1),
  max_storage_gb: z.number().int().min(1),
  is_active: z.boolean(),
});

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = createTenantSchema.omit({
  code: true,
  slug: true,
  password: true,
  admin_first_name: true,
  admin_last_name: true,
  selected_company_id: true,
});

export type UpdateTenantFormValues = z.infer<typeof updateTenantSchema>;

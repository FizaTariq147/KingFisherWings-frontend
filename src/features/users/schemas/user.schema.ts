import { z } from 'zod';
import {
  optionalPhone,
  optionalText,
  optionalUrlOrEmpty,
  requiredEmail,
  requiredName,
} from '@/lib/validation';
import {
  USER_ROLES,
  USER_SORT_FIELDS,
  USER_SORT_ORDERS,
  USER_STATUSES,
} from '../constants/user.constants';

const officeHoursRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalUuidOrEmpty = z.string().uuid().optional().or(z.literal(''));
const optionalPhoneOrEmpty = z.union([z.literal(''), optionalPhone()]);

const userFlagsSchema = z.object({
  is_salesperson: z.boolean().default(false),
  is_cs_rep: z.boolean().default(false),
  is_operations: z.boolean().default(false),
  is_finance: z.boolean().default(false),
  can_see_sales: z.boolean().default(false),
  can_see_cost: z.boolean().default(false),
  can_see_gp: z.boolean().default(false),
  can_see_invoices: z.boolean().default(false),
  can_see_payments: z.boolean().default(false),
  can_see_bank_balances: z.boolean().default(false),
  can_see_ar_ap: z.boolean().default(false),
  can_see_mgmt_reports: z.boolean().default(false),
  can_see_job_pnl: z.boolean().default(false),
});

const userSecuritySchema = z.object({
  allowed_ips: z.array(z.string()).default([]),
  allowed_mac_addresses: z.array(z.string()).default([]),
  office_hours_start: z
    .string()
    .regex(officeHoursRegex, 'Use 24h HH:mm format')
    .optional()
    .or(z.literal('')),
  office_hours_end: z
    .string()
    .regex(officeHoursRegex, 'Use 24h HH:mm format')
    .optional()
    .or(z.literal('')),
  office_hours_timezone: optionalText({ max: 64 }),
  two_factor_enabled: z.boolean().default(false),
  max_concurrent_sessions: z.number().int().min(1).max(20).default(3),
});

const userOrganizationSchema = z.object({
  tenant_id: z.string().uuid('Select a tenant workspace').optional().or(z.literal('')),
  company_id: optionalUuidOrEmpty,
  branch_id: optionalUuidOrEmpty,
  department_id: optionalUuidOrEmpty,
});

const userBasicSchema = z.object({
  email: requiredEmail(),
  first_name: requiredName(),
  last_name: requiredName(),
  phone: optionalPhoneOrEmpty.optional(),
  avatar_url: optionalUrlOrEmpty(),
});

const userRoleSchema = z.object({
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES).default('INVITED'),
  role_ids: z.array(z.string().uuid()).default([]),
  permission_ids: z.array(z.string().uuid()).default([]),
});

export const createUserSchema = userBasicSchema
  .merge(userOrganizationSchema)
  .merge(userRoleSchema)
  .merge(userFlagsSchema)
  .merge(userSecuritySchema);

export const updateUserSchema = createUserSchema
  .omit({ tenant_id: true })
  .partial()
  .extend({
    single_device_login: z.boolean().optional(),
    single_device_policy: z.enum(['TERMINATE_OLDEST', 'REJECT_NEW']).optional(),
  });

export const updateUserStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
  reason: optionalText({ max: 255 }),
});

export const userListParamsSchema = z.object({
  tenantId: z.string().uuid().optional().or(z.literal('')),
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  branch_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  sortBy: z.enum(USER_SORT_FIELDS).optional(),
  order: z.enum(USER_SORT_ORDERS).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>;

export {
  USER_ROLES,
  USER_STATUSES,
  USER_SORT_FIELDS,
  USER_SORT_ORDERS,
} from '../constants/user.constants';

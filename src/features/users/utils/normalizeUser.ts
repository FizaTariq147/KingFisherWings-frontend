import type { User } from '../types/user.types';

const BOOLEAN_DEFAULTS: Pick<
  User,
  | 'is_salesperson'
  | 'is_cs_rep'
  | 'is_operations'
  | 'is_finance'
  | 'can_see_sales'
  | 'can_see_cost'
  | 'can_see_gp'
  | 'can_see_invoices'
  | 'can_see_payments'
  | 'can_see_bank_balances'
  | 'can_see_ar_ap'
  | 'can_see_mgmt_reports'
  | 'can_see_job_pnl'
  | 'two_factor_enabled'
> = {
  is_salesperson: false,
  is_cs_rep: false,
  is_operations: false,
  is_finance: false,
  can_see_sales: false,
  can_see_cost: false,
  can_see_gp: false,
  can_see_invoices: false,
  can_see_payments: false,
  can_see_bank_balances: false,
  can_see_ar_ap: false,
  can_see_mgmt_reports: false,
  can_see_job_pnl: false,
  two_factor_enabled: false,
};

export function normalizeUser(raw: Record<string, unknown>): User {
  return {
    ...BOOLEAN_DEFAULTS,
    ...(raw as unknown as User),
    allowed_ips: Array.isArray(raw.allowed_ips) ? (raw.allowed_ips as string[]) : [],
    allowed_mac_addresses: Array.isArray(raw.allowed_mac_addresses)
      ? (raw.allowed_mac_addresses as string[])
      : [],
    role_ids: Array.isArray(raw.role_ids) ? (raw.role_ids as string[]) : [],
    permission_ids: Array.isArray(raw.permission_ids) ? (raw.permission_ids as string[]) : [],
    max_concurrent_sessions:
      typeof raw.max_concurrent_sessions === 'number' ? raw.max_concurrent_sessions : 3,
  };
}

export function normalizeUsers(raw: unknown): User[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeUser(item as Record<string, unknown>));
}

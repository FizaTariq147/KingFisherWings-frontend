import type { CreateUserFormValues } from '../types/user.types';
import type { User } from '../types/user.types';

export function userToFormValues(user: User): CreateUserFormValues {
  return {
    tenant_id: user.tenant_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? '',
    avatar_url: user.avatar_url ?? '',
    company_id: user.company_id ?? '',
    branch_id: user.branch_id ?? '',
    department_id: user.department_id ?? '',
    role: user.role,
    status: user.status,
    role_ids: user.role_ids ?? [],
    permission_ids: user.permission_ids ?? [],
    is_salesperson: user.is_salesperson,
    is_cs_rep: user.is_cs_rep,
    is_operations: user.is_operations,
    is_finance: user.is_finance,
    can_see_sales: user.can_see_sales,
    can_see_cost: user.can_see_cost,
    can_see_gp: user.can_see_gp,
    can_see_invoices: user.can_see_invoices,
    can_see_payments: user.can_see_payments,
    can_see_bank_balances: user.can_see_bank_balances,
    can_see_ar_ap: user.can_see_ar_ap,
    can_see_mgmt_reports: user.can_see_mgmt_reports,
    can_see_job_pnl: user.can_see_job_pnl,
    allowed_ips: user.allowed_ips ?? [],
    allowed_mac_addresses: user.allowed_mac_addresses ?? [],
    office_hours_start: user.office_hours_start ?? '',
    office_hours_end: user.office_hours_end ?? '',
    office_hours_timezone: user.office_hours_timezone ?? 'Asia/Dubai',
    max_concurrent_sessions: user.max_concurrent_sessions,
  };
}

export function formatUserLabel(user: Pick<User, 'first_name' | 'last_name' | 'email'>): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name ? `${name} (${user.email})` : user.email;
}

import type {
  UserRole,
  UserSortField,
  UserSortOrder,
  UserStatus,
} from '../constants/user.constants';
import type { UserFunctionalFlag, UserVisibilityPermission } from '../constants/userPermissions';
import type { CreateUserFormValues, UpdateUserFormValues } from '../schemas/user.schema';

export type { CreateUserFormValues, UpdateUserFormValues } from '../schemas/user.schema';

export interface UserFlags {
  is_salesperson: boolean;
  is_cs_rep: boolean;
  is_operations: boolean;
  is_finance: boolean;
}

export interface UserVisibility {
  can_see_sales: boolean;
  can_see_cost: boolean;
  can_see_gp: boolean;
  can_see_invoices: boolean;
  can_see_payments: boolean;
  can_see_bank_balances: boolean;
  can_see_ar_ap: boolean;
  can_see_mgmt_reports: boolean;
  can_see_job_pnl: boolean;
}

export interface UserSecurity {
  allowed_ips: string[];
  allowed_mac_addresses: string[];
  office_hours_start?: string;
  office_hours_end?: string;
  office_hours_timezone?: string;
  two_factor_enabled: boolean;
  max_concurrent_sessions: number;
}

export interface User extends UserFlags, UserVisibility, UserSecurity {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  company_id?: string;
  branch_id?: string;
  department_id?: string;
  role: UserRole;
  status: UserStatus;
  role_ids?: string[];
  permission_ids?: string[];
  email_verified?: boolean;
  must_change_password?: boolean;
  last_login_at?: string | null;
  locked_until?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by_user_id?: string;
  created_by_tenant_id?: string;
  created_by_super_admin_id?: string;
  single_device_login?: boolean;
  single_device_policy?: 'TERMINATE_OLDEST' | 'REJECT_NEW';
}

export type CreateUserDto = CreateUserFormValues;

export type UpdateUserDto = UpdateUserFormValues;

export interface UpdateUserStatusDto {
  status: UserStatus;
  reason?: string;
}

export interface UserListParams {
  tenantId: string;
  search?: string;
  role?: UserRole;
  /** API status filter (ACTIVE, INACTIVE, …). Ignored when lifecycle is `deleted`. */
  status?: UserStatus;
  /** UI lifecycle bar: all / active / inactive / deleted */
  lifecycle?: 'all' | 'active' | 'inactive' | 'deleted';
  branch_id?: string;
  department_id?: string;
  sortBy?: UserSortField;
  order?: UserSortOrder;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResult {
  users: User[];
  meta: PaginationMeta;
}

export interface CreateUserResult {
  user: User;
  temporary_password?: string;
}

export interface AdminResetPasswordResult {
  temporary_password?: string;
}

export type UserVisibilityField = UserVisibilityPermission;
export type UserFunctionalField = UserFunctionalFlag;

export type { CreateTenantFormValues, UpdateTenantFormValues } from '../schemas/tenant.schema';
import type { CreateTenantFormValues, UpdateTenantFormValues } from '../schemas/tenant.schema';

export type CreateTenantDto = CreateTenantFormValues;
export type UpdateTenantDto = UpdateTenantFormValues;

export interface Tenant extends CreateTenantFormValues {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  /** Runtime metrics — present when API provides them */
  total_users?: number;
  total_branches?: number;
  storage_used_gb?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TenantListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Client-side filter — not sent to API (Swagger only documents `search`). */
  status?: 'active' | 'inactive' | 'deleted';
  sortBy?: TenantListSortBy;
  order?: TenantListSortOrder;
}

/** Fields supported for tenant list sorting (API + client fallback). */
export type TenantListSortBy =
  | 'code'
  | 'display_name'
  | 'created_at'
  | 'subscription_plan'
  | 'max_users'
  | 'is_active';

export type TenantListSortOrder = 'asc' | 'desc';

export const DEFAULT_TENANT_LIST_SORT: TenantListSortBy = 'created_at';
export const DEFAULT_TENANT_LIST_ORDER: TenantListSortOrder = 'desc';

export interface TenantStatistics {
  total: number;
  active: number;
  inactive: number;
  trial: number;
  mrr: number;
}

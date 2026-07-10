import type { TenantListSortBy } from '../../types/tenant.types';

export interface TenantTableColumn {
  key:
    | TenantListSortBy
    | 'company_name'
    | 'tenant_name'
    | 'domain'
    | 'plan'
    | 'status'
    | 'total_users'
    | 'total_branches'
    | 'storage_usage'
    | 'actions';
  label: string;
  sortable?: boolean;
  className?: string;
}

export const TENANT_TABLE_COLUMNS: TenantTableColumn[] = [
  { key: 'company_name', label: 'Company Name', className: 'min-w-[140px]' },
  { key: 'tenant_name', label: 'Tenant Name', sortable: true, className: 'min-w-[140px]' },
  { key: 'domain', label: 'Domain', className: 'hidden xl:table-cell' },
  { key: 'plan', label: 'Subscription Plan', className: 'hidden md:table-cell' },
  { key: 'status', label: 'Status' },
  { key: 'total_users', label: 'Total Users', className: 'hidden lg:table-cell' },
  { key: 'max_users', label: 'Max Users', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'total_branches', label: 'Total Branches', className: 'hidden xl:table-cell' },
  { key: 'storage_usage', label: 'Storage Usage', className: 'hidden xl:table-cell' },
  { key: 'actions', label: 'Actions', className: 'text-right' },
];

export function isSortableColumn(key: string): key is TenantListSortBy {
  return ['code', 'display_name', 'created_at', 'max_users', 'subscription_plan', 'is_active'].includes(
    key,
  );
}

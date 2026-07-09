import type { TenantListSortBy } from '../../types/tenant.types';

export interface TenantTableColumn {
  key: TenantListSortBy | 'plan' | 'status' | 'actions';
  label: string;
  sortable?: boolean;
  className?: string;
}

export const TENANT_TABLE_COLUMNS: TenantTableColumn[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'display_name', label: 'Company', sortable: true },
  { key: 'plan', label: 'Plan', className: 'hidden md:table-cell' },
  { key: 'status', label: 'Status' },
  { key: 'max_users', label: 'Users', sortable: true, className: 'hidden sm:table-cell' },
  { key: 'created_at', label: 'Created', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'actions', label: 'Actions', className: 'text-right' },
];

export function isSortableColumn(key: string): key is TenantListSortBy {
  return ['code', 'display_name', 'created_at', 'max_users', 'subscription_plan', 'is_active'].includes(key);
}

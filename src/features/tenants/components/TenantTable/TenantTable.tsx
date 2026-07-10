import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { PaginationMeta, Tenant, TenantListSortBy, TenantListSortOrder } from '../../types/tenant.types';
import { TenantStatusBadge } from '../TenantStatusBadge';
import { TenantActionMenu } from '../TenantActionMenu';
import { TenantListPagination } from '../TenantListPagination';
import { isSortableColumn, TENANT_TABLE_COLUMNS } from './TenantTableColumns';
import { formatTenantSlug } from '../../utils/formatTenantSlug';
import { formatStorageUsage, getTenantMetric } from '../../utils/tenantMetrics';

interface TenantTableProps {
  tenants: Tenant[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  sortBy?: TenantListSortBy;
  order?: TenantListSortOrder;
  onSort?: (field: TenantListSortBy) => void;
  onActivate: (t: Tenant) => void;
  onDeactivate: (t: Tenant) => void;
  onDelete: (t: Tenant) => void;
  onRestore: (t: Tenant) => void;
  pendingActionId?: string | null;
}

export function TenantTable({
  tenants,
  isFetching,
  meta,
  onPage,
  sortBy,
  order,
  onSort,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  pendingActionId,
}: TenantTableProps) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[var(--color-primary-100)]">
          <div className="h-full w-1/3 bg-[var(--color-primary-500)] animate-pulse" />
        </div>
      )}
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {TENANT_TABLE_COLUMNS.map((col) => {
              const sortKey =
                col.key === 'tenant_name'
                  ? ('display_name' as TenantListSortBy)
                  : isSortableColumn(col.key)
                    ? col.key
                    : null;
              return (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable && onSort && sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(sortKey)}
                      className="inline-flex items-center gap-1 hover:text-[var(--color-neutral-800)] transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown
                        size={12}
                        className={
                          sortBy === sortKey
                            ? 'text-[var(--color-primary-600)]'
                            : 'text-[var(--color-neutral-400)]'
                        }
                        style={
                          sortBy === sortKey && order === 'desc'
                            ? { transform: 'scaleY(-1)' }
                            : undefined
                        }
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <td
                colSpan={TENANT_TABLE_COLUMNS.length}
                className="px-4 py-12 text-center text-sm text-[var(--color-neutral-400)]"
              >
                No tenants found
              </td>
            </TableRow>
          )}
          {tenants.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <p className="font-medium text-[var(--color-neutral-800)]">
                  {t.company_name || '—'}
                </p>
                {t.company_code ? (
                  <p className="text-xs font-mono text-[var(--color-neutral-400)]">{t.company_code}</p>
                ) : null}
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/tenants/${t.id}`)}
                  className="text-left"
                >
                  <p className="font-medium text-[var(--color-neutral-800)] hover:text-[var(--color-primary-600)] transition-colors">
                    {t.display_name || t.name}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)]">{formatTenantSlug(t.slug)}</p>
                </button>
              </TableCell>
              <TableCell className="hidden xl:table-cell text-sm text-[var(--color-neutral-600)]">
                {t.domain || '—'}
              </TableCell>
              <TableCell className="hidden md:table-cell capitalize">
                {String(t.subscription_plan)}
              </TableCell>
              <TableCell>
                <TenantStatusBadge tenant={t} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {getTenantMetric(t, 'total_users')}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{t.max_users}</TableCell>
              <TableCell className="hidden xl:table-cell">
                {getTenantMetric(t, 'total_branches')}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-xs text-[var(--color-neutral-600)]">
                {formatStorageUsage(t)}
              </TableCell>
              <TableCell className="text-right">
                <TenantActionMenu
                  tenant={t}
                  disabled={pendingActionId === t.id}
                  onView={(tenant) => navigate(`/superadmin/tenants/${tenant.id}`)}
                  onEdit={(tenant) => navigate(`/superadmin/tenants/${tenant.id}/edit`)}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                  onRestore={onRestore}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && onPage && <TenantListPagination meta={meta} onPage={onPage} />}
    </div>
  );
}

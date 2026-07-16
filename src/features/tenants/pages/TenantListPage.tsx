import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NO_COMPANY_BEFORE_TENANT_MESSAGE } from '@/features/platform/constants/onboarding';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { useCompanyRegistry } from '@/features/companies/hooks/useCompanies';
import { TenantConfirmModal } from '../components/TenantConfirmModal';
import { TenantStatsCards } from '../components/TenantStatsCards';
import { TenantFilters } from '../components/TenantFilters';
import { TenantTable } from '../components/TenantTable';
import { TenantTableSkeleton } from '../components/TenantTableSkeleton';
import { useTenantConfirmState } from '../hooks/useTenantConfirmState';
import { useTenantsList, useTenantStatistics, useTenantMutations } from '../hooks/useTenants';
import { useSyncAllTenantPermissions } from '../hooks/useTenantMutations';
import type { Tenant } from '../types/tenant.types';
import type { TenantStatusFilter } from '../utils/filterTenants';
import {
  DEFAULT_TENANT_LIST_ORDER,
  DEFAULT_TENANT_LIST_SORT,
  type TenantListSortBy,
  type TenantListSortOrder,
} from '../types/tenant.types';
import { formatTenantLabel } from '../utils/formatTenantSlug';
import { EMPTY_TENANT_STATISTICS } from '../utils/normalizeTenantStatistics';

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function TenantListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TenantStatusFilter | 'all'>('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<TenantListSortBy>(DEFAULT_TENANT_LIST_SORT);
  const [order, setOrder] = useState<TenantListSortOrder>(DEFAULT_TENANT_LIST_ORDER);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useTenantConfirmState();

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sortBy, order]);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
    sortBy,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useTenantsList(listParams);
  const { data: stats, isLoading: statsLoading } = useTenantStatistics();
  const { activateTenant, deactivateTenant, deleteTenant, restoreTenant } = useTenantMutations();
  const syncAllPermissions = useSyncAllTenantPermissions();
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const { data: companiesData } = useCompanyRegistry({ limit: 1 });
  const hasCompany =
    draftCompanies.length > 0 || (companiesData?.companies.length ?? 0) > 0;

  const tenants = data?.tenants ?? [];
  const meta = data?.meta;
  const totalCount = meta?.total ?? stats?.total ?? 0;

  const handleSort = (field: TenantListSortBy) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setActionError(null);
    setPendingActionId(id);
    try {
      await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed. Please try again.';
      setActionError(message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleActivate = (t: Tenant) => runAction(t.id, () => activateTenant.mutateAsync(t.id));
  const handleDeactivate = (t: Tenant) => requestConfirm('deactivate', t);
  const handleRestore = (t: Tenant) => requestConfirm('restore', t);
  const handleDelete = (t: Tenant) => requestConfirm('delete', t);

  const handleConfirmAction = async () => {
    if (!confirm) return;
    const { action, tenant } = confirm;
    const mutation =
      action === 'delete'
        ? () => deleteTenant.mutateAsync({ id: tenant.id, tenant })
        : action === 'deactivate'
          ? () => deactivateTenant.mutateAsync(tenant.id)
          : () => restoreTenant.mutateAsync(tenant.id);

    setActionError(null);
    setPendingActionId(tenant.id);
    try {
      await mutation();
      closeConfirm();
      if (action === 'delete') setStatus('deleted');
      if (action === 'restore') setStatus('all');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed. Please try again.';
      setActionError(message);
    } finally {
      setPendingActionId(null);
    }
  };

  const listErrorMessage =
    error instanceof Error ? error.message : isError ? 'Failed to load tenants.' : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Tenants</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">
            {totalCount} workspace{totalCount === 1 ? '' : 's'}
            {status === 'deleted' ? ' deleted' : ''} on KINGFISHER WINGS LOGISTIC
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={syncAllPermissions.isPending}
            onClick={async () => {
              setActionError(null);
              setSyncNotice(null);
              try {
                await syncAllPermissions.mutateAsync();
                setSyncNotice(
                  'Permissions synced for all tenants. Tenant Admins must sign out and sign back in so gl.manage_coa / gl.manage_payments appear in their token.',
                );
              } catch (err) {
                setActionError(
                  err instanceof Error ? err.message : 'Sync permissions failed. Please try again.',
                );
              }
            }}
          >
            {syncAllPermissions.isPending ? 'Syncing…' : 'Sync all permissions'}
          </Button>
          <Button
            onClick={() =>
              navigate(hasCompany ? '/superadmin/tenants/new' : '/superadmin/companies/new')
            }
            className="w-full sm:w-auto"
          >
            {hasCompany ? '+ New Tenant' : '+ Create Company First'}
          </Button>
        </div>
      </div>

      {!hasCompany && (
        <Card className="p-4 text-sm text-[var(--color-neutral-600)]">
          {NO_COMPANY_BEFORE_TENANT_MESSAGE}
        </Card>
      )}

      <TenantStatsCards
        stats={stats ?? EMPTY_TENANT_STATISTICS}
        isLoading={statsLoading}
      />

      <TenantFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{listErrorMessage}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {syncNotice && (
        <div
          role="status"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-success-100, #ECFDF5)',
            borderColor: '#A7F3D0',
            color: 'var(--color-success-800, #065F46)',
          }}
        >
          {syncNotice}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {isLoading ? (
        <TenantTableSkeleton />
      ) : (
        <Card padding="none">
          <TenantTable
            tenants={tenants}
            isFetching={isFetching}
            meta={!isError ? meta : undefined}
            onPage={setPage}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            pendingActionId={pendingActionId}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </Card>
      )}

      {confirm && (
        <TenantConfirmModal
          open
          action={confirm.action}
          tenantName={formatTenantLabel(confirm.tenant)}
          isPending={pendingActionId === confirm.tenant.id}
          onConfirm={handleConfirmAction}
          onClose={closeConfirm}
        />
      )}
    </div>
  );
}

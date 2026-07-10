import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { CompanyConfirmModal } from '../components/CompanyConfirmModal';
import { CompanyFilters } from '../components/CompanyFilters';
import { CompanyTable } from '../components/CompanyTable';
import { useCompanyRegistry, useDeleteCompany } from '../hooks/useCompanies';
import { useSetCompanyActive } from '../hooks/useCompanyMutations';
import { useCompanyTenantScope } from '../hooks/useCompanyTenantScope';
import type { RegistryCompany } from '../services/companyRegistry.service';
import { mergeDraftCompaniesIntoList, type CompanyListItem } from '../utils/mergeDraftCompanies';
import type { CompanyStatusFilter } from '../utils/filterCompanies';
import type { CompanyConfirmAction } from '../components/CompanyConfirmModal';

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function companyDetailPath(company: RegistryCompany) {
  return `/superadmin/companies/${company.id}?tenant=${company.tenant_id}`;
}

export default function CompanyListPage() {
  const navigate = useNavigate();
  const { companyPath } = useCompanyTenantScope();
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const removeDraftCompany = usePlatformOnboardingStore((s) => s.removeDraftCompany);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CompanyStatusFilter | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    company: CompanyListItem;
    action: CompanyConfirmAction;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useCompanyRegistry(listParams);
  const activeTenantId =
    confirmTarget && !confirmTarget.company.is_draft ? confirmTarget.company.tenant_id : '';
  const deleteCompany = useDeleteCompany(activeTenantId);
  const setCompanyActive = useSetCompanyActive(activeTenantId);

  const companies = useMemo(
    () =>
      mergeDraftCompaniesIntoList(data?.companies ?? [], draftCompanies, {
        search: listParams.search,
        status: listParams.status,
      }),
    [data?.companies, draftCompanies, listParams.search, listParams.status],
  );

  const meta = data?.meta;

  const handleDelete = (company: CompanyListItem) =>
    setConfirmTarget({ company, action: 'delete' });
  const handleActivate = (company: CompanyListItem) =>
    setConfirmTarget({ company, action: 'activate' });
  const handleDeactivate = (company: CompanyListItem) =>
    setConfirmTarget({ company, action: 'deactivate' });

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    const { company, action } = confirmTarget;
    setActionError(null);
    setPendingActionId(company.id);

    try {
      if (action === 'delete') {
        if (company.is_draft) {
          removeDraftCompany(company.id);
          setConfirmTarget(null);
          return;
        }
        await deleteCompany.mutateAsync(company.id);
      } else if (!company.is_draft) {
        await setCompanyActive.mutateAsync({
          id: company.id,
          is_active: action === 'activate',
        });
      }
      setConfirmTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setActionError(message);
    } finally {
      setPendingActionId(null);
    }
  };

  const listErrorMessage =
    error instanceof Error ? error.message : isError ? 'Failed to load companies.' : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Companies</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">
            Step 1 — register company profiles, then link them when creating tenants
          </p>
        </div>
        <Button onClick={() => navigate(companyPath('/new'))} className="w-full sm:w-auto">
          + New Company
        </Button>
      </div>

      <CompanyFilters
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

      {isLoading && companies.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[var(--color-neutral-400)]">
          Loading companies…
        </Card>
      ) : (
        <Card padding="none">
          <CompanyTable
            companies={companies}
            meta={!isError ? meta : undefined}
            isFetching={isFetching}
            pendingActionId={pendingActionId}
            showTenant
            onPage={setPage}
            onView={(c) => {
              if (c.is_draft) {
                navigate('/superadmin/companies/new');
                return;
              }
              navigate(companyDetailPath(c as RegistryCompany));
            }}
            onEdit={(c) => {
              if (c.is_draft) {
                navigate('/superadmin/companies/new');
                return;
              }
              navigate(`${companyDetailPath(c as RegistryCompany)}/edit`);
            }}
            onDelete={handleDelete}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onContinueSetup={(c) => navigate('/superadmin/tenants/new')}
            detailPath={(id) => {
              const company = companies.find((c) => c.id === id);
              if (!company || company.is_draft) return '/superadmin/companies/new';
              return companyDetailPath(company as RegistryCompany);
            }}
          />
        </Card>
      )}

      {confirmTarget && (
        <CompanyConfirmModal
          open
          action={confirmTarget.action}
          companyName={confirmTarget.company.name}
          isDefault={confirmTarget.company.is_default}
          isPending={pendingActionId === confirmTarget.company.id}
          onConfirm={handleConfirmAction}
          onClose={() => !pendingActionId && setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

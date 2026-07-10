import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CompanyConfirmModal } from '../components/CompanyConfirmModal';
import { CompanyOverviewPanel } from '../components/CompanyOverviewPanel';
import { CompanyDefaultBadge, CompanyStatusBadge } from '../components/CompanyStatusBadge';
import { CompanyTenantSelector } from '../components/CompanyTenantSelector';
import { useCompany, useDeleteCompany } from '../hooks/useCompanies';
import { useSetCompanyActive } from '../hooks/useCompanyMutations';
import { useCompanyTenantScope } from '../hooks/useCompanyTenantScope';
import type { CompanyConfirmAction } from '../components/CompanyConfirmModal';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId, companiesBasePath, companyPath } = useCompanyTenantScope();
  const { data: company, isLoading, isError, error, refetch } = useCompany(tenantId, id!);
  const deleteCompany = useDeleteCompany(tenantId);
  const setCompanyActive = useSetCompanyActive(tenantId);
  const [confirmAction, setConfirmAction] = useState<CompanyConfirmAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!tenantId) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <CompanyTenantSelector />
        </Card>
        <Card className="p-6 text-sm text-[var(--color-neutral-500)]">
          Select a tenant workspace to view company details.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading company…</p>;
  }

  if (isError || !company) {
    const message = error instanceof Error ? error.message : 'Failed to load company.';
    return (
      <div className="space-y-4">
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
            <span>{message}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(companiesBasePath)}>
          ← Back to companies
        </Button>
      </div>
    );
  }

  const isDeleted = !!company.deleted_at;
  const isActive = company.is_active !== false;

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionError(null);
    setPending(true);
    try {
      if (confirmAction === 'delete') {
        await deleteCompany.mutateAsync(id!);
        setConfirmAction(null);
        navigate(companiesBasePath);
        return;
      }
      await setCompanyActive.mutateAsync({
        id: id!,
        is_active: confirmAction === 'activate',
      });
      setConfirmAction(null);
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setActionError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(companiesBasePath)}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to companies
      </button>

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{company.name}</h2>
            <CompanyStatusBadge company={company} />
            <CompanyDefaultBadge isDefault={company.is_default} />
          </div>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5 font-mono">{company.code}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <Button variant="secondary" onClick={() => navigate(companyPath(`/${id}/edit`))}>
              Edit
            </Button>
          )}
          {!isDeleted && isActive && (
            <Button variant="secondary" onClick={() => setConfirmAction('deactivate')} disabled={pending}>
              Deactivate
            </Button>
          )}
          {!isDeleted && !isActive && (
            <Button onClick={() => setConfirmAction('activate')} disabled={pending}>
              Activate
            </Button>
          )}
          {!isDeleted && (
            <Button variant="danger" onClick={() => setConfirmAction('delete')} disabled={pending}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CompanyOverviewPanel company={company} />
        </div>
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Quick summary</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-neutral-500)]">Email</dt>
              <dd className="text-right text-[var(--color-neutral-800)]">{company.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-neutral-500)]">Phone</dt>
              <dd className="text-right text-[var(--color-neutral-800)]">{company.phone}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-neutral-500)]">Location</dt>
              <dd className="text-right text-[var(--color-neutral-800)]">
                {company.city}, {company.country_code}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {confirmAction && (
        <CompanyConfirmModal
          open
          action={confirmAction}
          companyName={company.name}
          isDefault={company.is_default}
          isPending={pending}
          onConfirm={handleConfirm}
          onClose={() => !pending && setConfirmAction(null)}
        />
      )}
    </div>
  );
}

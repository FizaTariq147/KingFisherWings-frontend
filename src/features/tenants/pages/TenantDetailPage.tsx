import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, CreditCard, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { TenantConfirmModal } from '../components/TenantConfirmModal';
import { TenantDetailSkeleton } from '../components/TenantDetailSkeleton';
import { TenantOverviewPanel } from '../components/TenantOverviewPanel';
import { TenantStatusBadge } from '../components/TenantStatusBadge';
import { useTenantConfirmState } from '../hooks/useTenantConfirmState';
import {
  useTenant,
  useActivateTenant,
  useDeactivateTenant,
  useDeleteTenant,
  useRestoreTenant,
  useSyncTenantPermissions,
} from '../hooks/useTenants';
import { formatTenantLabel, formatTenantSlug } from '../utils/formatTenantSlug';
import { formatStorageUsage } from '../utils/tenantMetrics';
import type { Tenant } from '../types/tenant.types';

interface TenantCreateLocationState {
  fromTenantCreate?: boolean;
  tenantLoginSlug?: string;
  tenantLoginPassword?: string;
  tenantLoginEmail?: string;
  loginVerifyOk?: boolean;
  loginVerifyVia?: 'staff' | 'tenant';
  loginVerifyMessage?: string;
}

export default function TenantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const createState = (location.state as TenantCreateLocationState | null) ?? null;
  const [showCreateCreds, setShowCreateCreds] = useState(
    Boolean(createState?.fromTenantCreate && createState.tenantLoginSlug),
  );
  const { data: tenant, isLoading, isError, error, refetch } = useTenant(id!);
  const activate = useActivateTenant();
  const deactivate = useDeactivateTenant();
  const del = useDeleteTenant();
  const restore = useRestoreTenant();
  const syncPermissions = useSyncTenantPermissions();
  const { confirm, requestConfirm, closeConfirm } = useTenantConfirmState();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);

  const runAction = async (action: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPendingAction(true);
    try {
      await action();
      if (successMsg) setActionMessage(successMsg);
      closeConfirm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed. Please try again.';
      setActionError(message);
    } finally {
      setPendingAction(false);
    }
  };

  if (isLoading) {
    return <TenantDetailSkeleton />;
  }

  if (isError || !tenant) {
    const message = error instanceof Error ? error.message : 'Failed to load tenant.';
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
        <Button variant="secondary" size="sm" onClick={() => navigate('/superadmin/tenants')}>
          ← Back to tenants
        </Button>
      </div>
    );
  }

  const isDeleted = !!tenant.deleted_at;

  const actions = [
    !isDeleted && {
      label: 'Companies',
      onClick: () => navigate('/superadmin/companies'),
      variant: 'secondary' as const,
    },
    !isDeleted && {
      label: 'Manage subscription',
      onClick: () => navigate(`/superadmin/tenants/${id}/edit`),
      variant: 'secondary' as const,
    },
    !isDeleted && {
      label: 'Edit',
      onClick: () => navigate(`/superadmin/tenants/${id}/edit`),
      variant: 'secondary' as const,
    },
    !isDeleted && {
      label: 'Sync permissions',
      onClick: () =>
        runAction(
          () => syncPermissions.mutateAsync(id!),
          'Permissions synced. Have the Tenant Admin sign out and sign back in so new keys (e.g. portal.manage_users, gl.manage_coa, nvocc.manage) appear in their token.',
        ),
      variant: 'secondary' as const,
    },
    isDeleted
      ? {
          label: 'Restore',
          onClick: () => requestConfirm('restore', tenant),
          variant: 'primary' as const,
        }
      : tenant.is_active
        ? {
            label: 'Deactivate',
            onClick: () => requestConfirm('deactivate', tenant),
            variant: 'secondary' as const,
          }
        : {
            label: 'Activate',
            onClick: () => runAction(() => activate.mutateAsync(id!)),
            variant: 'primary' as const,
          },
    !isDeleted && {
      label: 'Delete',
      onClick: () => requestConfirm('delete', tenant),
      variant: 'danger' as const,
    },
  ].filter(Boolean) as {
    label: string;
    onClick: () => void;
    variant: 'primary' | 'secondary' | 'danger';
  }[];

  const handleConfirmAction = () => {
    if (!confirm || !id) return;
    const mutation =
      confirm.action === 'delete'
        ? async () => {
            await del.mutateAsync({ id, tenant });
            navigate('/superadmin/tenants');
          }
        : confirm.action === 'deactivate'
          ? () => deactivate.mutateAsync(id)
          : async () => {
              await restore.mutateAsync(id);
              navigate('/superadmin/tenants');
            };
    runAction(mutation);
  };

  const statusTone = isDeleted ? 'rose' : tenant.is_active ? 'emerald' : 'slate';

  return (
    <>
      {showCreateCreds && createState?.tenantLoginSlug && (
        <Card className="mb-4 p-4 space-y-3 border-[var(--color-primary-200)] bg-[var(--color-primary-50)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                Tenant Admin login credentials
              </h3>
              <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                Tenant Admin uses <strong className="font-semibold text-[var(--color-neutral-700)]">slug + password only</strong> (no email) on ERP Login → Tenant Admin. Save the password now — it is not shown again.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowCreateCreds(false);
                navigate(location.pathname, { replace: true, state: null });
              }}
            >
              Dismiss
            </Button>
          </div>

          {createState.loginVerifyOk === true && (
            <p className="text-xs text-emerald-700">
              Verified against API via tenant-login (slug + password).
              These credentials work.
            </p>
          )}
          {createState.loginVerifyOk === false && (
            <p className="text-xs text-[var(--color-danger-700)]">
              Tenant was created, but API login verification failed
              {createState.loginVerifyMessage ? `: ${createState.loginVerifyMessage}` : '.'}
              {' '}This is a backend credential issue — the password was not accepted for login right after create.
            </p>
          )}

          <dl className="grid gap-2 text-sm font-mono">
            <div className="flex flex-wrap gap-2">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Slug</dt>
              <dd className="text-[var(--color-neutral-800)]">{createState.tenantLoginSlug}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Password</dt>
              <dd className="text-[var(--color-neutral-800)]">{createState.tenantLoginPassword || '—'}</dd>
            </div>
            {createState.tenantLoginEmail && (
              <div className="flex flex-wrap gap-2">
                <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Admin email</dt>
                <dd className="text-[var(--color-neutral-800)]">
                  {createState.tenantLoginEmail}
                  <span className="block font-sans text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                    For Staff / User login only — not used by Tenant Admin
                  </span>
                </dd>
              </div>
            )}
          </dl>
          <Button type="button" size="sm" onClick={() => navigate('/login')}>
            Open ERP login
          </Button>
        </Card>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
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
      {actionMessage && (
        <div
          role="status"
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-success-100, #ECFDF5)',
            borderColor: '#A7F3D0',
            color: 'var(--color-success-700, #047857)',
          }}
        >
          {actionMessage}
        </div>
      )}

      <DetailPageTemplate
        title={tenant.display_name}
        subtitle={`${tenant.code} · ${formatTenantSlug(tenant.slug)} · ${tenant.company_name || 'No company name'}`}
        statusLabel={isDeleted ? 'Deleted' : tenant.is_active ? 'Active' : 'Inactive'}
        statusTone={statusTone}
        onBack={() => navigate('/superadmin/tenants')}
        backLabel="Back to tenants"
        actions={actions}
        actionsDisabled={pendingAction}
        sidebar={
          <Card>
            <CardHeader className="mb-0 pb-3">
              <CardTitle>Quick summary</CardTitle>
            </CardHeader>
            <dl className="space-y-3 text-sm">
              <SummaryItem label="Status">
                <TenantStatusBadge tenant={tenant} />
              </SummaryItem>
              <SummaryItem label="Company" value={tenant.company_name || '—'} />
              <SummaryItem label="Plan" value={String(tenant.subscription_plan)} />
              <SummaryItem
                label="Users"
                value={`${typeof tenant.total_users === 'number' ? tenant.total_users : '—'} / ${tenant.max_users}`}
              />
              <SummaryItem label="Branches" value={String(tenant.max_branches)} />
              <SummaryItem label="Storage" value={formatStorageUsage(tenant)} />
              <SummaryItem label="Country" value={tenant.country_code} />
            </dl>
          </Card>
        }
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <TenantOverviewPanel tenant={tenant} />,
          },
          {
            key: 'metrics',
            label: 'Metrics',
            content: <TenantMetricsPanel tenant={tenant} />,
          },
          {
            key: 'subscription',
            label: 'Subscription',
            content: (
              <SubscriptionTab
                tenant={tenant}
                onManage={() => navigate(`/superadmin/tenants/${id}/edit`)}
              />
            ),
          },
        ]}
      />

      {confirm && (
        <TenantConfirmModal
          open
          action={confirm.action}
          tenantName={formatTenantLabel(confirm.tenant)}
          isPending={pendingAction}
          onConfirm={handleConfirmAction}
          onClose={closeConfirm}
        />
      )}
    </>
  );
}

function SummaryItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[var(--color-neutral-500)]">{label}</dt>
      <dd className="font-medium text-[var(--color-neutral-800)] capitalize">
        {children ?? value ?? '—'}
      </dd>
    </div>
  );
}

function TenantMetricsPanel({ tenant }: { tenant: Tenant }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        label="Total users"
        value={typeof tenant.total_users === 'number' ? String(tenant.total_users) : '—'}
        hint={`Limit ${tenant.max_users}`}
      />
      <MetricCard
        label="Subscription"
        value={String(tenant.subscription_plan)}
        hint={String(tenant.status)}
      />
      <MetricCard
        label="Storage"
        value={formatStorageUsage(tenant)}
        hint={`Limit ${tenant.max_storage_gb} GB`}
      />
      <MetricCard
        label="Branch limit"
        value={String(tenant.max_branches)}
        hint={
          typeof tenant.total_branches === 'number'
            ? `${tenant.total_branches} in use`
            : 'Usage not reported by API'
        }
      />
      <MetricCard
        label="Tenant status"
        value={tenant.is_active ? 'Active' : 'Inactive'}
        hint={tenant.deleted_at ? 'Soft-deleted' : tenant.domain || 'No custom domain'}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-neutral-100)' }}
        >
          <Gauge size={16} className="text-[var(--color-neutral-500)]" />
        </div>
        <div>
          <p className="text-xs text-[var(--color-neutral-500)]">{label}</p>
          <p className="text-sm font-semibold text-[var(--color-neutral-800)] mt-0.5 capitalize">
            {value}
          </p>
          {hint && <p className="text-xs text-[var(--color-neutral-400)] mt-1">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}

function SubscriptionTab({
  tenant,
  onManage,
}: {
  tenant: Tenant;
  onManage: () => void;
}) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-neutral-100)' }}
        >
          <CreditCard size={20} className="text-[var(--color-neutral-400)]" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-neutral-800)]">
            {String(tenant.subscription_plan)} · {String(tenant.status)}
          </p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            Trial ends: {tenant.trial_ends ? new Date(tenant.trial_ends).toLocaleDateString() : '—'}
            {' · '}
            Subscription ends:{' '}
            {tenant.subscription_ends
              ? new Date(tenant.subscription_ends).toLocaleDateString()
              : '—'}
          </p>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Update plan, limits, and dates from the tenant edit form.
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={onManage}>
        Manage subscription
      </Button>
    </Card>
  );
}

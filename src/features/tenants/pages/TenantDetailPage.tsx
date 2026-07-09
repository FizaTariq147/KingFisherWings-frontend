import { useState, type ComponentType, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, Users, CreditCard } from 'lucide-react';
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
} from '../hooks/useTenants';
import { formatTenantSlug } from '../utils/formatTenantSlug';

export default function TenantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tenant, isLoading, isError, error, refetch } = useTenant(id!);
  const activate = useActivateTenant();
  const deactivate = useDeactivateTenant();
  const del = useDeleteTenant();
  const restore = useRestoreTenant();
  const { confirm, requestConfirm, closeConfirm } = useTenantConfirmState();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setPendingAction(true);
    try {
      await action();
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
      label: 'Edit',
      onClick: () => navigate(`/superadmin/tenants/${id}/edit`),
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
  ].filter(Boolean) as { label: string; onClick: () => void; variant: 'primary' | 'secondary' | 'danger' }[];

  const handleConfirmAction = () => {
    if (!confirm || !id) return;
    const mutation =
      confirm.action === 'delete'
        ? () => del.mutateAsync(id)
        : confirm.action === 'deactivate'
          ? () => deactivate.mutateAsync(id)
          : () => restore.mutateAsync(id);
    runAction(mutation);
  };

  const statusTone = isDeleted ? 'rose' : tenant.is_active ? 'emerald' : 'slate';

  return (
    <>
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

      <DetailPageTemplate
        title={tenant.display_name}
        subtitle={`${tenant.code} · ${formatTenantSlug(tenant.slug)}`}
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
              <SummaryItem label="Plan" value={String(tenant.subscription_plan)} />
              <SummaryItem label="Users allowed" value={String(tenant.max_users)} />
              <SummaryItem label="Storage" value={`${tenant.max_storage_gb} GB`} />
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
            key: 'users',
            label: 'Users',
            content: <PlaceholderTab icon={Users} title="Tenant users" />,
          },
          {
            key: 'billing',
            label: 'Billing',
            content: <PlaceholderTab icon={CreditCard} title="Billing" />,
          },
        ]}
      />

      {confirm && (
        <TenantConfirmModal
          open
          action={confirm.action}
          tenantName={confirm.tenant.display_name}
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

function PlaceholderTab({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'var(--color-neutral-100)' }}
      >
        <Icon size={20} className="text-[var(--color-neutral-400)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-neutral-700)]">{title}</p>
      <p className="text-xs text-[var(--color-neutral-400)] mt-1 max-w-sm">
        This section will be available once the backend API is implemented.
      </p>
    </Card>
  );
}

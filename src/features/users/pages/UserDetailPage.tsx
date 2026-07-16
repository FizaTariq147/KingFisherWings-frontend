import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { UserConfirmModal } from '../components/UserConfirmModal';
import { UserDetailSkeleton } from '../components/UserDetailSkeleton';
import { UserOverviewPanel } from '../components/UserOverviewPanel';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { useUserConfirmState } from '../hooks/useUserConfirmState';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import { useUser } from '../hooks/useUsers';
import {
  useDeleteUser,
  useRestoreUser,
  useUpdateUserStatus,
} from '../hooks/useUsers';
import { userService } from '../services/user.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatUserRole } from '../utils/formatUserRole';
import { formatUserLabel } from '../utils/userToFormValues';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const { data: user, isLoading, isError, error, refetch } = useUser(tenantId, id!);
  const deleteUser = useDeleteUser();
  const updateUserStatus = useUpdateUserStatus();
  const restoreUser = useRestoreUser();
  const { confirm, requestConfirm, closeConfirm } = useUserConfirmState();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [resetPassword, setResetPassword] = useState<string | null>(null);

  const scopeTenantId = tenantId || 'session';

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setPendingAction(true);
    try {
      await action();
      closeConfirm();
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Action failed. Please try again.');
    } finally {
      setPendingAction(false);
    }
  };

  if (!tenantId && !sessionScoped) {
    return (
      <Card className="p-6 text-sm text-[var(--color-neutral-500)]">
        Unable to resolve your tenant workspace from the current session. Sign in again as a Tenant
        Admin.
      </Card>
    );
  }

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (isError || !user) {
    const message = error instanceof Error ? error.message : 'Failed to load user.';
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
        <Button variant="secondary" size="sm" onClick={() => navigate(userPath())}>
          ← Back to users
        </Button>
      </div>
    );
  }

  const isDeleted = !!user.deleted_at;
  const isActive = user.status === 'ACTIVE';

  const actions = [
    !isDeleted && {
      label: 'Edit',
      onClick: () => navigate(userPath(`/${id}/edit`)),
      variant: 'secondary' as const,
    },
    !isDeleted && {
      label: 'Reset password',
      onClick: () =>
        runAction(async () => {
          const result = await userService.adminResetPassword(scopeTenantId, user.id);
          if (!result.temporary_password) {
            throw new Error('API did not return a temporary password.');
          }
          setResetPassword(result.temporary_password);
          if (user.status !== 'ACTIVE') {
            await updateUserStatus.mutateAsync({
              tenantId: scopeTenantId,
              id: user.id,
              dto: { status: 'ACTIVE' },
            });
          }
        }),
      variant: 'secondary' as const,
    },
    isDeleted
      ? {
          label: 'Restore',
          onClick: () => requestConfirm('restore', user),
          variant: 'primary' as const,
        }
      : isActive
        ? {
            label: 'Deactivate',
            onClick: () => requestConfirm('deactivate', user),
            variant: 'secondary' as const,
          }
        : {
            label: 'Activate',
            onClick: () =>
              runAction(() =>
                updateUserStatus.mutateAsync({
                  tenantId: scopeTenantId,
                  id: user.id,
                  dto: { status: 'ACTIVE' },
                }),
              ),
            variant: 'primary' as const,
          },
    !isDeleted && {
      label: 'Delete',
      onClick: () => requestConfirm('delete', user),
      variant: 'danger' as const,
    },
  ].filter(Boolean) as { label: string; onClick: () => void; variant: 'primary' | 'secondary' | 'danger' }[];

  const handleConfirmAction = () => {
    if (!confirm) return;
    const mutation =
      confirm.action === 'delete'
        ? () =>
            deleteUser.mutateAsync({
              tenantId: scopeTenantId,
              id: user.id,
              user,
            })
        : confirm.action === 'deactivate'
          ? () =>
              updateUserStatus.mutateAsync({
                tenantId: scopeTenantId,
                id: user.id,
                dto: { status: 'INACTIVE' },
              })
          : confirm.action === 'restore'
            ? () => restoreUser.mutateAsync({ tenantId: scopeTenantId, id: user.id })
            : () =>
                updateUserStatus.mutateAsync({
                  tenantId: scopeTenantId,
                  id: user.id,
                  dto: { status: 'ACTIVE' },
                });
    runAction(mutation);
  };

  const statusTone = isDeleted ? 'rose' : isActive ? 'emerald' : 'slate';

  return (
    <>
      {resetPassword && (
        <Card className="mb-4 p-4 space-y-2 border-[var(--color-primary-200)] bg-[var(--color-primary-50)]">
          <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
            New Staff / User password
          </h3>
          <p className="text-xs text-[var(--color-neutral-500)]">
            ERP Login → Staff / User with slug + <code className="font-mono">{user.email}</code> +
            this temporary password. On first login they must set their own password.
          </p>
          <p className="font-mono text-sm text-[var(--color-neutral-800)]">{resetPassword}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => setResetPassword(null)}>
            Dismiss
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

      <DetailPageTemplate
        title={formatUserLabel(user)}
        subtitle={`${formatUserRole(user.role)} · ${user.email}`}
        statusLabel={isDeleted ? 'Deleted' : user.status}
        statusTone={statusTone}
        onBack={() => navigate(userPath())}
        backLabel="Back to users"
        actions={actions}
        actionsDisabled={pendingAction}
        sidebar={
          <Card>
            <CardHeader className="mb-0 pb-3">
              <CardTitle>Quick summary</CardTitle>
            </CardHeader>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--color-neutral-500)]">Status</dt>
                <dd>
                  <UserStatusBadge user={user} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--color-neutral-500)]">Role</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {formatUserRole(user.role)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--color-neutral-500)]">Phone</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">{user.phone || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--color-neutral-500)]">Last login</dt>
                <dd className="font-medium text-[var(--color-neutral-800)] text-xs">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}
                </dd>
              </div>
            </dl>
          </Card>
        }
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <UserOverviewPanel user={user} />,
          },
        ]}
      />

      {confirm && (
        <UserConfirmModal
          open
          action={confirm.action}
          userName={formatUserLabel(confirm.user)}
          isPending={pendingAction}
          onConfirm={handleConfirmAction}
          onClose={closeConfirm}
        />
      )}
    </>
  );
}

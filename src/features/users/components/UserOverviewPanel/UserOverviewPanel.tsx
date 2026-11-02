import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { UserForm } from '../UserForm';
import { useUpdateUser } from '../../hooks/useUsers';
import type { UpdateUserFormValues, User } from '../../types/user.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { userToFormValues } from '../../utils/userToFormValues';

interface UserOverviewPanelProps {
  user: User;
  tenantId?: string;
  readOnly?: boolean;
}

/**
 * Overview tab — editable user profile (same fields as create/edit).
 * Tenant is shown by name; UUID is never primary UI.
 */
export function UserOverviewPanel({ user, tenantId, readOnly = false }: UserOverviewPanelProps) {
  const orgQuery = useOrganizationProfile();
  const updateUser = useUpdateUser(tenantId || 'session', user.id);
  const [apiError, setApiError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const tenantLabel = useMemo(() => {
    if (user.tenant_name?.trim()) return user.tenant_name.trim();
    const org = orgQuery.data;
    const fromOrg =
      org?.display_name?.trim() || org?.name?.trim() || '';
    if (fromOrg) return fromOrg;
    return 'Current workspace';
  }, [user.tenant_name, orgQuery.data]);

  if (readOnly || user.deleted_at) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <dl className="space-y-0 px-1">
            <div className="flex flex-col gap-1 border-b border-[var(--color-neutral-50)] py-2.5 sm:flex-row sm:justify-between">
              <dt className="text-xs text-[var(--color-neutral-500)]">Tenant</dt>
              <dd className="text-sm text-[var(--color-neutral-800)]">{tenantLabel}</dd>
            </div>
            <div className="flex flex-col gap-1 border-b border-[var(--color-neutral-50)] py-2.5 sm:flex-row sm:justify-between">
              <dt className="text-xs text-[var(--color-neutral-500)]">Company</dt>
              <dd className="text-sm text-[var(--color-neutral-800)]">
                {user.company_name || '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-b border-[var(--color-neutral-50)] py-2.5 sm:flex-row sm:justify-between">
              <dt className="text-xs text-[var(--color-neutral-500)]">Branch</dt>
              <dd className="text-sm text-[var(--color-neutral-800)]">
                {user.branch_name || '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between">
              <dt className="text-xs text-[var(--color-neutral-500)]">Department</dt>
              <dd className="text-sm text-[var(--color-neutral-800)]">
                {user.department_name || '—'}
              </dd>
            </div>
          </dl>
        </Card>
        <p className="text-sm text-[var(--color-neutral-500)]">
          This user is deleted — restore them before editing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      ) : null}
      {savedMsg ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {savedMsg}
        </p>
      ) : null}

      <UserForm
        mode="edit"
        tenantId={tenantId}
        tenantLabel={tenantLabel}
        defaultValues={userToFormValues(user)}
        hidePermissionMatrix
        isSubmitting={updateUser.isPending}
        onSubmit={async (values) => {
          setApiError(null);
          setSavedMsg(null);
          try {
            await updateUser.mutateAsync(values as UpdateUserFormValues);
            setSavedMsg('User saved.');
          } catch (err) {
            setApiError(getErrorMessage(err) || 'Failed to update user.');
          }
        }}
      />
    </div>
  );
}

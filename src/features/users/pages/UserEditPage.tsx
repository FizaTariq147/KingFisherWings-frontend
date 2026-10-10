import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { UserForm } from '../components/UserForm';
import { UserDetailSkeleton } from '../components/UserDetailSkeleton';
import { useUpdateUserPermissions, useUserPermissions } from '../hooks/useUserPermissionMatrix';
import { useUpdateUser, useUser } from '../hooks/useUsers';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { UpdateUserFormValues } from '../types/user.types';
import { userToFormValues } from '../utils/userToFormValues';
import { formatUserLabel } from '../utils/userToFormValues';
import { toAccessGrants } from '../utils/permissionAccess';

export default function UserEditPage() {
  const { id = '' } = useParams();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const detailPath = userPath(`/${id}`);
  const { goBack } = useReturnNavigation(detailPath);
  const { data: user, isLoading, isError } = useUser(tenantId, id);
  const updateUser = useUpdateUser(tenantId || 'session', id);
  const assignmentQuery = useUserPermissions(id);
  const updatePermissions = useUpdateUserPermissions(id);
  const [apiError, setApiError] = useState<string | null>(null);

  const initialPermissionGrants = useMemo(
    () => assignmentQuery.data?.grants ?? [],
    [assignmentQuery.data?.grants],
  );

  if (!tenantId && !sessionScoped) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Missing tenant context. Sign in again as a Tenant Admin.
      </p>
    );
  }

  if (isLoading || assignmentQuery.isLoading) {
    return <UserDetailSkeleton />;
  }

  if (isError || !user) {
    return (
      <div
        role="alert"
        className="rounded-lg border px-4 py-3 text-sm"
        style={{
          background: 'var(--color-danger-100)',
          borderColor: '#FECACA',
          color: 'var(--color-danger-700)',
        }}
      >
        User not found or failed to load.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <FormPageHeader
        title={`Edit ${formatUserLabel(user)}`}
        subtitle={user.email}
        onBack={goBack}
        backLabel="Back to user"
      />

      {apiError && (
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
          <span>{apiError}</span>
        </div>
      )}

      <UserForm
        mode="edit"
        tenantId={tenantId}
        defaultValues={userToFormValues(user)}
        initialPermissionGrants={initialPermissionGrants}
        isSubmitting={updateUser.isPending || updatePermissions.isPending}
        onSubmit={async (values, meta) => {
          setApiError(null);
          try {
            const accessGrants = toAccessGrants(meta?.permissionGrants ?? []);

            await updateUser.mutateAsync({
              ...(values as UpdateUserFormValues),
              ...(accessGrants.length
                ? {
                    permission_grants: accessGrants,
                    permission_grants_mode: 'replace' as const,
                  }
                : {}),
            });
            const grants = meta?.permissionGrants ?? [];
            if (grants.length > 0) {
              await updatePermissions.mutateAsync({ grants });
            }
            goBack();
          } catch (err) {
            setApiError(getErrorMessage(err) || 'Failed to update user.');
          }
        }}
      />
    </div>
  );
}

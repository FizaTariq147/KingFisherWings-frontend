import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { UserForm } from '../components/UserForm';
import { UserDetailSkeleton } from '../components/UserDetailSkeleton';
import { useUpdateUser, useUser } from '../hooks/useUsers';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { UpdateUserFormValues } from '../types/user.types';
import { userToFormValues } from '../utils/userToFormValues';
import { formatUserLabel } from '../utils/userToFormValues';

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const { data: user, isLoading, isError } = useUser(tenantId, id!);
  const updateUser = useUpdateUser(tenantId || 'session', id!);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!tenantId && !sessionScoped) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Missing tenant context. Sign in again as a Tenant Admin.
      </p>
    );
  }

  if (isLoading) {
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
      <button
        type="button"
        onClick={() => navigate(userPath(`/${id}`))}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors"
      >
        ← Back to user
      </button>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Edit {formatUserLabel(user)}
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">{user.email}</p>
      </div>

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
        isSubmitting={updateUser.isPending}
        onSubmit={async (values) => {
          setApiError(null);
          try {
            await updateUser.mutateAsync(values as UpdateUserFormValues);
            navigate(userPath(`/${id}`));
          } catch (err) {
            setApiError(getErrorMessage(err) || 'Failed to update user.');
          }
        }}
      />
    </div>
  );
}

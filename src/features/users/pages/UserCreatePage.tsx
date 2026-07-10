import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import type { CreateUserDto } from '../types/user.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const createUser = useCreateUser();
  const [apiError, setApiError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  if (!tenantId && !sessionScoped) {
    return (
      <Card className="p-6 text-sm text-[var(--color-neutral-500)]">
        Unable to resolve your tenant workspace from the current session. Sign in again as a Tenant
        Admin.
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate(userPath())}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to users
      </button>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Add user</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Create a user for your tenant only. They cannot access other tenants.
        </p>
      </div>

      {temporaryPassword && (
        <Card className="p-4 text-sm text-[var(--color-neutral-700)]">
          User created. Temporary password:{' '}
          <code className="rounded bg-[var(--color-neutral-100)] px-2 py-0.5 font-mono text-xs">
            {temporaryPassword}
          </code>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate(userPath())}
              className="text-xs font-medium text-[var(--color-primary-600)] hover:underline"
            >
              Back to users →
            </button>
          </div>
        </Card>
      )}

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
        key={tenantId || 'session'}
        mode="create"
        tenantId={tenantId}
        isSubmitting={createUser.isPending}
        onSubmit={async (values) => {
          setApiError(null);
          setTemporaryPassword(null);
          try {
            const dto: CreateUserDto = {
              ...(values as CreateUserDto),
              ...(tenantId ? { tenant_id: tenantId } : {}),
            };
            const result = await createUser.mutateAsync(dto);
            if (result.temporary_password) {
              setTemporaryPassword(result.temporary_password);
            } else {
              navigate(userPath());
            }
          } catch (err) {
            setApiError(getErrorMessage(err) || 'Failed to create user.');
          }
        }}
      />
    </div>
  );
}

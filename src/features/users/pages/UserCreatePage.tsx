import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { tenantSlugFromAccessToken } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import { userService } from '../services/user.service';
import type { CreateUserDto } from '../types/user.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-[var(--color-neutral-400)]">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{value}</span>
      <button
        type="button"
        className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]"
        aria-label={`Copy ${label}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            // ignore
          }
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </span>
  );
}

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const createUser = useCreateUser();
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantSlug = useMemo(() => tenantSlugFromAccessToken(accessToken), [accessToken]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [createdLogin, setCreatedLogin] = useState<{
    userId: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);

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
          Create a staff user for your tenant. They sign in on ERP Login →{' '}
          <span className="font-medium text-[var(--color-neutral-600)]">Staff / User</span> with
          slug + email + the temporary password below. On first login they must set their own
          password; later logins use that password.
        </p>
      </div>

      {createdLogin && (
        <Card className="p-4 space-y-3 border-[var(--color-primary-200)] bg-[var(--color-primary-50)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
              Staff / User login credentials
            </h3>
            <p className="text-xs text-[var(--color-neutral-500)] mt-1">
              Share these once. Open ERP Login → <strong>Staff / User</strong>, sign in with slug +
              email + temporary password. The user will then be prompted to set their own password
              for future logins.
            </p>
          </div>

          {!createdLogin.temporaryPassword && (
            <p className="text-xs text-[var(--color-danger-700)]">
              User was created, but the API did not return a temporary password. Click “Generate
              password” below, then try Staff / User login again.
            </p>
          )}

          <dl className="grid gap-2 text-sm font-mono">
            <div className="flex flex-wrap gap-2 items-center">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Tab</dt>
              <dd className="text-[var(--color-neutral-800)] font-sans">Staff / User</dd>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Slug</dt>
              <dd className="text-[var(--color-neutral-800)]">
                <CopyValue
                  label="slug"
                  value={tenantSlug}
                />
                {!tenantSlug && (
                  <span className="block font-sans text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                    Use your Create Tenant workspace slug (e.g. demo-trade-house)
                  </span>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Email</dt>
              <dd className="text-[var(--color-neutral-800)]">
                <CopyValue label="email" value={createdLogin.email} />
              </dd>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <dt className="text-[var(--color-neutral-500)] font-sans text-xs w-28">Password</dt>
              <dd className="text-[var(--color-neutral-800)]">
                <CopyValue label="password" value={createdLogin.temporaryPassword} />
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => navigate('/login')}>
              Open ERP login
            </Button>
            {!createdLogin.temporaryPassword && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  setApiError(null);
                  try {
                    const reset = await userService.adminResetPassword(
                      tenantId || '',
                      createdLogin.userId,
                    );
                    if (!reset.temporary_password) {
                      setApiError('API still did not return a temporary password.');
                      return;
                    }
                    setCreatedLogin({
                      ...createdLogin,
                      temporaryPassword: reset.temporary_password,
                    });
                  } catch (err) {
                    setApiError(getErrorMessage(err) || 'Failed to generate password.');
                  } finally {
                    setResetting(false);
                  }
                }}
              >
                {resetting ? 'Generating…' : 'Generate password'}
              </Button>
            )}
            <Button type="button" size="sm" variant="secondary" onClick={() => navigate(userPath())}>
              Back to users
            </Button>
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

      {!createdLogin && (
        <UserForm
          key={tenantId || 'session'}
          mode="create"
          tenantId={tenantId}
          isSubmitting={createUser.isPending}
          onSubmit={async (values) => {
            setApiError(null);
            try {
              const dto: CreateUserDto = {
                ...(values as CreateUserDto),
                status: 'ACTIVE',
                ...(tenantId ? { tenant_id: tenantId } : {}),
              };
              const result = await createUser.mutateAsync(dto);
              const email = String(values.email || result.user?.email || '')
                .trim()
                .toLowerCase();
              if (!result.temporary_password) {
                setApiError(
                  'User created but no temporary password was returned. Open the user and click Reset password.',
                );
              }
              setCreatedLogin({
                userId: result.user.id,
                email,
                temporaryPassword: result.temporary_password || '',
              });
            } catch (err) {
              setApiError(getErrorMessage(err) || 'Failed to create user.');
            }
          }}
        />
      )}

      {createdLogin && (
        <p className="text-xs text-[var(--color-neutral-400)]">
          Need another user?{' '}
          <button
            type="button"
            className="font-medium text-[var(--color-primary-600)] hover:underline"
            onClick={() => setCreatedLogin(null)}
          >
            Create another
          </button>
          {' · '}
          <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:underline">
            Staff / User login
          </Link>
        </p>
      )}
    </div>
  );
}

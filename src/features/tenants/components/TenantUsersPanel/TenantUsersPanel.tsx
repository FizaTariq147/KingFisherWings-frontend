import { AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTenantUsers } from '../../hooks/useTenantUsers';
import type { Tenant } from '../../types/tenant.types';

interface TenantUsersPanelProps {
  tenant: Tenant;
}

function formatWhen(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function formatRole(role?: string): string {
  if (!role?.trim()) return '—';
  return role
    .trim()
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function statusVariant(
  status?: string,
): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 'success';
  if (s === 'INVITED') return 'info';
  if (s === 'INACTIVE' || s === 'SUSPENDED') return 'warning';
  if (s === 'LOCKED') return 'danger';
  return 'neutral';
}

/**
 * Super Admin — same tenant users Tenant Admin manages at /admin/users,
 * loaded only via platform /tenants (never ERP GET /users).
 */
export function TenantUsersPanel({ tenant }: TenantUsersPanelProps) {
  const query = useTenantUsers(tenant.id);
  const users = query.data?.users ?? [];
  const source = query.data?.source;
  const platformRouteMissing = query.data?.platformRouteMissing;

  const countLabel =
    typeof tenant.total_users === 'number'
      ? `${tenant.total_users} total`
      : users.length
        ? `${users.length} loaded`
        : null;

  return (
    <Card className="p-4 space-y-3">
      <CardHeader className="p-0 mb-0 flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Created users</CardTitle>
          <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
            Same roster as Tenant Admin <code className="text-[11px]">/admin/users</code>
            {countLabel ? ` · ${countLabel}` : ''}
            {typeof tenant.max_users === 'number' ? ` · limit ${tenant.max_users}` : ''}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>

      {query.isError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {(query.error instanceof Error && query.error.message) ||
              'Could not load users for this tenant.'}
          </span>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && platformRouteMissing ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-warning-50, #FFFBEB)',
            borderColor: 'var(--color-warning-200, #FDE68A)',
            color: 'var(--color-warning-800, #92400E)',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Platform route <code className="text-[11px]">GET /tenants/{'{id}'}/users</code>{' '}
            is not available yet (live API returns 404). Super Admin cannot call ERP{' '}
            <code className="text-[11px]">GET /users</code>. Until backend adds that nested
            list, only users embedded on tenant detail (often the owner) can appear here —
            not the full <code className="text-[11px]">/admin/users</code> roster. See{' '}
            <code className="text-[11px]">docs/be-brief-superadmin-tenant-users.md</code>.
          </span>
        </div>
      ) : null}

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading users…</p>
      ) : null}

      {!query.isLoading && !query.isError && users.length === 0 && !platformRouteMissing ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          No users returned for this tenant yet.
        </p>
      ) : null}

      {!query.isLoading && !query.isError && users.length === 0 && platformRouteMissing ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          No embedded users on <code className="text-[11px]">GET /tenants/{'{id}'}</code>.
        </p>
      ) : null}

      {source === 'tenant_embed' && users.length > 0 ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Showing users from tenant detail embed only (may be incomplete vs{' '}
          <code className="text-[11px]">/admin/users</code>).
        </p>
      ) : null}

      {users.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]">
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">Name</th>
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">Email</th>
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">Role</th>
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">Status</th>
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">
                  Last login
                </th>
                <th className="px-3 py-2 font-semibold text-[var(--color-neutral-600)]">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--color-neutral-50)] last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-[var(--color-neutral-800)]">
                    {user.full_name ||
                      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                      '—'}
                    {user.must_change_password ? (
                      <span className="ml-2 text-[10px] font-normal text-[var(--color-warning-700,#B45309)]">
                        Must change password
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-[var(--color-neutral-700)]">
                    {user.email || '—'}
                  </td>
                  <td className="px-3 py-2 text-[var(--color-neutral-700)]">
                    {formatRole(user.role)}
                  </td>
                  <td className="px-3 py-2">
                    {user.status ? (
                      <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-neutral-600)]">
                    {formatWhen(user.last_login_at)}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-neutral-600)]">
                    {formatWhen(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}

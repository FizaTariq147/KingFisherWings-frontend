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
 * Super Admin — users created under this tenant (GET /users scoped by tenant).
 */
export function TenantUsersPanel({ tenant }: TenantUsersPanelProps) {
  const query = useTenantUsers(tenant.id);

  return (
    <Card className="p-4 space-y-3">
      <CardHeader className="p-0 mb-0 flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Created users</CardTitle>
          <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
            Users returned by the API for this tenant
            {typeof tenant.total_users === 'number'
              ? ` · ${tenant.total_users} total`
              : query.data
                ? ` · ${query.data.length} loaded`
                : ''}
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

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading users…</p>
      ) : null}

      {!query.isLoading && !query.isError && (query.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          No users returned for this tenant yet.
        </p>
      ) : null}

      {(query.data?.length ?? 0) > 0 ? (
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
              {query.data!.map((user) => (
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

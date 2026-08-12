import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import { useTenantVendorUsers } from '../hooks/useVendorUsersAdmin';

export default function VendorUsersAdminPage() {
  const [partyId, setPartyId] = useState('');
  const filterPartyId = useMemo(() => {
    const trimmed = partyId.trim();
    return isUuid(trimmed) ? trimmed : undefined;
  }, [partyId]);
  const { data = [], isLoading, isError, error, refetch, isFetching } = useTenantVendorUsers(
    filterPartyId,
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">
          Vendor Portal users
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Tenant-wide list of vendor portal logins. Invite and manage users from any party detail
          page under Vendor Portal.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Input
              label="Filter by party ID (optional UUID)"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="Leave blank for all vendor users"
            />
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
        {partyId.trim() && !filterPartyId ? (
          <p className="mt-2 text-xs text-[var(--color-danger-600)]">Enter a valid party UUID.</p>
        ) : null}
      </Card>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading vendor users…</p>
        ) : isError ? (
          <div className="space-y-2 p-6">
            <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">
            No vendor portal users found. Open a party and use the Vendor Portal tab to invite one.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {data.map((user) => {
              const active = String(user.status).toUpperCase() === 'ACTIVE';
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                        {user.fullName}
                      </span>
                      <Badge variant={active ? 'success' : 'neutral'}>{user.status}</Badge>
                    </div>
                    <div className="text-xs text-[var(--color-neutral-500)] truncate">
                      {[user.email, user.partyName, user.createdAt].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {user.partyId ? (
                    <Link
                      to={`/parties/${user.partyId}`}
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Open party
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

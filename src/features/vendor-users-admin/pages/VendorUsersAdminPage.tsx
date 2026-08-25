import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, Users } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import { useTenantVendorUsers } from '../hooks/useVendorUsersAdmin';

export default function VendorUsersAdminPage() {
  const [partyId, setPartyId] = useState('');
  const [search, setSearch] = useState('');
  const filterPartyId = useMemo(() => {
    const trimmed = partyId.trim();
    return isUuid(trimmed) ? trimmed : undefined;
  }, [partyId]);
  const { data = [], isLoading, isError, error, refetch, isFetching } = useTenantVendorUsers(
    filterPartyId,
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((user) =>
      [user.fullName, user.email, user.partyName, user.status, user.partyId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [data, search]);

  const activeCount = useMemo(
    () => data.filter((user) => String(user.status).toUpperCase() === 'ACTIVE').length,
    [data],
  );

  return (
    <div className="space-y-5">
      <PageBackLink to="/vendors" label="Back to Vendors" />

      <div className="overflow-hidden rounded-xl border border-[#0A2942]/10 bg-[#0A2942] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <Users size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-white">Vendor Portal users</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/65">
              Tenant-wide list of vendor portal logins. Invite and manage users from any party
              detail page under Vendor Portal.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70">
                {data.length} total
              </span>
              <span className="rounded-full border border-[#FF751F]/35 bg-[#FF751F]/15 px-2.5 py-1 text-[#FFB27A]">
                {activeCount} active
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Search users</label>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, party…"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-700
                           focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label="Filter by party ID (optional UUID)"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="Leave blank for all vendor users"
            />
          </div>
        </div>
        {partyId.trim() && !filterPartyId ? (
          <p className="mt-2 text-xs text-red-600">Enter a valid party UUID.</p>
        ) : null}
        {search.trim() && !isLoading && !isError ? (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filteredUsers.length} of {data.length}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-gray-400">Loading vendor users…</p>
        ) : isError ? (
          <div className="space-y-3 p-8 text-center">
            <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Users size={20} />
            </span>
            <p className="text-sm font-medium text-gray-700">No vendor portal users found.</p>
            <p className="max-w-md text-xs text-gray-400">
              Open a party and use the Vendor Portal tab to create a login.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-gray-700">No users match “{search.trim()}”.</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 text-sm font-medium text-[#FF751F] hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_100px_110px] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:grid">
              <span>User</span>
              <span>Email</span>
              <span>Party</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const active = String(user.status).toUpperCase() === 'ACTIVE';
                return (
                  <li
                    key={user.id}
                    className="grid gap-2 px-5 py-3.5 transition-colors hover:bg-orange-50/40 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_100px_110px] md:items-center md:gap-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#0A2942]">{user.fullName}</div>
                      {user.createdAt ? (
                        <div className="mt-0.5 text-xs text-gray-400 md:hidden">{user.createdAt}</div>
                      ) : null}
                    </div>
                    <div className="truncate text-sm text-gray-600">{user.email || '—'}</div>
                    <div className="min-w-0 truncate text-sm text-gray-600">
                      {user.partyName || user.partyId || '—'}
                    </div>
                    <div>
                      <Badge variant={active ? 'success' : 'neutral'}>{user.status}</Badge>
                    </div>
                    <div className="md:text-right">
                      {user.partyId ? (
                        <Link
                          to={`/parties/${user.partyId}`}
                          className="inline-flex text-sm font-medium text-[#FF751F] hover:underline"
                        >
                          Open party
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

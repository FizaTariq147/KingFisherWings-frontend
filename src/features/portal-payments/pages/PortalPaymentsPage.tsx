import { useMemo, useState } from 'react';
import { HandCoins } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalEmptyState, PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { usePortalPayments } from '../hooks/usePortalPayments';

export default function PortalPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const params = useMemo(
    () => ({ page, limit: 20, search: search.trim() || undefined }),
    [page, search],
  );
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalPayments(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Payments" description="Receipts and payment history for your account." />
      <PortalPanel padded>
        <Input
          label="Search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </PortalPanel>
      <PortalPanel>
        {isFetching && <div className="h-0.5 bg-[var(--color-secondary)]/80 animate-pulse" />}
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No payments"
            description="Payment history will appear here."
            Icon={HandCoins}
          />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{p.reference || p.id}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[p.paymentDate, p.method, p.currencyCode].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">{p.amount ?? '—'}</span>
                  {p.status ? <Badge variant="neutral">{p.status}</Badge> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

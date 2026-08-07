import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalEmptyState, PortalPageHeader, PortalPanel, portalSelectClassName } from '@/features/portal-auth/components/portal-ui';
import { usePortalCreditNotes } from '../hooks/usePortalCreditNotes';

const STATUSES = ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID'];

export default function PortalCreditNotesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const params = useMemo(() => ({
    page, limit: 20, search: search.trim() || undefined, status: status || undefined,
  }), [page, search, status]);
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalCreditNotes(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Credit notes" description="Credit notes applied to your account." />
      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Status</span>
            <select className={portalSelectClassName} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
        </div>
      </PortalPanel>
      <PortalPanel>
        {isFetching && <div className="h-0.5 bg-[var(--color-secondary)]/80 animate-pulse" />}
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Failed to load.'}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState title="No credit notes" description="Credit notes will appear here when issued." Icon={Receipt} />
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((cn) => (
              <Link key={cn.id} to={`/portal/credit-notes/${cn.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-[var(--color-neutral-50)]">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{cn.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[cn.creditedInvoiceNumber, cn.creditDate, cn.currencyCode, cn.totalAmount].filter((v) => v != null && v !== '').join(' · ') || '—'}
                  </div>
                </div>
                {cn.status ? <Badge variant="info">{cn.status.replaceAll('_', ' ')}</Badge> : null}
              </Link>
            ))}
          </div>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button type="button" size="sm" variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

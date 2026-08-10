import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { usePortalCreditNotes } from '../hooks/usePortalCreditNotes';
import type { PortalNoteKind } from '../services/portalCreditNotes.service';

const STATUSES = ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID'];

export default function PortalCreditNotesPage() {
  const location = useLocation();
  const kind: PortalNoteKind = location.pathname.includes('/debit-notes') ? 'debit' : 'credit';
  const basePath = kind === 'debit' ? '/portal/debit-notes' : '/portal/credit-notes';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      status: status || undefined,
    }),
    [page, search, status],
  );
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalCreditNotes(params, kind);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title={kind === 'debit' ? 'Debit notes' : 'Credit notes'}
        description={
          kind === 'debit'
            ? 'Debit notes issued on your account.'
            : 'Credit notes applied to your account.'
        }
        actions={
          <div className="flex gap-2">
            <Link
              to="/portal/credit-notes"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                kind === 'credit'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
              }`}
            >
              Credit
            </Link>
            <Link
              to="/portal/debit-notes"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                kind === 'debit'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
              }`}
            >
              Debit
            </Link>
          </div>
        }
      />
      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Status
            </span>
            <select
              className={portalSelectClassName}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PortalPanel>
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
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
            title={kind === 'debit' ? 'No debit notes' : 'No credit notes'}
            description={
              kind === 'debit'
                ? 'Debit notes will appear here when issued.'
                : 'Credit notes will appear here when issued.'
            }
            Icon={Receipt}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((cn) => (
              <PortalAnimatedListItem key={cn.id}>
                <Link
                  to={`${basePath}/${cn.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-[var(--color-neutral-50)]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{cn.number}</div>
                    <div className="text-xs text-[var(--color-neutral-500)]">
                      {[cn.creditedInvoiceNumber, cn.creditDate, cn.currencyCode, cn.totalAmount]
                        .filter((v) => v != null && v !== '')
                        .join(' · ') || '—'}
                    </div>
                  </div>
                  {cn.status ? <Badge variant="info">{cn.status.replaceAll('_', ' ')}</Badge> : null}
                </Link>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
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

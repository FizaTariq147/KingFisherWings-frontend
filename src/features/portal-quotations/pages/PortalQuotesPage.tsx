import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, RefreshCw } from 'lucide-react';
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
import { PORTAL_JOB_TYPES } from '@/features/portal-shipments/api/portalShipments.api';
import { usePortalQuotations } from '../hooks/usePortalQuotations';

export default function PortalQuotesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      status: status || undefined,
      job_type: jobType || undefined,
      order: 'desc' as const,
    }),
    [page, search, status, jobType],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = usePortalQuotations(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Quotes"
        description="Review freight quotations submitted for your account."
        actions={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw size={14} aria-hidden="true" />
              Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/portal/book')}>
              Request quote
            </Button>
          </>
        }
      />

      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-3">
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
              {[
                'DRAFT',
                'SUBMITTED',
                'APPROVED',
                'REJECTED',
                'SENT',
                'WON',
                'LOST',
                'EXPIRED',
                'CONVERTED',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Job type
            </span>
            <select
              className={portalSelectClassName}
              value={jobType}
              onChange={(e) => {
                setPage(1);
                setJobType(e.target.value);
              }}
            >
              <option value="">All</option>
              {PORTAL_JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PortalPanel>

      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading quotes…" />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load quotations.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No quotations found"
            description="Request a quote to get started."
            Icon={FileText}
            action={
              <Button type="button" size="sm" onClick={() => navigate('/portal/book')}>
                Request quote
              </Button>
            }
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((q) => (
              <PortalAnimatedListItem key={q.id}>
                <Link
                  to={`/portal/quotes/${q.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-neutral-50)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]">
                      <FileText size={16} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{q.number}</div>
                      <div className="text-xs text-[var(--color-neutral-500)] truncate">
                        {[q.origin, q.destination].filter(Boolean).join(' → ') || q.jobType || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {q.status ? <Badge variant="info">{q.status}</Badge> : null}
                    {(q.status || '').toUpperCase() === 'SENT' ? (
                      <span className="text-[11px] font-medium text-[var(--color-secondary-700)]">
                        Accept or reject
                      </span>
                    ) : null}
                  </div>
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

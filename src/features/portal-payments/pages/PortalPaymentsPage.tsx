import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, HandCoins } from 'lucide-react';
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
} from '@/features/portal-auth/components/portal-ui';
import {
  useCancelPortalPayment,
  usePortalOnlinePayment,
  usePortalOnlinePayments,
  usePortalPayments,
  usePortalPaymentsSummary,
  useRetryPortalPayment,
} from '../hooks/usePortalPayments';
import { PortalAnimatedGrid, PortalAnimatedGridItem, PortalStatCard } from '@/features/portal-auth/components/portal-ui';
import type { PortalOnlinePaymentItem } from '../types/portalPayments.types';
import {
  canCancelPortalOnlinePayment,
  canRetryPortalOnlinePayment,
  openBillingCheckoutUrl,
  portalPaymentStatusBadgeVariant,
} from '../utils/portalPaymentsUi';

function isOnlineListUnavailable(err: unknown): boolean {
  if (!(err instanceof PortalApiError)) return false;
  return err.status === 404 || err.status === 501;
}

function OnlinePaymentDetail({ id }: { id: string }) {
  const detail = usePortalOnlinePayment(id);
  if (detail.isLoading) {
    return <p className="mt-2 text-xs text-[var(--color-neutral-500)]">Loading details…</p>;
  }
  if (detail.isError || !detail.data) {
    return (
      <p className="mt-2 text-xs text-[var(--color-danger-600)]">
        {detail.error instanceof Error ? detail.error.message : 'Could not load payment details.'}
      </p>
    );
  }
  const d = detail.data;
  return (
    <dl className="mt-2 grid gap-1 text-xs text-[var(--color-neutral-600)] sm:grid-cols-2">
      {d.invoiceId ? (
        <div>
          <dt className="text-[var(--color-neutral-400)]">Invoice</dt>
          <dd>{d.invoiceId}</dd>
        </div>
      ) : null}
      {d.method ? (
        <div>
          <dt className="text-[var(--color-neutral-400)]">Method</dt>
          <dd>{d.method}</dd>
        </div>
      ) : null}
      {d.direction ? (
        <div>
          <dt className="text-[var(--color-neutral-400)]">Direction</dt>
          <dd>{d.direction}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function OnlinePaymentRow({
  payment,
  expanded,
  onToggleExpand,
  onActionError,
}: {
  payment: PortalOnlinePaymentItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onActionError: (message: string) => void;
}) {
  const cancelPayment = useCancelPortalPayment();
  const retryPayment = useRetryPortalPayment();
  const showCancel = canCancelPortalOnlinePayment(payment.status);
  const showRetry = canRetryPortalOnlinePayment(payment.status);
  const busy = cancelPayment.isPending || retryPayment.isPending;

  return (
    <PortalAnimatedListItem className="px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{payment.reference || payment.id}</div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[payment.paymentDate, payment.method, payment.currencyCode].filter(Boolean).join(' · ') || '—'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tabular-nums">{payment.amount ?? '—'}</span>
          {payment.status ? (
            <Badge variant={portalPaymentStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
          ) : null}
          {showCancel ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void cancelPayment
                  .mutateAsync({ id: payment.id })
                  .catch((err) =>
                    onActionError(err instanceof Error ? err.message : 'Cancel failed.'),
                  );
              }}
            >
              Cancel
            </Button>
          ) : null}
          {showRetry ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void retryPayment
                  .mutateAsync({ id: payment.id })
                  .then((res) => openBillingCheckoutUrl(res))
                  .catch((err) =>
                    onActionError(err instanceof Error ? err.message : 'Retry failed.'),
                  );
              }}
            >
              Retry
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-expanded={expanded}
            onClick={onToggleExpand}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Details
          </Button>
        </div>
      </div>
      {expanded ? <OnlinePaymentDetail id={payment.id} /> : null}
    </PortalAnimatedListItem>
  );
}

export default function PortalPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [page, search, fromDate, toDate],
  );
  const onlineQuery = usePortalOnlinePayments(params);
  const fallbackToLegacy =
    onlineQuery.isFetched &&
    onlineQuery.isError &&
    isOnlineListUnavailable(onlineQuery.error);
  const legacyQuery = usePortalPayments(params, fallbackToLegacy);
  const summary = usePortalPaymentsSummary();

  const activeQuery = fallbackToLegacy ? legacyQuery : onlineQuery;
  const data = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;
  const refetch = activeQuery.refetch;
  const isFetching = activeQuery.isFetching;
  const isOnlineList = !fallbackToLegacy && Boolean(onlineQuery.data);

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Payments" description="Receipts and payment history for your account." />
      {summary.data ? (
        <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2">
          <PortalAnimatedGridItem>
            <PortalStatCard
              label="Outstanding"
              value={
                summary.data.totalOutstanding != null
                  ? `${summary.data.currencyCode || ''} ${summary.data.totalOutstanding}`.trim()
                  : '—'
              }
            />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <PortalStatCard
              label="Paid YTD"
              value={
                summary.data.totalPaidYtd != null
                  ? `${summary.data.currencyCode || ''} ${summary.data.totalPaidYtd}`.trim()
                  : '—'
              }
            />
          </PortalAnimatedGridItem>
        </PortalAnimatedGrid>
      ) : null}
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
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(1);
              setToDate(e.target.value);
            }}
          />
        </div>
      </PortalPanel>
      {actionError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {actionError}
        </p>
      ) : null}
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
            title="No payments"
            description="Payment history will appear here."
            Icon={HandCoins}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {isOnlineList
              ? (items as PortalOnlinePaymentItem[]).map((p) => (
                  <OnlinePaymentRow
                    key={p.id}
                    payment={p}
                    expanded={expandedId === p.id}
                    onToggleExpand={() =>
                      setExpandedId((current) => (current === p.id ? null : p.id))
                    }
                    onActionError={setActionError}
                  />
                ))
              : items.map((p) => (
                  <PortalAnimatedListItem
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{p.reference || p.id}</div>
                      <div className="text-xs text-[var(--color-neutral-500)]">
                        {[p.paymentDate, p.method, p.currencyCode].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">{p.amount ?? '—'}</span>
                      {p.status ? (
                        <Badge variant={portalPaymentStatusBadgeVariant(p.status)}>{p.status}</Badge>
                      ) : null}
                    </div>
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuotationConfirmModal } from '../components/QuotationConfirmModal';
import { QuotationFilters } from '../components/QuotationFilters';
import { QuotationTable } from '../components/QuotationTable';
import {
  DEFAULT_QUOTATION_PAGE_SIZE,
  type JobType,
  type LostReason,
  type QuotationStatus,
} from '../constants/quotation.constants';
import { useQuotationLifecycleMutations } from '../hooks/useQuotationActions';
import { useQuotationConfirmState } from '../hooks/useQuotationConfirmState';
import { useExpireDueQuotations, useQuotations } from '../hooks/useQuotations';
import type { Quotation } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function QuotationListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | 'all'>('all');
  const [jobType, setJobType] = useState<JobType | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useQuotationConfirmState();
  const lifecycle = useQuotationLifecycleMutations();
  const expireDue = useExpireDueQuotations();

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, jobType, fromDate, toDate, order]);

  const listParams = {
    page,
    limit: DEFAULT_QUOTATION_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
    job_type: jobType === 'all' ? undefined : jobType,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuotations(listParams);
  const quotations = data?.quotations ?? [];
  const meta = data?.meta;

  const runAction = async (q: Quotation, action: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    setPendingActionId(q.id);
    try {
      const result = await action();
      closeConfirm();
      if (result && typeof result === 'object' && 'id' in result) {
        const created = result as Quotation;
        if (created.status === 'DRAFT' && created.id !== q.id) {
          navigate(`/quotations/${created.id}`);
          return;
        }
      }
      setActionMessage('Action completed.');
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Action failed.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleExpireDue = async () => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await expireDue.mutateAsync();
      const count = result.expired_count;
      setActionMessage(
        typeof count === 'number'
          ? `Expired ${count} quotation(s).`
          : result.message || 'Expire-due completed.',
      );
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Expire-due failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/quotations')}
          >
            ← Back to Quotations
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">All Quotations</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Search, filter, and manage quotations across statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleExpireDue}
            disabled={expireDue.isPending}
          >
            <TimerReset className="h-4 w-4" />
            Expire due
          </Button>
          <Button type="button" onClick={() => navigate('/quotations/new')}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <QuotationFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          jobType={jobType}
          onJobTypeChange={setJobType}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
          order={order}
          onOrderChange={setOrder}
        />

        {actionError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}
        {actionMessage && (
          <div
            role="status"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-success-100)',
              borderColor: '#BBF7D0',
              color: 'var(--color-success-700)',
            }}
          >
            {actionMessage}
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(error) || 'Failed to load quotations.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <QuotationTable
            quotations={quotations}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingActionId={pendingActionId}
            onView={(q) => navigate(`/quotations/${q.id}`)}
            onEdit={(q) => navigate(`/quotations/${q.id}/edit`)}
            onDuplicate={(q) => requestConfirm('duplicate', q)}
            onSubmit={(q) => requestConfirm('submit', q)}
            onApprove={(q) => requestConfirm('approve', q)}
            onReject={(q) => requestConfirm('reject', q)}
            onSend={(q) => requestConfirm('send', q)}
            onDelete={(q) => requestConfirm('delete', q)}
            onArchive={(q) => requestConfirm('archive', q)}
          />
        )}
      </Card>

      {confirm && (
        <QuotationConfirmModal
          open
          kind={confirm.kind}
          quotation={confirm.quotation}
          isPending={pendingActionId === confirm.quotation.id}
          onClose={closeConfirm}
          onConfirm={(extra) => {
            const q = confirm.quotation;
            const kind = confirm.kind;
            if (kind === 'submit') return runAction(q, () => lifecycle.submit.mutateAsync(q.id));
            if (kind === 'approve')
              return runAction(q, () =>
                lifecycle.approve.mutateAsync({ id: q.id, dto: { comments: extra?.comments } }),
              );
            if (kind === 'reject')
              return runAction(q, () =>
                lifecycle.reject.mutateAsync({ id: q.id, dto: { comments: extra?.comments } }),
              );
            if (kind === 'send') return runAction(q, () => lifecycle.send.mutateAsync(q.id));
            if (kind === 'duplicate')
              return runAction(q, () => lifecycle.duplicate.mutateAsync(q.id));
            if (kind === 'delete') return runAction(q, () => lifecycle.remove.mutateAsync(q.id));
            if (kind === 'archive') return runAction(q, () => lifecycle.archive.mutateAsync(q.id));
            if (kind === 'mark-lost' && extra?.reason)
              return runAction(q, () =>
                lifecycle.markLost.mutateAsync({
                  id: q.id,
                  dto: { reason: extra.reason as LostReason, notes: extra.notes },
                }),
              );
            return undefined;
          }}
        />
      )}
    </div>
  );
}

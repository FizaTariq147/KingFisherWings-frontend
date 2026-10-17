import { useEffect, useMemo, useState } from 'react';
import { appType, listShell } from '@/lib/erpTypography';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, RefreshCw, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/erp';
import { QuotationConfirmModal } from '../components/QuotationConfirmModal';
import {
  QuotationFilters,
  quotationFilterDraftToListParams,
  useQuotationFilterDraft,
} from '../components/QuotationFilters';
import { QuotationTable } from '../components/QuotationTable';
import {
  DEFAULT_QUOTATION_PAGE_SIZE,
  type LostReason,
} from '../constants/quotation.constants';
import { useQuotationLifecycleMutations } from '../hooks/useQuotationActions';
import { useQuotationConfirmState } from '../hooks/useQuotationConfirmState';
import { useExpireDueQuotations, useQuotations } from '../hooks/useQuotations';
import type { Quotation } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function QuotationListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useQuotationConfirmState();
  const lifecycle = useQuotationLifecycleMutations();
  const expireDue = useExpireDueQuotations();
  const { draft, setDraft, applied, submit } = useQuotationFilterDraft(
    DEFAULT_QUOTATION_PAGE_SIZE,
  );

  const listParams = useMemo(
    () => quotationFilterDraftToListParams(applied, page),
    [applied, page],
  );

  useEffect(() => {
    setPage(1);
  }, [applied]);

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

  const emptyDefault =
    !applied.search.trim() &&
    !applied.quotationNo.trim() &&
    applied.status === 'all' &&
    applied.jobType === 'all' &&
    !applied.departmentId &&
    !applied.customerId &&
    !applied.branchId &&
    !applied.salespersonId &&
    !applied.originPortId &&
    !applied.destPortId &&
    !applied.createdBy;

  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <button
              type="button"
              className={appType.backLink}
              onClick={() => navigate('/quotations')}
            >
              ← Back to Quotations
            </button>
            <h2 className={`${appType.pageTitle} mt-0.5`}>Quotations</h2>
            <p className={appType.pageSubtitle}>
              Create a new quotation or open an existing one from the list.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="create"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => navigate('/quotations/new')}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<TimerReset />}
              onClick={handleExpireDue}
              disabled={expireDue.isPending}
            >
              Expire due
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={isFetching ? 'animate-spin' : undefined} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>

        <QuotationFilters
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            setPage(1);
            submit();
          }}
          isSubmitting={isFetching}
        />

        {actionError ? (
          <div
            role="alert"
            className="mx-3 mt-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {actionError}
          </div>
        ) : null}
        {actionMessage ? (
          <div
            role="status"
            className="mx-3 mt-2 rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700"
          >
            {actionMessage}
          </div>
        ) : null}

        {isError ? (
          <div className="px-3 py-3">
            <ErrorState
              message={getErrorMessage(error) || 'Failed to load quotations.'}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-1.5 px-3 py-4" aria-busy>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : quotations.length === 0 ? (
          <EmptyState
            title={emptyDefault ? 'No quotations yet.' : 'No quotations found.'}
            description={
              emptyDefault
                ? 'Click Create to start a new quotation, or adjust filters and Submit.'
                : 'Try adjusting your filters and click Submit.'
            }
          />
        ) : (
          <QuotationTable
            quotations={quotations}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingActionId={pendingActionId}
            onView={(q) => navigate(`/quotations/${q.id}`)}
            onEdit={(q) =>
              navigate(`/quotations/${q.id}/edit`, {
                state: { from: `${location.pathname}${location.search}` },
              })
            }
            onDuplicate={(q) => requestConfirm('duplicate', q)}
            onSubmit={(q) => requestConfirm('submit', q)}
            onApprove={(q) => requestConfirm('approve', q)}
            onReject={(q) => requestConfirm('reject', q)}
            onSend={(q) => requestConfirm('send', q)}
            onDelete={(q) => requestConfirm('delete', q)}
            onArchive={(q) => requestConfirm('archive', q)}
          />
        )}
      </div>

      {confirm ? (
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
      ) : null}
    </div>
  );
}

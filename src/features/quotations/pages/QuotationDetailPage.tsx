import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { QuotationConfirmModal } from '../components/QuotationConfirmModal';
import { QuotationEmailModal } from '../components/QuotationEmailModal';
import { QuotationLinesEditor } from '../components/QuotationLinesEditor';
import { QuotationOverviewPanel } from '../components/QuotationOverviewPanel';
import { QuotationPdfModal } from '../components/QuotationPdfModal';
import { QuotationStatusBadge } from '../components/QuotationStatusBadge';
import { QuotationTotalsSummary } from '../components/QuotationTotalsSummary';
import { STATUS_LABELS, type LostReason, type PdfMode } from '../constants/quotation.constants';
import {
  useQuotationActions,
  useQuotationPdf,
} from '../hooks/useQuotationActions';
import { useQuotationConfirmState } from '../hooks/useQuotationConfirmState';
import { useDeleteQuotation, useQuotation, useQuotationRevisions } from '../hooks/useQuotations';
import { getErrorMessage } from '../utils/getErrorMessage';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';
import { recalculateQuotationTotals } from '../utils/recalculateQuotationTotals';

function statusTone(
  status: string,
): 'emerald' | 'amber' | 'rose' | 'slate' {
  if (status === 'WON' || status === 'CONVERTED' || status === 'APPROVED') return 'emerald';
  if (status === 'LOST' || status === 'REJECTED') return 'rose';
  if (status === 'EXPIRED' || status === 'SENT' || status === 'SUBMITTED') return 'amber';
  return 'slate';
}

export default function QuotationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id);
  const { data: revisions = [] } = useQuotationRevisions(id, Boolean(id));
  const actions = useQuotationActions(id);
  const remove = useDeleteQuotation();
  const { data: pdfInfo, refetch: refetchPdf } = useQuotationPdf(id, Boolean(id));
  const { confirm, requestConfirm, closeConfirm } = useQuotationConfirmState();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const lines = quotation?.lines ?? [];
  const totals = useMemo(
    () =>
      recalculateQuotationTotals(lines, {
        discount_percent: quotation?.discount_percent,
        discount_amount: quotation?.discount_amount,
      }),
    [lines, quotation?.discount_percent, quotation?.discount_amount],
  );

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !quotation) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Quotation not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const status = quotation.status;
  const editable = status === 'DRAFT' || status === 'REJECTED';
  const title = quotationDisplayNumber(quotation);

  const run = async (fn: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      const result = await fn();
      closeConfirm();
      if (result && typeof result === 'object' && 'id' in result) {
        const q = result as { id: string; status?: string };
        if (q.id !== id && q.status === 'DRAFT') {
          navigate(`/quotations/${q.id}`);
          return;
        }
      }
      setActionMessage(successMsg || 'Action completed.');
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(editable
      ? [{ label: 'Edit', onClick: () => navigate(`/quotations/${id}/edit`), variant: 'secondary' as const }]
      : []),
    { label: 'Duplicate', onClick: () => requestConfirm('duplicate', quotation), variant: 'secondary' as const },
    ...(editable
      ? [{ label: 'Submit', onClick: () => requestConfirm('submit', quotation), variant: 'primary' as const }]
      : []),
    ...(status === 'SUBMITTED'
      ? [
          { label: 'Approve', onClick: () => requestConfirm('approve', quotation), variant: 'primary' as const },
          { label: 'Reject', onClick: () => requestConfirm('reject', quotation), variant: 'danger' as const },
        ]
      : []),
    ...(status === 'APPROVED'
      ? [{ label: 'Send', onClick: () => requestConfirm('send', quotation), variant: 'primary' as const }]
      : []),
    ...(status === 'SENT'
      ? [
          { label: 'Mark won', onClick: () => requestConfirm('mark-won', quotation), variant: 'primary' as const },
          { label: 'Mark lost', onClick: () => requestConfirm('mark-lost', quotation), variant: 'danger' as const },
        ]
      : []),
    ...(status === 'WON'
      ? [
          {
            label: 'Convert to job',
            onClick: () => requestConfirm('convert', quotation),
            variant: 'primary' as const,
          },
        ]
      : []),
    { label: 'PDF', onClick: () => setPdfOpen(true), variant: 'secondary' as const },
    { label: 'Email', onClick: () => setEmailOpen(true), variant: 'secondary' as const },
    ...(['WON', 'LOST', 'EXPIRED', 'CONVERTED'].includes(status)
      ? [{ label: 'Archive', onClick: () => requestConfirm('archive', quotation), variant: 'danger' as const }]
      : []),
    ...(status === 'DRAFT'
      ? [{ label: 'Delete', onClick: () => requestConfirm('delete', quotation), variant: 'danger' as const }]
      : []),
    ...(['SENT', 'APPROVED'].includes(status)
      ? [{ label: 'Expire', onClick: () => requestConfirm('expire', quotation), variant: 'danger' as const }]
      : []),
  ];

  return (
    <>
      {(actionError || actionMessage) && (
        <div className="mb-3 space-y-2">
          {actionError && (
            <div
              role="alert"
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--color-danger-100)',
                borderColor: '#FECACA',
                color: 'var(--color-danger-700)',
              }}
            >
              {actionError}
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
        </div>
      )}

      <DetailPageTemplate
        title={title}
        subtitle={quotation.customer_name || quotation.customer_id}
        statusLabel={STATUS_LABELS[status] ?? status}
        statusTone={statusTone(status)}
        onBack={() => navigate('/quotations/all')}
        backLabel="All quotations"
        actions={headerActions}
        actionsDisabled={pending}
        sidebar={
          <div className="space-y-4">
            <QuotationStatusBadge status={status} />
            <QuotationTotalsSummary
              currencyCode={quotation.currency_code}
              totals={totals}
              serverTotal={quotation.total_amount}
            />
            {revisions.length > 1 && (
              <div className="text-xs text-[var(--color-neutral-500)] space-y-1">
                <p className="font-medium text-[var(--color-neutral-700)]">Revisions</p>
                {revisions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`block underline ${r.id === id ? 'font-semibold' : ''}`}
                    onClick={() => navigate(`/quotations/${r.id}`)}
                  >
                    {quotationDisplayNumber(r)} · {r.status}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <QuotationOverviewPanel quotation={quotation} />,
          },
          {
            key: 'charges',
            label: 'Charges',
            content: (
              <QuotationLinesEditor
                quotationId={id}
                lines={lines}
                currencyCode={quotation.currency_code}
                editable={editable}
              />
            ),
          },
          {
            key: 'history',
            label: 'History',
            content: (
              <div className="space-y-2 text-sm">
                {(quotation.status_history ?? []).length === 0 ? (
                  <p className="text-[var(--color-neutral-400)]">No status history.</p>
                ) : (
                  (quotation.status_history ?? []).map((h, i) => (
                    <div
                      key={h.id ?? i}
                      className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
                    >
                      <div className="font-medium">
                        {h.from_status || '—'} → {h.to_status || h.status || '—'}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-400)]">
                        {h.created_at || ''} {h.comments ? `· ${h.comments}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />

      {confirm && (
        <QuotationConfirmModal
          open
          kind={confirm.kind}
          quotation={confirm.quotation}
          isPending={pending}
          onClose={closeConfirm}
          onConfirm={(extra) => {
            const kind = confirm.kind;
            if (kind === 'submit') return run(() => actions.submit.mutateAsync(), 'Submitted.');
            if (kind === 'approve')
              return run(
                () => actions.approve.mutateAsync({ comments: extra?.comments }),
                'Approved.',
              );
            if (kind === 'reject')
              return run(
                () => actions.reject.mutateAsync({ comments: extra?.comments }),
                'Rejected.',
              );
            if (kind === 'send') return run(() => actions.send.mutateAsync(), 'Sent.');
            if (kind === 'mark-won') return run(() => actions.markWon.mutateAsync(), 'Marked won.');
            if (kind === 'mark-lost' && extra?.reason)
              return run(
                () =>
                  actions.markLost.mutateAsync({
                    reason: extra.reason as LostReason,
                    notes: extra.notes,
                  }),
                'Marked lost.',
              );
            if (kind === 'duplicate')
              return run(() => actions.duplicate.mutateAsync(), 'Duplicated.');
            if (kind === 'convert')
              return run(() => actions.convertToJob.mutateAsync(), 'Converted to job.');
            if (kind === 'archive') return run(() => actions.archive.mutateAsync(), 'Archived.');
            if (kind === 'expire') return run(() => actions.expire.mutateAsync(), 'Expired.');
            if (kind === 'delete')
              return run(async () => {
                await remove.mutateAsync(id);
                navigate('/quotations/all');
              }, 'Deleted.');
            return undefined;
          }}
        />
      )}

      <QuotationPdfModal
        open={pdfOpen}
        isPending={actions.generatePdf.isPending}
        pdfInfo={pdfInfo}
        onClose={() => setPdfOpen(false)}
        onGenerate={async (mode: PdfMode, layout_variant?: string) => {
          setActionError(null);
          try {
            await actions.generatePdf.mutateAsync({ mode, layout_variant });
            setActionMessage('PDF generation queued.');
            refetchPdf();
          } catch (err) {
            setActionError(getErrorMessage(err));
          }
        }}
      />

      <QuotationEmailModal
        open={emailOpen}
        isPending={actions.sendEmail.isPending}
        defaultTo={quotation.contact_email || ''}
        onClose={() => setEmailOpen(false)}
        onSend={async (dto) => {
          setActionError(null);
          try {
            await actions.sendEmail.mutateAsync(dto);
            setActionMessage('Email sent.');
            setEmailOpen(false);
          } catch (err) {
            setActionError(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}

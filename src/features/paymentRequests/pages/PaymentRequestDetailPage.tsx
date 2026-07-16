import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PAYMENT_REQUEST_ROUTE_PREFIX } from '../api/paymentRequest.api';
import { PaymentRequestRejectModal } from '../components/PaymentRequestRejectModal';
import { PaymentRequestStatusBadge } from '../components/PaymentRequestStatusBadge';
import { PAYMENT_REQUEST_STATUS_LABELS } from '../constants/paymentRequest.constants';
import {
  useApprovePaymentRequest,
  useDeletePaymentRequest,
  useMarkPaidPaymentRequest,
  usePaymentRequest,
  useRejectPaymentRequest,
} from '../hooks/usePaymentRequests';
import { getErrorMessage } from '../utils/getErrorMessage';
import { paymentRequestDisplayNumber } from '../utils/normalizePaymentRequest';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function PaymentRequestDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: pr, isLoading, isError, error, refetch } = usePaymentRequest(id);
  const approve = useApprovePaymentRequest(id);
  const reject = useRejectPaymentRequest(id);
  const markPaid = useMarkPaidPaymentRequest(id);
  const remove = useDeletePaymentRequest();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !pr) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Payment request not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const isPending = pr.status === 'PENDING';
  const isApproved = pr.status === 'APPROVED';

  const run = async (fn: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      await fn();
      setActionMessage(successMsg || 'Action completed.');
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(isPending
      ? [
          {
            label: 'Edit',
            onClick: () => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
          {
            label: 'Approve',
            onClick: () => void run(() => approve.mutateAsync(), 'Approved.'),
            variant: 'primary' as const,
          },
          {
            label: 'Reject',
            onClick: () => setRejectOpen(true),
            variant: 'danger' as const,
          },
          {
            label: 'Delete',
            onClick: () => {
              if (!window.confirm('Delete this pending payment request?')) return;
              void run(async () => {
                await remove.mutateAsync(id);
                navigate(PAYMENT_REQUEST_ROUTE_PREFIX);
              });
            },
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(isApproved
      ? [
          {
            label: 'Mark paid',
            onClick: () => void run(() => markPaid.mutateAsync(), 'Marked as paid.'),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(pr.invoice_id
      ? [
          {
            label: 'View invoice',
            onClick: () => navigate(`/invoices/${pr.invoice_id}`),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(pr.job_id
      ? [
          {
            label: 'View job',
            onClick: () => navigate(`/jobs/${pr.job_id}`),
            variant: 'secondary' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {actionError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
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
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-success-100)',
            borderColor: '#BBF7D0',
            color: 'var(--color-success-700)',
          }}
        >
          {actionMessage}
        </div>
      )}

      <DetailPageTemplate
        title={paymentRequestDisplayNumber(pr)}
        subtitle={pr.party_name || pr.party_id}
        statusLabel={PAYMENT_REQUEST_STATUS_LABELS[pr.status] ?? pr.status}
        statusTone={
          pr.status === 'PAID'
            ? 'emerald'
            : pr.status === 'REJECTED' || pr.status === 'CANCELLED'
              ? 'rose'
              : pr.status === 'PENDING'
                ? 'amber'
                : 'slate'
        }
        onBack={() => navigate(PAYMENT_REQUEST_ROUTE_PREFIX)}
        backLabel="Payment Requests"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <PaymentRequestStatusBadge status={pr.status} />
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Party" value={pr.party_name || pr.party_id} />
                    <Field
                      label="Amount"
                      value={`${pr.currency_code} ${pr.amount.toLocaleString()}`}
                    />
                    <Field label="Due date" value={pr.due_date} />
                    <Field label="Invoice" value={pr.invoice_id} />
                    <Field label="Job" value={pr.job_id} />
                    <Field label="Remarks" value={pr.remarks} />
                    <Field label="Rejected reason" value={pr.rejected_reason} />
                    <Field label="Approved at" value={pr.approved_at} />
                    <Field label="Paid at" value={pr.paid_at} />
                  </dl>
                </Card>
              </div>
            ),
          },
        ]}
      />

      <PaymentRequestRejectModal
        open={rejectOpen}
        isPending={reject.isPending}
        onClose={() => setRejectOpen(false)}
        onReject={async (dto) => {
          await reject.mutateAsync(dto);
          setRejectOpen(false);
          setActionMessage('Rejected.');
          refetch();
        }}
      />
    </>
  );
}

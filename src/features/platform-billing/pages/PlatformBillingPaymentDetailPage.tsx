import { useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useDownloadPlatformPaymentProof,
  usePlatformPayment,
  useRefundPlatformPayment,
  useRejectPlatformPayment,
  useVerifyPlatformPayment,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '../components/PlatformBillingFieldGrid';
import { statusBadgeVariant } from '../utils/platformBillingUi';

export default function PlatformBillingPaymentDetailPage() {
  const { id = '' } = useParams();
  const payment = usePlatformPayment(id);
  const verify = useVerifyPlatformPayment();
  const reject = useRejectPlatformPayment();
  const refund = useRefundPlatformPayment();
  const downloadProof = useDownloadPlatformPaymentProof();

  const [verifyNotes, setVerifyNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(`${label} completed.`);
      await payment.refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  if (payment.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading payment…</p>;
  }

  if (payment.isError || !payment.data) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/superadmin/billing/payments" label="Back to payments" />
        <PlatformBillingErrorAlert error={payment.error} onRetry={() => payment.refetch()} />
      </div>
    );
  }

  const pay = payment.data;

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing/payments" label="Back to payments" />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={appType.pageTitle}>Payment {pay.id}</h2>
        {pay.status && <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge>}
      </div>

      {actionError && (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      )}
      {actionMessage && (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      )}

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <PlatformBillingFieldGrid normalized={pay as unknown as Record<string, unknown>} raw={pay.raw} />
      </Card>

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Review</CardTitle>
        </CardHeader>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={downloadProof.isPending}
          onClick={() =>
            void run('Proof download', () =>
              downloadProof.mutateAsync({ id, fileName: `payment-proof-${id}` }),
            )
          }
        >
          Download proof
        </Button>
        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run('Verify', () =>
              verify.mutateAsync({
                id,
                dto: verifyNotes.trim() ? { notes: verifyNotes.trim() } : undefined,
              }),
            );
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Verify notes (optional)
            <Input value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} />
          </label>
          <Button type="submit" size="sm" disabled={verify.isPending}>
            Verify
          </Button>
        </form>
        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run('Reject', () =>
              reject.mutateAsync({
                id,
                dto: { reason: rejectReason.trim() || undefined },
              }),
            );
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Reject reason
            <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </label>
          <Button type="submit" size="sm" variant="danger" disabled={reject.isPending}>
            Reject
          </Button>
        </form>
        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = refundAmount.trim() ? Number(refundAmount) : undefined;
            void run('Refund', () =>
              refund.mutateAsync({
                id,
                dto: {
                  amount: amount != null && Number.isFinite(amount) ? amount : undefined,
                  reason: refundReason.trim() || undefined,
                },
              }),
            );
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Refund amount (optional)
            <Input
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Refund reason
            <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
          </label>
          <Button type="submit" size="sm" variant="secondary" disabled={refund.isPending}>
            Refund
          </Button>
        </form>
      </Card>
    </div>
  );
}

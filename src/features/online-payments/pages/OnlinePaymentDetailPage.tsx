import { useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { Link, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import {
  formatBillingScalar,
  openBillingCheckoutUrl,
  statusBadgeVariant,
} from '@/features/platform-billing/utils/platformBillingUi';
import {
  useCancelOnlinePayment,
  useOnlinePayment,
  useOnlinePaymentCheckoutStatus,
  useOnlinePaymentRefunds,
  useOnlineRefund,
  useRefundOnlinePayment,
  useRetryOnlinePayment,
  useStartOnlinePaymentCheckout,
} from '../hooks/useOnlinePayments';

function RefundDetailExpand({ refundId }: { refundId: string }) {
  const detail = useOnlineRefund(refundId);
  if (detail.isLoading) {
    return <p className="mt-2 text-xs text-[var(--color-neutral-500)]">Loading refund…</p>;
  }
  if (detail.isError || !detail.data) {
    return (
      <p className="mt-2 text-xs text-[var(--color-danger-600)]">
        {detail.error instanceof Error ? detail.error.message : 'Could not load refund detail.'}
      </p>
    );
  }
  return (
    <div className="mt-2">
      <PlatformBillingFieldGrid
        normalized={detail.data as unknown as Record<string, unknown>}
        raw={detail.data.raw}
      />
    </div>
  );
}

export default function OnlinePaymentDetailPage() {
  const { id = '' } = useParams();
  const payment = useOnlinePayment(id);
  const checkoutStatus = useOnlinePaymentCheckoutStatus(id);
  const refunds = useOnlinePaymentRefunds(id);
  const startCheckout = useStartOnlinePaymentCheckout();
  const cancelPayment = useCancelOnlinePayment();
  const retryPayment = useRetryOnlinePayment();
  const refundPayment = useRefundOnlinePayment();

  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedRefundId, setExpandedRefundId] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await fn();
      setActionMessage(`${label} completed.`);
      await payment.refetch();
      await checkoutStatus.refetch();
      await refunds.refetch();
      return result;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return null;
    }
  };

  if (payment.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading payment…</p>;
  }

  if (payment.isError || !payment.data) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/finance/online-payments" label="Back to online payments" />
        <PlatformBillingErrorAlert error={payment.error} onRetry={() => payment.refetch()} />
      </div>
    );
  }

  const pay = payment.data;

  return (
    <div className="space-y-4">
      <PageBackLink to="/finance/online-payments" label="Back to online payments" />
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
        {pay.invoiceId && (
          <p className="text-sm">
            Invoice:{' '}
            <Link to={`/invoices/${pay.invoiceId}`} className="text-[var(--color-primary-600)] hover:underline">
              {pay.invoiceId}
            </Link>
          </p>
        )}
        {pay.checkoutUrl && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => openBillingCheckoutUrl({ url: pay.checkoutUrl })}
          >
            Open checkout URL
          </Button>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Checkout status</CardTitle>
        </CardHeader>
        {checkoutStatus.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {checkoutStatus.isError && (
          <PlatformBillingErrorAlert error={checkoutStatus.error} onRetry={() => checkoutStatus.refetch()} />
        )}
        {checkoutStatus.data && (
          <PlatformBillingFieldGrid
            normalized={checkoutStatus.data as unknown as Record<string, unknown>}
            raw={checkoutStatus.data.raw}
          />
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = checkoutAmount.trim() ? Number(checkoutAmount) : undefined;
            void run('Checkout', async () => {
              const res = await startCheckout.mutateAsync({
                id,
                dto: amount != null && Number.isFinite(amount) ? { amount } : undefined,
              });
              openBillingCheckoutUrl(res);
              return res;
            });
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Checkout amount (optional)
            <Input
              type="number"
              step="0.01"
              value={checkoutAmount}
              onChange={(e) => setCheckoutAmount(e.target.value)}
            />
          </label>
          <Button type="submit" size="sm" disabled={startCheckout.isPending}>
            Start checkout
          </Button>
        </form>
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={retryPayment.isPending}
            onClick={() => void run('Retry', () => retryPayment.mutateAsync({ id }))}
          >
            Retry
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={cancelPayment.isPending}
            onClick={() => void run('Cancel', () => cancelPayment.mutateAsync({ id }))}
          >
            Cancel
          </Button>
        </div>
        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = refundAmount.trim() ? Number(refundAmount) : undefined;
            void run('Refund', () =>
              refundPayment.mutateAsync({
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
          <Button type="submit" size="sm" variant="secondary" disabled={refundPayment.isPending}>
            Refund
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Refunds</CardTitle>
        </CardHeader>
        {refunds.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {refunds.isError && (
          <PlatformBillingErrorAlert error={refunds.error} onRetry={() => refunds.refetch()} />
        )}
        <div className="space-y-2">
          {(refunds.data ?? []).map((ref) => (
            <div
              key={ref.id}
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="font-medium text-[var(--color-primary-600)] hover:underline"
                  onClick={() =>
                    setExpandedRefundId((current) => (current === ref.id ? null : ref.id))
                  }
                >
                  {ref.id}
                </button>
                <span className="text-[var(--color-neutral-500)]">
                  {formatBillingScalar(ref.amount)} {formatBillingScalar(ref.currencyCode)}
                </span>
                {ref.status && <Badge variant={statusBadgeVariant(ref.status)}>{ref.status}</Badge>}
              </div>
              {expandedRefundId === ref.id ? <RefundDetailExpand refundId={ref.id} /> : null}
            </div>
          ))}
          {(refunds.data?.length ?? 0) === 0 && !refunds.isLoading && (
            <p className="text-sm text-[var(--color-neutral-500)]">No refunds yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import {
  useDownloadTenantPlatformPaymentProof,
  useTenantPlatformPayment,
} from '../hooks/useTenantPlatformBilling';
import { statusBadgeVariant } from '../utils/tenantPlatformBillingUi';

export default function TenantPlatformPaymentDetailPage() {
  const { id = '' } = useParams();
  const payment = useTenantPlatformPayment(id);
  const downloadProof = useDownloadTenantPlatformPaymentProof();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(`${label} completed.`);
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
        <PageBackLink to="/settings/billing" label="Back to billing" />
        <PlatformBillingErrorAlert error={payment.error} onRetry={() => payment.refetch()} />
      </div>
    );
  }

  const pay = payment.data;

  return (
    <div className="space-y-4 max-w-5xl">
      <PageBackLink to="/settings/billing" label="Back to billing" />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Payment {pay.id}</h2>
        {pay.status ? <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge> : null}
      </div>

      {actionError ? (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      ) : null}

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <PlatformBillingFieldGrid normalized={pay as unknown as Record<string, unknown>} raw={pay.raw} />
        {pay.invoiceId ? (
          <p className="text-sm pt-2 border-t">
            Invoice:{' '}
            <Link
              to={`/settings/billing/invoices/${pay.invoiceId}`}
              className="text-[var(--color-primary-600)] hover:underline"
            >
              {pay.invoiceId}
            </Link>
          </p>
        ) : null}
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payment proof</CardTitle>
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
      </Card>
    </div>
  );
}

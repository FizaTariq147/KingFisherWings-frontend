import { useRef, useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { Link, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import {
  useCheckoutTenantPlatformInvoice,
  useDownloadTenantPlatformInvoicePdf,
  useTenantPlatformInvoice,
  useTenantPlatformInvoicePaymentStatus,
  useUploadTenantPlatformInvoicePaymentProof,
} from '../hooks/useTenantPlatformBilling';
import { openCheckout, statusBadgeVariant } from '../utils/tenantPlatformBillingUi';

export default function TenantPlatformInvoiceDetailPage() {
  const { id = '' } = useParams();
  const invoice = useTenantPlatformInvoice(id);
  const paymentStatus = useTenantPlatformInvoicePaymentStatus(id);
  const downloadPdf = useDownloadTenantPlatformInvoicePdf();
  const checkoutInvoice = useCheckoutTenantPlatformInvoice(id);
  const uploadProof = useUploadTenantPlatformInvoicePaymentProof(id);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await fn();
      setActionMessage(`${label} completed.`);
      return result;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return null;
    }
  };

  if (invoice.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading invoice…</p>;
  }

  if (invoice.isError || !invoice.data) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/settings/billing" label="Back to billing" />
        <PlatformBillingErrorAlert error={invoice.error} onRetry={() => invoice.refetch()} />
      </div>
    );
  }

  const inv = invoice.data;

  return (
    <div className="space-y-4 max-w-5xl">
      <PageBackLink to="/settings/billing" label="Back to billing" />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={appType.pageTitle}>
          Invoice {inv.number || inv.id}
        </h2>
        {inv.status ? <Badge variant={statusBadgeVariant(inv.status)}>{inv.status}</Badge> : null}
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
        <PlatformBillingFieldGrid normalized={inv as unknown as Record<string, unknown>} raw={inv.raw} />
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Pay & documents</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={downloadPdf.isPending}
            onClick={() =>
              void run('PDF download', () =>
                downloadPdf.mutateAsync({ id, fileName: `invoice-${inv.number ?? id}.pdf` }),
              )
            }
          >
            Download PDF
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={checkoutInvoice.isPending}
            onClick={() =>
              void run('Checkout', async () => {
                const session = await checkoutInvoice.mutateAsync({});
                openCheckout(session);
                return session;
              })
            }
          >
            Pay (checkout)
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payment status</CardTitle>
        </CardHeader>
        {paymentStatus.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {paymentStatus.isError && (
          <PlatformBillingErrorAlert error={paymentStatus.error} onRetry={() => paymentStatus.refetch()} />
        )}
        {paymentStatus.data ? (
          <PlatformBillingFieldGrid
            normalized={paymentStatus.data as unknown as Record<string, unknown>}
            raw={paymentStatus.data.raw}
          />
        ) : null}
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Upload payment proof</CardTitle>
        </CardHeader>
        <input
          ref={proofInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void run('Proof upload', () => uploadProof.mutateAsync({ file }));
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={uploadProof.isPending}
            onClick={() => proofInputRef.current?.click()}
          >
            {uploadProof.isPending ? 'Uploading…' : 'Choose file & upload'}
          </Button>
        </div>
      </Card>

      <p className="text-xs text-[var(--color-neutral-500)]">
        Related payments appear on the{' '}
        <Link to="/settings/billing" className="text-[var(--color-primary-600)] hover:underline">
          billing hub
        </Link>
        .
      </p>
    </div>
  );
}

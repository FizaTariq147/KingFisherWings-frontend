import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import {
  useDownloadPortalInvoiceProofFile,
  usePayPortalInvoice,
  usePortalInvoice,
  usePortalInvoicePaymentProofs,
  usePortalInvoicePaymentStatus,
  usePortalInvoicePdfBlob,
  usePortalInvoiceStripeConfig,
  useRecordPortalInvoicePayment,
} from '../hooks/usePortalInvoices';
import { PaymentProofList, PortalInvoicePaymentForm } from '@/features/payment-proofs/components/PaymentProofPanels';
import { adjustInvoiceAmountsWithProofs } from '@/features/payment-proofs/utils/adjustInvoiceAmountsWithProofs';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import {
  invoiceEligibleForOnlinePay,
  isPendingLikePaymentStatus,
  isPortalOnlinePayAvailable,
  openBillingCheckoutUrl,
  portalPaymentStatusBadgeVariant,
} from '@/features/portal-payments/utils/portalPaymentsUi';

export default function PortalInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalInvoice(id);
  const pdfBlob = usePortalInvoicePdfBlob();
  const { data: proofs = [] } = usePortalInvoicePaymentProofs(id);
  const recordPayment = useRecordPortalInvoicePayment(id);
  const stripeConfig = usePortalInvoiceStripeConfig();
  const payInvoice = usePayPortalInvoice(id);
  const downloadProof = useDownloadPortalInvoiceProofFile();
  const [payStarted, setPayStarted] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [proofDownloadError, setProofDownloadError] = useState<string | null>(null);
  const [downloadingProofId, setDownloadingProofId] = useState<string | null>(null);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyFileName, setPdfReadyFileName] = useState('invoice.pdf');

  const amounts = useMemo(
    () =>
      adjustInvoiceAmountsWithProofs(
        {
          totalAmount: data?.totalAmount,
          paidAmount: data?.paidAmount,
          outstandingBalance: data?.outstandingBalance,
          status: data?.status,
        },
        proofs,
      ),
    [data?.totalAmount, data?.paidAmount, data?.outstandingBalance, data?.status, proofs],
  );

  const onlinePayAvailable = isPortalOnlinePayAvailable(stripeConfig.data);

  const showPayNow = useMemo(() => {
    if (!data) return false;
    if (!onlinePayAvailable) return false;
    if (amounts.displayStatus === 'PAID' || amounts.remainingAmount <= 0) return false;
    return invoiceEligibleForOnlinePay({
      status: amounts.displayStatus,
      outstandingBalance: amounts.remainingAmount,
    });
  }, [data, onlinePayAvailable, amounts.displayStatus, amounts.remainingAmount]);

  const paymentStatus = usePortalInvoicePaymentStatus(
    id,
    Boolean(id) && (onlinePayAvailable || payStarted),
    {
      refetchInterval: (query) =>
        isPendingLikePaymentStatus(query.state.data?.status) ? 4000 : false,
    },
  );

  const openInvoicePdf = (invoiceId: string, name: string) => {
    setPdfError(null);
    setPdfReadyBlob(null);
    setPdfReadyFileName(`${name || 'invoice'}.pdf`);
    setPdfReadyOpen(true);
    void pdfBlob
      .mutateAsync({ id: invoiceId, name })
      .then(({ blob, fileName }) => {
        setPdfReadyBlob(blob);
        setPdfReadyFileName(fileName);
      })
      .catch((err) => {
        setPdfReadyOpen(false);
        setPdfError(
          err instanceof PortalApiError || err instanceof Error
            ? err.message
            : 'Could not download invoice PDF.',
        );
      });
  };

  const startPayNow = async () => {
    setPayError(null);
    setPayStarted(true);
    try {
      const result = await payInvoice.mutateAsync({});
      openBillingCheckoutUrl(result);
      void paymentStatus.refetch();
    } catch (err) {
      setPayError(
        err instanceof PortalApiError || err instanceof Error
          ? err.message
          : 'Could not start online payment.',
      );
    }
  };

  if (isLoading) return <PortalLoadingState label="Loading invoice…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Invoice not found.'}</p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        <Link to="/portal/invoices" className="block text-sm text-[var(--color-primary)] underline">Back to invoices</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/portal/invoices" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={14} aria-hidden="true" /> Back to invoices
      </Link>
      <PortalPageHeader
        title={data.number}
        description={[data.invoiceDate, data.dueDate ? `Due ${data.dueDate}` : null].filter(Boolean).join(' · ') || 'Invoice detail'}
        actions={
          <>
            {amounts.displayStatus ? (
              <Badge
                variant={
                  amounts.displayStatus === 'PAID'
                    ? 'success'
                    : amounts.displayStatus === 'PARTIALLY_PAID'
                      ? 'warning'
                      : 'info'
                }
              >
                {amounts.displayStatus.replaceAll('_', ' ')}
              </Badge>
            ) : null}
            {showPayNow ? (
              <Button
                type="button"
                size="sm"
                disabled={payInvoice.isPending}
                onClick={() => void startPayNow()}
              >
                <CreditCard size={14} aria-hidden="true" />
                {payInvoice.isPending ? 'Starting…' : 'Pay now'}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/disputes?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Raise dispute
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/messages?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Message
            </Button>
            {data.jobId ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/portal/shipments/${data.jobId}`)}
              >
                Shipment
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="secondary" disabled={pdfBlob.isPending}
              onClick={() => openInvoicePdf(data.id, data.number)}>
              <Download size={14} /> {pdfBlob.isPending ? 'Preparing…' : 'Download PDF'}
            </Button>
          </>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      {payError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {payError}
        </p>
      ) : null}
      {proofDownloadError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {proofDownloadError}
        </p>
      ) : null}
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Total"
            value={amounts.totalAmount ?? data.totalAmount ?? '—'}
            hint={`Paid ${amounts.paidAmount}${amounts.includesPendingProofs ? ' (incl. pending proof)' : ''}`}
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Paid" value={amounts.paidAmount} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Balance due" value={amounts.remainingAmount} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Currency" value={data.currencyCode || '—'} />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      {amounts.includesPendingProofs ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Paid includes {amounts.pendingProofAmount} from payment proof(s) still awaiting staff
          review (legacy proof upload). Prefer Record payment below to post immediately.
        </p>
      ) : null}
      {(onlinePayAvailable || payStarted) &&
        (paymentStatus.isLoading || paymentStatus.data?.status || paymentStatus.isError) && (
        <PortalPanel padded className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Online payment status</h2>
            {paymentStatus.data?.status ? (
              <Badge variant={portalPaymentStatusBadgeVariant(paymentStatus.data.status)}>
                {paymentStatus.data.status.replaceAll('_', ' ')}
              </Badge>
            ) : null}
            {paymentStatus.isFetching && isPendingLikePaymentStatus(paymentStatus.data?.status) ? (
              <span className="text-xs text-[var(--color-neutral-500)]">Updating…</span>
            ) : null}
          </div>
          {paymentStatus.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-500)]">Loading payment status…</p>
          ) : paymentStatus.isError ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-[var(--color-danger-600)]">Could not load payment status.</p>
              <Button type="button" size="sm" variant="secondary" onClick={() => paymentStatus.refetch()}>
                Retry
              </Button>
            </div>
          ) : paymentStatus.data ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {paymentStatus.data.paidAmount != null ? (
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Paid (online)</dt>
                  <dd className="font-medium tabular-nums">{paymentStatus.data.paidAmount}</dd>
                </div>
              ) : null}
              {paymentStatus.data.outstandingAmount != null ? (
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Outstanding</dt>
                  <dd className="font-medium tabular-nums">{paymentStatus.data.outstandingAmount}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </PortalPanel>
      )}
      {data.remarks ? <PortalPanel padded><p className="text-sm text-[var(--color-neutral-700)]">{data.remarks}</p></PortalPanel> : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Lines</h2>
        {!data.lines.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p>
        ) : (
          <PortalAnimatedList className="space-y-2">
            {data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0"
              >
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">{line.lineTotal ?? '—'}</span>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      <PortalPanel padded className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Payments &amp; proofs</h2>
        <PaymentProofList
          proofs={proofs}
          viewer="portal"
          downloadingProofId={downloadingProofId}
          onDownload={(proof) => {
            setDownloadingProofId(proof.id);
            void downloadProof
              .mutateAsync({
                invoiceId: id,
                proofId: proof.id,
                fileName: proof.fileName || proof.reference || 'payment-proof',
              })
              .catch((err) => {
                setProofDownloadError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not download payment proof.',
                );
              })
              .finally(() => setDownloadingProofId(null));
          }}
        />
        {amounts.remainingAmount > 0 ? (
          <PortalInvoicePaymentForm
            disabled={recordPayment.isPending}
            currencyCode={data.currencyCode}
            remainingAmount={amounts.remainingAmount}
            onRecord={async (file, dto) => {
              await recordPayment.mutateAsync({ file, dto });
            }}
          />
        ) : (
          <p className="text-xs text-[var(--color-neutral-500)]">
            This invoice is fully paid — no further payment needed.
          </p>
        )}
      </PortalPanel>

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
        }}
        blob={pdfReadyBlob}
        title="Invoice PDF ready"
        fileName={pdfReadyFileName}
        skipBranding
        description="Your invoice PDF was created successfully."
      />
    </div>
  );
}

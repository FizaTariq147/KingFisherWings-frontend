import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import { PaymentProofList } from '@/features/payment-proofs/components/PaymentProofPanels';
import { adjustInvoiceAmountsWithProofs } from '@/features/payment-proofs/utils/adjustInvoiceAmountsWithProofs';
import {
  formatShareEmailSuccess,
  ShareEmailModal,
  type ShareEmailDto,
} from '@/features/shared/share-email';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import {
  vendorErrorMessage,
  vendorInvoicePdfErrorMessage,
} from '@/features/vendor-shared/vendorUnavailable';
import {
  useDownloadVendorInvoicePaymentProof,
  usePostVendorInvoice,
  useSendVendorInvoiceEmail,
  useVendorInvoice,
  useVendorInvoicePaymentProofs,
  useVendorInvoicePaymentStatus,
  useVendorInvoicePdfBlob,
} from '../hooks/useVendorInvoices';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';

export default function VendorInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useVendorInvoice(id);
  const {
    data: proofs = [],
    isLoading: proofsLoading,
    isError: proofsError,
    error: proofsLoadError,
    refetch: refetchProofs,
  } = useVendorInvoicePaymentProofs(id);
  const paymentStatus = useVendorInvoicePaymentStatus(id);
  const downloadProof = useDownloadVendorInvoicePaymentProof();
  const pdfBlob = useVendorInvoicePdfBlob();
  const postInvoice = usePostVendorInvoice();
  const sendInvoiceEmail = useSendVendorInvoiceEmail();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [proofDownloadError, setProofDownloadError] = useState<string | null>(null);
  const [downloadingProofId, setDownloadingProofId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyFileName, setPdfReadyFileName] = useState('invoice.pdf');

  const amounts = useMemo(() => {
    if (!data) {
      return adjustInvoiceAmountsWithProofs({}, proofs);
    }
    const statusFromPayment =
      paymentStatus.data?.status ||
      data.status;
    const paidFromPayment =
      paymentStatus.data?.paidAmount != null
        ? paymentStatus.data.paidAmount
        : data.paidAmount;
    const outstandingFromPayment =
      paymentStatus.data?.outstandingAmount != null
        ? paymentStatus.data.outstandingAmount
        : data.outstandingBalance;
    return adjustInvoiceAmountsWithProofs(
      {
        totalAmount: data.totalAmount,
        paidAmount: paidFromPayment,
        outstandingBalance: outstandingFromPayment,
        status: statusFromPayment,
      },
      proofs,
    );
  }, [data, proofs, paymentStatus.data]);

  const openInvoicePdf = (invoiceId: string, name: string, pdfUrl?: string) => {
    setPdfError(null);
    setPdfReadyBlob(null);
    setPdfReadyFileName(name.endsWith('.pdf') ? name : `${name || 'invoice'}.pdf`);
    setPdfReadyOpen(true);
    void pdfBlob
      .mutateAsync({ id: invoiceId, name, pdfUrl })
      .then(({ blob, fileName }) => {
        setPdfReadyBlob(blob);
        setPdfReadyFileName(fileName);
      })
      .catch((err) => {
        setPdfReadyOpen(false);
        setPdfError(vendorInvoicePdfErrorMessage(err));
      });
  };

  if (isLoading) return <PortalLoadingState label="Loading invoice…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <VendorQueryError error={error} onRetry={() => void refetch()} />
        <Link to="/vendor/invoices" className="block text-sm text-[var(--color-primary)] underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  const displayStatus = amounts.displayStatus;
  const rawStatusUpper = String(data.status || '').trim().toUpperCase();
  // Gate post on API workflow status, not remittance-derived display status.
  const canPost =
    rawStatusUpper === 'DRAFT' || rawStatusUpper === 'SUBMITTED' || rawStatusUpper === '';
  const emailPending = sendInvoiceEmail.isPending;

  const onShare = async (dto: ShareEmailDto) => {
    const result = await sendInvoiceEmail.mutateAsync({ id: data.id, dto });
    setShareOpen(false);
    setEmailMessage(formatShareEmailSuccess(result));
  };

  const onPost = () => {
    setActionError(null);
    setActionMessage(null);
    void postInvoice
      .mutateAsync(data)
      .then(() => {
        setActionMessage(
          'Invoice submitted. It appears under Purchase Invoices as a draft for your forwarder to post. Remittance proofs they upload will appear here.',
        );
        void refetch();
        void refetchProofs();
        void paymentStatus.refetch();
      })
      .catch((err) => {
        setActionError(vendorErrorMessage(err, 'Could not post invoice.'));
      });
  };

  return (
    <div className="space-y-5">
      <Link
        to="/vendor/invoices"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to invoices
      </Link>
      <PortalPageHeader
        title={data.number}
        description={
          [data.invoiceDate, data.dueDate ? `Due ${data.dueDate}` : null]
            .filter(Boolean)
            .join(' · ') || 'Invoice detail'
        }
        actions={
          <>
            {displayStatus ? (
              <Badge variant="info">{displayStatus.replaceAll('_', ' ')}</Badge>
            ) : null}
            {canPost ? (
              <Button
                type="button"
                size="sm"
                disabled={postInvoice.isPending}
                onClick={onPost}
              >
                {postInvoice.isPending ? 'Posting…' : 'Post invoice'}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/vendor/disputes?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Raise dispute
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={emailPending}
              onClick={() => {
                setEmailMessage(null);
                setShareOpen(true);
              }}
            >
              <Mail size={14} />
              Email PI
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pdfBlob.isPending}
              onClick={() => openInvoicePdf(data.id, `${data.number}.pdf`, data.pdfUrl)}
            >
              <Download size={14} />
              {pdfBlob.isPending ? 'Preparing…' : 'PDF'}
            </Button>
          </>
        }
      />
      {actionError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      ) : null}
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : canPost && !data.pdfUrl ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          Post this invoice so your forwarder can process it under Purchase Invoices. Remittance
          proofs they upload will appear on this page.
        </p>
      ) : null}
      {emailMessage ? (
        <p className="text-sm text-emerald-700" role="status">
          {emailMessage}
        </p>
      ) : null}
      {proofDownloadError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {proofDownloadError}
        </p>
      ) : null}

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Total"
            value={formatVendorMoney(amounts.totalAmount ?? data.totalAmount, data.currencyCode)}
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Paid"
            value={formatVendorMoney(amounts.paidAmount, data.currencyCode)}
            hint={
              amounts.includesPendingProofs
                ? `Incl. ${formatVendorMoney(amounts.pendingProofAmount, data.currencyCode)} pending proof`
                : undefined
            }
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Balance due"
            value={formatVendorMoney(amounts.remainingAmount, data.currencyCode)}
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Tax" value={formatVendorMoney(data.taxTotal, data.currencyCode)} />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      {data.remarks ? (
        <PortalPanel padded>
          <p className="text-sm text-[var(--color-neutral-700)]">{data.remarks}</p>
        </PortalPanel>
      ) : null}

      <PortalPanel>
        {data.lines.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--color-neutral-500)]">No line items.</p>
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{line.description}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    Qty {line.quantity ?? '—'} · {formatVendorMoney(line.unitPrice, data.currencyCode)}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatVendorMoney(line.lineTotal, data.currencyCode)}
                </div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      <PortalPanel padded className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Payment proofs</h2>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              void refetch();
              void refetchProofs();
              void paymentStatus.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
        {proofsLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading payment proofs…</p>
        ) : proofsError ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]" role="alert">
              {vendorErrorMessage(proofsLoadError, 'Could not load payment proofs.')}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void refetchProofs()}>
              Retry
            </Button>
          </div>
        ) : (
          <PaymentProofList
            proofs={proofs}
            viewer="vendor"
            downloadingProofId={downloadingProofId}
            onDownload={(proof) => {
              setProofDownloadError(null);
              setDownloadingProofId(proof.id);
              void downloadProof
                .mutateAsync({
                  invoiceId: id,
                  proof,
                  fileName: proof.fileName || proof.reference || 'payment-proof',
                })
                .catch((err) => {
                  setProofDownloadError(
                    vendorErrorMessage(err, 'Could not download payment proof.'),
                  );
                })
                .finally(() => setDownloadingProofId(null));
            }}
          />
        )}
        {amounts.includesPendingProofs ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            Paid includes remittance proof(s) still awaiting finance review.
          </p>
        ) : null}
      </PortalPanel>

      <ShareEmailModal
        open={shareOpen}
        title="Email PI PDF to admin"
        description="Default admin inbox is the tenant email / finance users when To is left empty."
        isPending={emailPending}
        onClose={() => setShareOpen(false)}
        onSend={onShare}
      />

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

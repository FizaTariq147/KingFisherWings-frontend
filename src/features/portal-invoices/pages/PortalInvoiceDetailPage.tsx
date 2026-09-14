import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
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
import { usePortalInvoice, usePortalInvoicePaymentProofs, usePortalInvoicePdfBlob, useUploadPortalInvoicePaymentProof } from '../hooks/usePortalInvoices';
import { PaymentProofList, PaymentProofUploadForm } from '@/features/payment-proofs/components/PaymentProofPanels';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';

export default function PortalInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalInvoice(id);
  const pdfBlob = usePortalInvoicePdfBlob();
  const { data: proofs = [] } = usePortalInvoicePaymentProofs(id);
  const uploadProof = useUploadPortalInvoicePaymentProof(id);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyFileName, setPdfReadyFileName] = useState('invoice.pdf');

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
            {data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
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
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalAnimatedGridItem><PortalStatCard label="Total" value={data.totalAmount ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Paid" value={data.paidAmount ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Balance due" value={data.outstandingBalance ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Currency" value={data.currencyCode || '—'} /></PortalAnimatedGridItem>
      </PortalAnimatedGrid>
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
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Payment proofs</h2>
        <PaymentProofList proofs={proofs} viewer="portal" />
        <PaymentProofUploadForm
          disabled={uploadProof.isPending}
          currencyCode={data.currencyCode}
          onUpload={async (file, dto) => {
            await uploadProof.mutateAsync({ file, dto });
          }}
        />
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

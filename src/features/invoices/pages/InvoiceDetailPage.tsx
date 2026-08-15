import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { invoicePdfBranding } from '@/features/files/utils/pdfBranding';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceEmailModal } from '../components/InvoiceEmailModal';
import { InvoiceLinesEditor } from '../components/InvoiceLinesEditor';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from '../constants/invoice.constants';
import { useInvoiceActions, useInvoicePdf } from '../hooks/useInvoiceActions';
import { useDeleteInvoice, useInvoice } from '../hooks/useInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';
import { invoiceDisplayNumber } from '../utils/normalizeInvoice';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);
  const actions = useInvoiceActions(id);
  const remove = useDeleteInvoice();
  const { data: pdfInfo, refetch: refetchPdf } = useInvoicePdf(id, Boolean(id));
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyUrl, setPdfReadyUrl] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !invoice) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Invoice not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const editable = invoice.status === 'DRAFT';
  const canPost = invoice.status === 'DRAFT';
  const canCancel = !['CANCELLED', 'VOID', 'PAID'].includes(invoice.status);
  const pdfUrl = pdfInfo?.pdf_url || pdfInfo?.customer_pdf_url || invoice.pdf_url;
  const invoiceNumber = invoiceDisplayNumber(invoice);
  const pdfFileName = formatPdfFilename(invoiceNumber, 'invoice');
  const pdfBranding = invoicePdfBranding(invoiceNumber, invoice.invoice_date);

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
    ...(editable
      ? [
          {
            label: 'Edit',
            onClick: () => navigate(`${INVOICE_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(canPost
      ? [
          {
            label: 'Post',
            onClick: () => void run(() => actions.post.mutateAsync(), 'Invoice posted.'),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(invoice.status === 'POSTED'
      ? [
          {
            label: 'Credit note',
            onClick: () => navigate(`/credit-notes/new?invoice=${id}`),
            variant: 'secondary' as const,
          },
          {
            label: 'Payment request',
            onClick: () => navigate(`/payment-requests/new?invoice=${id}`),
            variant: 'secondary' as const,
          },
        ]
      : []),
    {
      label: 'Send',
      onClick: () => setEmailOpen(true),
      variant: 'secondary' as const,
    },
    {
      label: 'Generate PDF',
      onClick: () => {
        if (invoice.status === 'DRAFT') {
          const ok = window.confirm(
            'This invoice is still DRAFT. Some backends only generate PDFs after Post. Continue anyway?',
          );
          if (!ok) return;
        }
        setPdfReadyUrl(null);
        setPdfReadyOpen(true);
        void run(async () => {
          try {
            const info = await actions.generatePdf.mutateAsync();
            let url = info?.pdf_url || info?.customer_pdf_url;
            for (let attempt = 0; attempt < 8 && !url; attempt += 1) {
              await new Promise((resolve) => {
                window.setTimeout(resolve, 1500);
              });
              try {
                const refreshed = await refetchPdf();
                url = refreshed.data?.pdf_url || refreshed.data?.customer_pdf_url || url;
              } catch {
                /* PDF info may lag while generation runs */
              }
            }
            if (!url) {
              throw new Error(
                'PDF is still generating. Use Open PDF on this page when it appears.',
              );
            }
            setPdfReadyUrl(url);
          } catch (err) {
            setPdfReadyOpen(false);
            throw err;
          }
        }, 'PDF ready.');
      },
      variant: 'secondary' as const,
    },
    ...(canCancel
      ? [
          {
            label: 'Cancel',
            onClick: () => {
              if (!window.confirm('Cancel this invoice?')) return;
              void run(() => actions.cancel.mutateAsync(), 'Invoice cancelled.');
            },
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: 'Delete',
            onClick: () => {
              if (!window.confirm('Delete this draft invoice?')) return;
              void run(async () => {
                await remove.mutateAsync(id);
                navigate(INVOICE_ROUTE_PREFIX);
              });
            },
            variant: 'danger' as const,
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
        title={invoiceNumber}
        subtitle={
          invoice.invoice_type
            ? INVOICE_TYPE_LABELS[invoice.invoice_type as InvoiceType] ?? invoice.invoice_type
            : invoice.party_name
        }
        statusLabel={INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
        statusTone={
          invoice.status === 'PAID'
            ? 'emerald'
            : invoice.status === 'CANCELLED' || invoice.status === 'VOID'
              ? 'rose'
              : invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID'
                ? 'amber'
                : 'slate'
        }
        onBack={() => navigate(INVOICE_ROUTE_PREFIX)}
        backLabel="Invoices"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Party" value={invoice.party_name || invoice.party_id} />
                    <Field label="Currency" value={invoice.currency_code} />
                    <Field label="Exchange rate" value={invoice.exchange_rate} />
                    <Field label="VAT rate %" value={invoice.vat_rate} />
                    <Field label="Invoice date" value={invoice.invoice_date} />
                    <Field label="Due date" value={invoice.due_date} />
                    <Field label="LPO" value={invoice.lpo_number} />
                    <Field label="Job" value={invoice.job_id} />
                    <Field label="Subtotal" value={invoice.subtotal} />
                    <Field label="Tax" value={invoice.tax_total} />
                    <Field
                      label="Total"
                      value={
                        invoice.total_amount != null
                          ? `${invoice.currency_code} ${invoice.total_amount}`
                          : undefined
                      }
                    />
                    <Field label="Outstanding" value={invoice.outstanding_balance} />
                    <Field label="Remarks" value={invoice.remarks} />
                    <Field label="Internal notes" value={invoice.internal_notes} />
                  </dl>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>PDF</CardTitle>
                  </CardHeader>
                  <div className="p-4 pt-0 text-sm">
                    {pdfUrl ? (
                      <StoredFileLink
                        url={pdfUrl}
                        label="Open PDF"
                        displayName={pdfFileName}
                        branding={pdfBranding}
                      />
                    ) : (
                      <p className="text-[var(--color-neutral-400)]">
                        No PDF yet. Use Generate PDF.
                      </p>
                    )}
                  </div>
                </Card>
                <InvoiceLinesEditor
                  invoiceId={id}
                  lines={invoice.lines ?? []}
                  editable={editable}
                />
              </div>
            ),
          },
        ]}
      />

      <InvoiceEmailModal
        open={emailOpen}
        isPending={actions.send.isPending}
        onClose={() => setEmailOpen(false)}
        onSend={async (dto) => {
          await actions.send.mutateAsync(dto);
          setEmailOpen(false);
          setActionMessage('Invoice emailed.');
          refetch();
        }}
      />

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => setPdfReadyOpen(false)}
        url={pdfReadyUrl}
        title="Invoice PDF ready"
        fileName={pdfFileName}
        branding={pdfBranding}
        description="Your invoice PDF was created successfully."
      />
    </>
  );
}

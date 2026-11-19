import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from '@/features/invoices/constants/invoice.constants';
import { commercialNoteToPdfModel } from '@/features/invoices/utils/commercialNoteToPdfModel';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { loadInvoiceJobForPdf } from '@/features/invoices/utils/loadInvoiceJobForPdf';
import { resolveInvoicePdfCompanyAsync } from '@/features/invoices/utils/resolveInvoicePdfCompany';
import { useJob } from '@/features/jobs/hooks/useJobs';
import { jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { useParty } from '@/features/parties/hooks/useParties';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { isUuid } from '@/lib/isUuid';
import { DEBIT_NOTE_ROUTE_PREFIX } from '../api/debitNote.api';
import { DebitNoteAttachmentPanel } from '../components/DebitNoteAttachmentPanel';
import {
  useDebitNote,
  useGenerateDebitNotePdf,
  usePostDebitNote,
  useUpdateDebitNote,
} from '../hooks/useDebitNotes';
import { getErrorMessage } from '../utils/getErrorMessage';
import { debitNoteDisplayNumber } from '../utils/normalizeDebitNote';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{value ?? '—'}</dd>
    </div>
  );
}

export default function DebitNoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: debitNote, isLoading, isError, error, refetch } = useDebitNote(id);
  const { data: linkedJob } = useJob(debitNote?.job_id || '');
  const { data: party } = useParty(debitNote?.party_id || '');
  const { data: companies = [] } = useTenantCompanies(true);
  const { data: orgProfile } = useOrganizationProfile();
  const post = usePostDebitNote(id);
  const update = useUpdateDebitNote(id);
  const generatePdf = useGenerateDebitNotePdf(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editRemarks, setEditRemarks] = useState('');
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !debitNote) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Debit note not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const canPost = debitNote.status === 'DRAFT';
  const canEdit = debitNote.actions?.can_edit !== false && debitNote.status === 'DRAFT';
  const canDownload =
    debitNote.actions?.can_download !== false &&
    ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID'].includes(debitNote.status);
  const lines = debitNote.lines ?? [];
  const noteNumber = debitNoteDisplayNumber(debitNote);
  const pdfFileName = formatPdfFilename(noteNumber, 'debit-note');
  const companyMatch =
    companies.find((c) => c.id && debitNote.company_id && c.id === debitNote.company_id) ||
    companies[0];

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

  const openClientPdf = async () => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    setPdfReadyBlob(null);
    setPdfReadyOpen(true);
    try {
      const pdfJob = (await loadInvoiceJobForPdf(debitNote.job_id)) || linkedJob || null;
      const company = await resolveInvoicePdfCompanyAsync({
        profile: orgProfile,
        companyName: companyMatch?.name,
      });
      const blob = await generateInvoicePdf(
        commercialNoteToPdfModel(debitNote, 'debit', {
          party,
          job: pdfJob,
          displayNumber: noteNumber,
          company,
        }),
      );
      setPdfReadyBlob(blob);
      setActionMessage('PDF ready.');
      try {
        await generatePdf.mutateAsync();
      } catch {
        /* ignore — client layout is the download face */
      }
      refetch();
    } catch (err) {
      setPdfReadyOpen(false);
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(canPost
      ? [
          {
            label: 'Post',
            onClick: () => void run(() => post.mutateAsync(), 'Debit note posted.'),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: 'Edit',
            onClick: () => {
              setEditRemarks(debitNote.remarks || '');
              setEditOpen(true);
            },
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(canDownload
      ? [
          {
            label: 'Download PDF',
            onClick: () => void openClientPdf(),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(debitNote.credited_invoice_id
      ? [
          {
            label: 'View invoice',
            onClick: () => navigate(`/invoices/${debitNote.credited_invoice_id}`),
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
        title={noteNumber}
        subtitle={
          debitNote.invoice_type
            ? INVOICE_TYPE_LABELS[debitNote.invoice_type as InvoiceType] ??
              debitNote.invoice_type
            : debitNote.party_name
        }
        statusLabel={INVOICE_STATUS_LABELS[debitNote.status] ?? debitNote.status}
        statusTone={
          debitNote.status === 'PAID'
            ? 'emerald'
            : debitNote.status === 'CANCELLED' || debitNote.status === 'VOID'
              ? 'rose'
              : debitNote.status === 'SENT' || debitNote.status === 'PARTIALLY_PAID'
                ? 'amber'
                : 'slate'
        }
        backTo={DEBIT_NOTE_ROUTE_PREFIX}
        backLabel="Debit Notes"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <InvoiceStatusBadge status={debitNote.status} />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Party" value={debitNote.party_name || '—'} />
                    <Field label="Currency" value={debitNote.currency_code} />
                    <Field label="Date" value={debitNote.invoice_date} />
                    <Field
                      label="Job number"
                      value={
                        linkedJob
                          ? jobDisplayNumber(linkedJob)
                          : (debitNote as { job_number?: string }).job_number
                      }
                    />
                    <div>
                      <dt className="text-xs text-[var(--color-neutral-400)]">Debited invoice</dt>
                      <dd className="mt-0.5 text-sm text-[var(--color-neutral-800)]">
                        {debitNote.credited_invoice_id ? (
                          <button
                            type="button"
                            className="text-left underline-offset-2 hover:underline"
                            onClick={() =>
                              navigate(`/invoices/${debitNote.credited_invoice_id}`)
                            }
                          >
                            {debitNote.credited_invoice_number ||
                              debitNote.credited_invoice_id.slice(0, 8).toUpperCase()}
                          </button>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <Field label="Subtotal" value={debitNote.subtotal} />
                    <Field label="Tax" value={debitNote.tax_total} />
                    <Field
                      label="Total"
                      value={
                        debitNote.total_amount != null
                          ? `${debitNote.currency_code ?? ''} ${debitNote.total_amount}`.trim()
                          : undefined
                      }
                    />
                    <Field label="Outstanding" value={debitNote.outstanding_balance} />
                    <Field label="Remarks" value={debitNote.remarks} />
                  </dl>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Lines</CardTitle>
                  </CardHeader>
                  <div className="p-4 pt-0">
                    {lines.length === 0 ? (
                      <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p>
                    ) : (
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((line) => {
                            const qty = Number(line.quantity);
                            const unit = Number(line.unit_price);
                            // Line Total = qty × unit price (ex-VAT). Do not show tax-inclusive
                            // line_total here — VAT stays in the header Tax / Total fields.
                            const lineAmount =
                              Number.isFinite(qty) && Number.isFinite(unit)
                                ? Math.round(qty * unit * 100) / 100
                                : line.line_total;
                            return (
                              <TableRow key={line.id}>
                                <TableCell>{line.description || '—'}</TableCell>
                                <TableCell mono>{line.quantity}</TableCell>
                                <TableCell mono>{line.unit_price}</TableCell>
                                <TableCell mono>
                                  {lineAmount != null ? lineAmount : '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Card>
                <DebitNoteAttachmentPanel
                  debitNoteId={debitNote.id}
                  hasAttachment={Boolean(debitNote.has_attachment)}
                  attachmentName={debitNote.attachment_name}
                />
                {debitNote.job_id && isUuid(debitNote.job_id) ? (
                  <SectionAttachmentsPanel
                    entity="jobs"
                    entityId={debitNote.job_id}
                    section="payment_requests"
                    recordId={debitNote.id}
                    title="Job documents (payment requests section)"
                  />
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit debit note"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || update.isPending}
              onClick={() =>
                void run(async () => {
                  await update.mutateAsync({
                    remarks: editRemarks.trim() || undefined,
                    description: editRemarks.trim() || undefined,
                  });
                  setEditOpen(false);
                }, 'Debit note updated.')
              }
            >
              Save
            </Button>
          </div>
        }
      >
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
            Remarks
          </span>
          <textarea
            className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={editRemarks}
            onChange={(e) => setEditRemarks(e.target.value)}
            maxLength={2000}
          />
        </label>
      </Modal>

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
        }}
        blob={pdfReadyBlob}
        title="Debit note PDF ready"
        fileName={pdfFileName}
        skipBranding
        description="Your debit note PDF uses the same KingFisher statement-of-charges layout as invoices."
      />
    </>
  );
}

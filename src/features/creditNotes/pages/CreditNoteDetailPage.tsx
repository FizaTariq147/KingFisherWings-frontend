import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
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
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from '@/features/invoices/constants/invoice.constants';
import { resolvePdfUrl } from '@/features/invoices/utils/normalizeInvoicePdf';
import { useJob } from '@/features/jobs/hooks/useJobs';
import { jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import { isUuid } from '@/lib/isUuid';
import { CREDIT_NOTE_ROUTE_PREFIX } from '../api/creditNote.api';
import { CreditNoteForm } from '../components/CreditNoteForm';
import {
  useCreditNote,
  useGenerateCreditNotePdf,
  usePostCreditNote,
  useUpdateCreditNote,
} from '../hooks/useCreditNotes';
import type { CreateCreditNoteFormValues } from '../types/creditNote.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { creditNoteDisplayNumber } from '../utils/normalizeCreditNote';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

function creditNoteToFormValues(
  note: NonNullable<ReturnType<typeof useCreditNote>['data']>,
): Partial<CreateCreditNoteFormValues> {
  return {
    credited_invoice_id: note.credited_invoice_id || '',
    job_id: note.job_id || '',
    party_id: note.party_id || '',
    currency_code: note.currency_code || 'AED',
    invoice_date: note.invoice_date,
    remarks: note.remarks,
    description: note.remarks,
    lines: (note.lines ?? []).map((line, index) => ({
      description: line.description || '',
      quantity: line.quantity ?? 1,
      unit_price: line.unit_price ?? 0,
      charge_code_id: line.charge_code_id,
      tax_rate_id: undefined,
      is_taxable: false,
      sort_order: line.sort_order ?? index,
    })),
  };
}

export default function CreditNoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: creditNote, isLoading, isError, error, refetch } = useCreditNote(id);
  const { data: linkedJob } = useJob(creditNote?.job_id || '');
  const post = usePostCreditNote(id);
  const update = useUpdateCreditNote(id);
  const generatePdf = useGenerateCreditNotePdf(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const editDefaults = useMemo(
    () => (creditNote ? creditNoteToFormValues(creditNote) : undefined),
    [creditNote],
  );

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !creditNote) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Credit note not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const canPost = creditNote.status === 'DRAFT';
  const canEdit = creditNote.actions?.can_edit !== false && creditNote.status === 'DRAFT';
  const canDownload =
    creditNote.actions?.can_download !== false &&
    ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID'].includes(creditNote.status);
  const lines = creditNote.lines ?? [];

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
    ...(canPost
      ? [
          {
            label: 'Post',
            onClick: () => void run(() => post.mutateAsync(), 'Credit note posted.'),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: 'Edit',
            onClick: () => setEditOpen(true),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(canDownload
      ? [
          {
            label: 'Download PDF',
            onClick: () =>
              void run(async () => {
                const info = await generatePdf.mutateAsync();
                const url = resolvePdfUrl(info.pdf_url || info.customer_pdf_url);
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
                else throw new Error('PDF generated but no download URL was returned.');
              }, 'PDF ready.'),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(creditNote.credited_invoice_id
      ? [
          {
            label: 'View invoice',
            onClick: () => navigate(`/invoices/${creditNote.credited_invoice_id}`),
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
        title={creditNoteDisplayNumber(creditNote)}
        subtitle={
          creditNote.invoice_type
            ? INVOICE_TYPE_LABELS[creditNote.invoice_type as InvoiceType] ??
              creditNote.invoice_type
            : creditNote.party_name
        }
        statusLabel={INVOICE_STATUS_LABELS[creditNote.status] ?? creditNote.status}
        statusTone={
          creditNote.status === 'PAID'
            ? 'emerald'
            : creditNote.status === 'CANCELLED' || creditNote.status === 'VOID'
              ? 'rose'
              : creditNote.status === 'SENT' || creditNote.status === 'PARTIALLY_PAID'
                ? 'amber'
                : 'slate'
        }
        backTo={CREDIT_NOTE_ROUTE_PREFIX}
        backLabel="Credit Notes"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <InvoiceStatusBadge status={creditNote.status} />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Party" value={creditNote.party_name || '—'} />
                    <Field label="Currency" value={creditNote.currency_code} />
                    <Field label="Date" value={creditNote.invoice_date} />
                    <Field
                      label="Job number"
                      value={
                        linkedJob
                          ? jobDisplayNumber(linkedJob)
                          : (creditNote as { job_number?: string }).job_number
                      }
                    />
                    <div>
                      <dt className="text-xs text-[var(--color-neutral-400)]">
                        Credited invoice
                      </dt>
                      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">
                        {creditNote.credited_invoice_id ? (
                          <button
                            type="button"
                            className="underline-offset-2 hover:underline text-left"
                            onClick={() =>
                              navigate(`/invoices/${creditNote.credited_invoice_id}`)
                            }
                          >
                            {creditNote.credited_invoice_number ||
                              creditNote.credited_invoice_id.slice(0, 8).toUpperCase()}
                          </button>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <Field label="Subtotal" value={creditNote.subtotal} />
                    <Field label="Tax" value={creditNote.tax_total} />
                    <Field
                      label="Total"
                      value={
                        creditNote.total_amount != null
                          ? `${creditNote.currency_code ?? ''} ${creditNote.total_amount}`.trim()
                          : undefined
                      }
                    />
                    <Field label="Outstanding" value={creditNote.outstanding_balance} />
                    <Field label="Remarks" value={creditNote.remarks} />
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
                {creditNote.job_id && isUuid(creditNote.job_id) ? (
                  <SectionAttachmentsPanel
                    entity="jobs"
                    entityId={creditNote.job_id}
                    section="payment_requests"
                    recordId={creditNote.id}
                    title="Payment proof / attachments (visible on job + portal documents)"
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
        title="Edit credit note"
        size="xl"
      >
        {editOpen && editDefaults ? (
          <CreditNoteForm
            key={`${creditNote.id}-${creditNote.updated_at ?? creditNote.id}`}
            mode="edit"
            defaultValues={editDefaults}
            isSubmitting={pending || update.isPending}
            onCancel={() => setEditOpen(false)}
            onSubmit={async (values) => {
              await run(async () => {
                await update.mutateAsync(values);
                setEditOpen(false);
              }, 'Credit note updated.');
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { CREDIT_NOTE_ROUTE_PREFIX } from '../api/creditNote.api';
import { useCreditNote, usePostCreditNote } from '../hooks/useCreditNotes';
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

export default function CreditNoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: creditNote, isLoading, isError, error, refetch } = useCreditNote(id);
  const post = usePostCreditNote(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
        onBack={() => navigate(CREDIT_NOTE_ROUTE_PREFIX)}
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
                    <Field
                      label="Party"
                      value={creditNote.party_name || creditNote.party_id}
                    />
                    <Field label="Currency" value={creditNote.currency_code} />
                    <Field label="Date" value={creditNote.invoice_date} />
                    <Field label="Job" value={creditNote.job_id} />
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
                            {creditNote.credited_invoice_id}
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
                          {lines.map((line) => (
                            <TableRow key={line.id}>
                              <TableCell>{line.description || '—'}</TableCell>
                              <TableCell mono>{line.quantity}</TableCell>
                              <TableCell mono>{line.unit_price}</TableCell>
                              <TableCell mono>
                                {line.line_total != null ? line.line_total : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

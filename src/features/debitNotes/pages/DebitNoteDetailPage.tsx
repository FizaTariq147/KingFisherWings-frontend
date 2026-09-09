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
import { DEBIT_NOTE_ROUTE_PREFIX } from '../api/debitNote.api';
import { useDebitNote, usePostDebitNote } from '../hooks/useDebitNotes';
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
  const post = usePostDebitNote(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
  const lines = debitNote.lines ?? [];

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
            onClick: () => void run(() => post.mutateAsync(), 'Debit note posted.'),
            variant: 'primary' as const,
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
        title={debitNoteDisplayNumber(debitNote)}
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
        onBack={() => navigate(DEBIT_NOTE_ROUTE_PREFIX)}
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
                    <Field label="Party" value={debitNote.party_name || debitNote.party_id} />
                    <Field label="Currency" value={debitNote.currency_code} />
                    <Field label="Date" value={debitNote.invoice_date} />
                    <Field label="Job" value={debitNote.job_id} />
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
                            {debitNote.credited_invoice_id}
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

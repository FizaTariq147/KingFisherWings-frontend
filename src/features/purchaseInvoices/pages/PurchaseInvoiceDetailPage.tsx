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
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '../api/purchaseInvoice.api';
import {
  PURCHASE_INVOICE_STATUS_LABELS,
  PURCHASE_INVOICE_TYPE_LABELS,
  type PurchaseInvoiceType,
} from '../constants/purchaseInvoice.constants';
import {
  useDeletePurchaseInvoice,
  usePostPurchaseInvoice,
  usePurchaseInvoice,
} from '../hooks/usePurchaseInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';
import { purchaseInvoiceDisplayNumber } from '../utils/normalizePurchaseInvoice';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function PurchaseInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading, isError, error, refetch } = usePurchaseInvoice(id);
  const post = usePostPurchaseInvoice(id);
  const remove = useDeletePurchaseInvoice();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !invoice) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Purchase invoice not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const editable = invoice.status === 'DRAFT';
  const canPost = invoice.status === 'DRAFT';
  const lines = invoice.lines ?? [];

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
            onClick: () => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(canPost
      ? [
          {
            label: 'Post',
            onClick: () => void run(() => post.mutateAsync(), 'Purchase invoice posted.'),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: 'Delete',
            onClick: () => {
              if (!window.confirm('Delete this draft purchase invoice?')) return;
              void run(async () => {
                await remove.mutateAsync(id);
                navigate(PURCHASE_INVOICE_ROUTE_PREFIX);
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
        title={purchaseInvoiceDisplayNumber(invoice)}
        subtitle={
          invoice.invoice_type
            ? PURCHASE_INVOICE_TYPE_LABELS[invoice.invoice_type as PurchaseInvoiceType] ??
              invoice.invoice_type
            : invoice.party_name
        }
        statusLabel={PURCHASE_INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
        statusTone={
          invoice.status === 'PAID'
            ? 'emerald'
            : invoice.status === 'CANCELLED' || invoice.status === 'VOID'
              ? 'rose'
              : invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID'
                ? 'amber'
                : 'slate'
        }
        onBack={() => navigate(PURCHASE_INVOICE_ROUTE_PREFIX)}
        backLabel="Purchase Invoices"
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
                    <Field label="Vendor" value={invoice.party_name || invoice.party_id} />
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

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
import { StaffPurchaseInvoicePaymentProofPanel } from '@/features/payment-proofs/components/StaffPurchaseInvoicePaymentProofPanel';
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '../api/purchaseInvoice.api';
import {
  PURCHASE_INVOICE_STATUS_LABELS,
  PURCHASE_INVOICE_TYPE_LABELS,
  type PurchaseInvoiceType,
} from '../constants/purchaseInvoice.constants';
import { usePurchaseInvoice } from '../hooks/usePurchaseInvoices';
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

  const lines = invoice.lines ?? [];

  return (
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
            : invoice.status === 'SENT' ||
                invoice.status === 'PARTIALLY_PAID' ||
                invoice.status === 'SUBMITTED'
              ? 'amber'
              : 'slate'
      }
      onBack={() => navigate(PURCHASE_INVOICE_ROUTE_PREFIX)}
      backLabel="Purchase Invoices"
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
                  <Field
                    label="Paid"
                    value={
                      invoice.paid_amount != null
                        ? `${invoice.currency_code} ${invoice.paid_amount}`
                        : undefined
                    }
                  />
                  <Field
                    label="Balance due"
                    value={
                      invoice.outstanding_balance != null
                        ? `${invoice.currency_code} ${invoice.outstanding_balance}`
                        : undefined
                    }
                  />
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
        {
          key: 'payment-proofs',
          label: 'Payment proofs',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Payment proofs</CardTitle>
              </CardHeader>
              <div className="p-4 pt-0">
                <StaffPurchaseInvoicePaymentProofPanel
                  purchaseInvoiceId={id}
                  currencyCode={invoice.currency_code}
                  remainingAmount={
                    invoice.outstanding_balance != null
                      ? Number(invoice.outstanding_balance)
                      : undefined
                  }
                />
              </div>
            </Card>
          ),
        },
      ]}
    />
  );
}

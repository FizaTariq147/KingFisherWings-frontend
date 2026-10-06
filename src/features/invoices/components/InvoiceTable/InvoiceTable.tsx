import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { resolveInvoiceDisplayStatus } from '@/features/payment-proofs/utils/adjustInvoiceAmountsWithProofs';
import {
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from '../../constants/invoice.constants';
import type { Invoice, PaginationMeta } from '../../types/invoice.types';
import { invoiceDisplayNumber } from '../../utils/normalizeInvoice';
import { InvoiceStatusBadge } from '../InvoiceStatusBadge';

interface InvoiceTableProps {
  invoices: Invoice[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  onView: (inv: Invoice) => void;
  emptyMessage?: string;
}

function rowPaymentView(inv: Invoice) {
  const total = inv.total_amount;
  const paid = inv.paid_amount ?? 0;
  const remaining =
    inv.outstanding_balance ??
    (total != null ? Math.max(0, total - paid) : 0);
  const displayStatus = resolveInvoiceDisplayStatus(inv.status, {
    paidAmount: paid,
    remainingAmount: remaining,
    totalAmount: total,
  });
  return { paid, remaining, displayStatus };
}

export function InvoiceTable({
  invoices,
  isFetching,
  meta,
  onPage,
  onView,
  emptyMessage = 'No invoices found',
}: InvoiceTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice No</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => {
              const { paid, remaining, displayStatus } = rowPaymentView(inv);
              return (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(inv)}
                  >
                    {invoiceDisplayNumber(inv)}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => onView(inv)}
                  >
                    {inv.party_name || inv.party_id.slice(0, 8)}
                  </button>
                </TableCell>
                <TableCell>
                  {inv.invoice_type
                    ? INVOICE_TYPE_LABELS[inv.invoice_type as InvoiceType] ?? inv.invoice_type
                    : '—'}
                </TableCell>
                <TableCell>{inv.invoice_date || '—'}</TableCell>
                <TableCell>{inv.due_date || '—'}</TableCell>
                <TableCell>
                  {inv.total_amount != null
                    ? `${inv.currency_code} ${inv.total_amount.toLocaleString()}`
                    : '—'}
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    Paid {inv.currency_code} {paid.toLocaleString()}
                    {remaining > 0
                      ? ` · Due ${remaining.toLocaleString()}`
                      : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={displayStatus} />
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {meta && onPage && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="underline disabled:opacity-40"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="underline disabled:opacity-40"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

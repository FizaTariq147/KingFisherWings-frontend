import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
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
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[var(--color-primary-100)]">
          <div className="h-full w-1/3 bg-[var(--color-primary-500)] animate-pulse" />
        </div>
      )}
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
            invoices.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell mono>
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
                    className="font-medium text-left text-[var(--color-neutral-800)]"
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
                <TableCell mono>
                  {inv.total_amount != null
                    ? `${inv.currency_code} ${inv.total_amount.toLocaleString()}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={inv.status} />
                </TableCell>
              </TableRow>
            ))
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

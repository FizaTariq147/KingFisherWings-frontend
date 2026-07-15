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
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from '@/features/invoices/constants/invoice.constants';
import type { CreditNote, PaginationMeta } from '../../types/creditNote.types';
import { creditNoteDisplayNumber } from '../../utils/normalizeCreditNote';

interface CreditNoteTableProps {
  creditNotes: CreditNote[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  onView: (cn: CreditNote) => void;
  emptyMessage?: string;
}

export function CreditNoteTable({
  creditNotes,
  isFetching,
  meta,
  onPage,
  onView,
  emptyMessage = 'No credit notes found',
}: CreditNoteTableProps) {
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
            <TableHead>Credit Note No</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditNotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            creditNotes.map((cn) => (
              <TableRow key={cn.id} className="cursor-pointer">
                <TableCell mono>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(cn)}
                  >
                    {creditNoteDisplayNumber(cn)}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="font-medium text-left text-[var(--color-neutral-800)]"
                    onClick={() => onView(cn)}
                  >
                    {cn.party_name || (cn.party_id ? cn.party_id.slice(0, 8) : '—')}
                  </button>
                </TableCell>
                <TableCell>
                  {cn.invoice_type
                    ? INVOICE_TYPE_LABELS[cn.invoice_type as InvoiceType] ?? cn.invoice_type
                    : '—'}
                </TableCell>
                <TableCell>{cn.invoice_date || '—'}</TableCell>
                <TableCell mono>
                  {cn.total_amount != null
                    ? `${cn.currency_code ?? ''} ${cn.total_amount.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={cn.status} />
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

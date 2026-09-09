import { AppFetchBar } from '@/components/motion';
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
import type { DebitNote, PaginationMeta } from '../../types/debitNote.types';
import { debitNoteDisplayNumber } from '../../utils/normalizeDebitNote';

interface DebitNoteTableProps {
  debitNotes: DebitNote[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  onView: (dn: DebitNote) => void;
  emptyMessage?: string;
}

export function DebitNoteTable({
  debitNotes,
  isFetching,
  meta,
  onPage,
  onView,
  emptyMessage = 'No debit notes found',
}: DebitNoteTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Debit Note No</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debitNotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            debitNotes.map((dn) => (
              <TableRow key={dn.id} className="cursor-pointer">
                <TableCell>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(dn)}
                  >
                    {debitNoteDisplayNumber(dn)}
                  </button>
                </TableCell>
                <TableCell>
                  <button type="button" className="text-left" onClick={() => onView(dn)}>
                    {dn.party_name || (dn.party_id ? dn.party_id.slice(0, 8) : '—')}
                  </button>
                </TableCell>
                <TableCell>
                  {dn.invoice_type
                    ? INVOICE_TYPE_LABELS[dn.invoice_type as InvoiceType] ?? dn.invoice_type
                    : '—'}
                </TableCell>
                <TableCell>{dn.invoice_date || '—'}</TableCell>
                <TableCell>
                  {dn.total_amount != null
                    ? `${dn.currency_code ?? ''} ${dn.total_amount.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={dn.status} />
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

import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { JOB_TYPE_LABELS } from '../../constants/quotation.constants';
import type { PaginationMeta, Quotation } from '../../types/quotation.types';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';
import { QuotationActionMenu } from '../QuotationActionMenu';
import { QuotationStatusBadge } from '../QuotationStatusBadge';

interface QuotationTableProps {
  quotations: Quotation[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingActionId?: string | null;
  onView: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onDuplicate: (q: Quotation) => void;
  onSubmit: (q: Quotation) => void;
  onApprove: (q: Quotation) => void;
  onReject: (q: Quotation) => void;
  onSend: (q: Quotation) => void;
  onDelete: (q: Quotation) => void;
  onArchive: (q: Quotation) => void;
  emptyMessage?: string;
}

export function QuotationTable({
  quotations,
  isFetching,
  meta,
  onPage,
  pendingActionId,
  onView,
  onEdit,
  onDuplicate,
  onSubmit,
  onApprove,
  onReject,
  onSend,
  onDelete,
  onArchive,
  emptyMessage = 'No quotations found',
}: QuotationTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Quote No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Job type</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Valid until</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            quotations.map((q) => (
              <TableRow
                key={q.id}
                className="cursor-pointer"
                onClick={() => onView(q)}
              >
                <TableCell mono>{quotationDisplayNumber(q)}</TableCell>
                <TableCell>
                  <div className="font-medium text-[var(--color-neutral-800)]">
                    {q.customer_name || q.customer_id.slice(0, 8)}
                  </div>
                </TableCell>
                <TableCell>{JOB_TYPE_LABELS[q.job_type] ?? q.job_type}</TableCell>
                <TableCell mono>
                  {(q.origin_port_code || '—') + ' → ' + (q.dest_port_code || '—')}
                </TableCell>
                <TableCell>{q.valid_until || '—'}</TableCell>
                <TableCell mono>
                  {q.total_amount != null
                    ? `${q.currency_code} ${q.total_amount.toLocaleString()}`
                    : '—'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <QuotationStatusBadge status={q.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <QuotationActionMenu
                    quotation={q}
                    disabled={pendingActionId === q.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onSubmit={onSubmit}
                    onApprove={onApprove}
                    onReject={onReject}
                    onSend={onSend}
                    onDelete={onDelete}
                    onArchive={onArchive}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && onPage && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

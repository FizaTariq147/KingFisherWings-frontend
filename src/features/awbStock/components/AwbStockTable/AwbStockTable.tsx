import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { AwbStockBatch, PaginationMeta } from '../../types/awbStock.types';
import { AwbStockActionMenu } from '../AwbStockActionMenu';
import { AwbStockStatusBadge } from '../AwbStockStatusBadge';

interface AwbStockTableProps {
  batches: AwbStockBatch[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingId?: string | null;
  emptyMessage?: string;
  onView: (b: AwbStockBatch) => void;
  onEdit: (b: AwbStockBatch) => void;
  onDelete: (b: AwbStockBatch) => void;
}

export function AwbStockTable({
  batches,
  isFetching,
  meta,
  onPage,
  pendingId,
  emptyMessage = 'No AWB stock batches found',
  onView,
  onEdit,
  onDelete,
}: AwbStockTableProps) {
  return (
    <div className="relative space-y-3">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[var(--color-primary-100)]">
          <div className="h-full w-1/3 bg-[var(--color-primary-500)] animate-pulse" />
        </div>
      )}
      <Table className="min-w-[1040px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Airline</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead>Range</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            batches.map((b) => (
              <TableRow
                key={b.id}
                className="cursor-pointer"
                onClick={() => onView(b)}
              >
                <TableCell>
                  <div className="font-medium text-[var(--color-neutral-800)]">
                    {b.airline_code || b.airline_name || b.airline_id.slice(0, 8)}
                  </div>
                  {b.airline_name && b.airline_code ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">{b.airline_name}</div>
                  ) : null}
                </TableCell>
                <TableCell mono>{b.prefix}</TableCell>
                <TableCell mono>
                  {b.range_from.toLocaleString()} – {b.range_to.toLocaleString()}
                </TableCell>
                <TableCell>
                  {b.branch_name || (b.branch_id ? b.branch_id.slice(0, 8) : '—')}
                </TableCell>
                <TableCell mono>
                  {b.remaining ?? '—'}
                  {b.total_count != null ? (
                    <span className="text-[var(--color-neutral-400)]"> / {b.total_count}</span>
                  ) : null}
                </TableCell>
                <TableCell mono>{b.low_stock_threshold ?? '—'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AwbStockStatusBadge batch={b} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AwbStockActionMenu
                    batch={b}
                    disabled={pendingId === b.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {meta && onPage ? (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            {meta.totalPages > 1
              ? `Page ${meta.page} of ${meta.totalPages} · ${meta.total} total`
              : `${meta.total} total`}
          </span>
          {meta.totalPages > 1 ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { PaginationMeta, ZipDistance } from '../../types/zipDistance.types';
import { ZipDistanceActionMenu } from '../ZipDistanceActionMenu';
import { ZipDistanceStatusBadge } from '../ZipDistanceStatusBadge';

interface ZipDistanceTableProps {
  items: ZipDistance[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingId?: string | null;
  onView: (item: ZipDistance) => void;
  onEdit: (item: ZipDistance) => void;
  onActivate: (item: ZipDistance) => void;
  onDeactivate: (item: ZipDistance) => void;
  onDelete: (item: ZipDistance) => void;
}

export function ZipDistanceTable({
  items,
  isFetching,
  meta,
  onPage,
  pendingId,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: ZipDistanceTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--color-neutral-400)] py-10">
                No zip distances found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => onView(item)}
              >
                <TableCell>
                  <div>{item.from_zip}</div>
                  {item.from_city ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">{item.from_city}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div>{item.to_zip}</div>
                  {item.to_city ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">{item.to_city}</div>
                  ) : null}
                </TableCell>
                <TableCell>{item.distance.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ZipDistanceStatusBadge item={item} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ZipDistanceActionMenu
                    item={item}
                    disabled={pendingId === item.id}
                    onView={onView}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onDelete={onDelete}
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

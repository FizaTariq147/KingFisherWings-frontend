import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { VOUCHER_TYPE_LABELS } from '../../constants/voucher.constants';
import type { Voucher } from '../../types/voucher.types';
import { voucherDisplayNumber } from '../../utils/normalizeVoucher';
import { VoucherStatusBadge } from '../VoucherStatusBadge';

interface VoucherTableProps {
  vouchers: Voucher[];
  isFetching?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onView: (voucher: Voucher) => void;
}

export function VoucherTable({
  vouchers,
  isFetching,
  page,
  pageSize,
  total,
  onPage,
  onView,
}: VoucherTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return (
    <div className="relative space-y-3">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[var(--color-primary-100)]">
          <div className="h-full w-1/3 bg-[var(--color-primary-500)] animate-pulse" />
        </div>
      )}
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Voucher No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[var(--color-neutral-400)] py-10">
                No vouchers found
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((v) => (
              <TableRow key={v.id} className="cursor-pointer">
                <TableCell mono>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(v)}
                  >
                    {voucherDisplayNumber(v)}
                  </button>
                </TableCell>
                <TableCell>{v.voucher_date || '—'}</TableCell>
                <TableCell>{VOUCHER_TYPE_LABELS[v.voucher_type] ?? v.voucher_type}</TableCell>
                <TableCell mono>
                  {`${v.currency_code || ''} ${(v.total_debit ?? 0).toLocaleString()}`.trim()}
                </TableCell>
                <TableCell mono>
                  {`${v.currency_code || ''} ${(v.total_credit ?? 0).toLocaleString()}`.trim()}
                </TableCell>
                <TableCell>
                  <VoucherStatusBadge status={v.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-2 text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {page} of {totalPages} ({total} vouchers)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

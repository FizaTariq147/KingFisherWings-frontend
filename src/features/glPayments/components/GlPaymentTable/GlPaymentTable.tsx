import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import {
  PAYMENT_DIRECTION_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../constants/glPayment.constants';
import type { GlPayment } from '../../types/glPayment.types';
import { glPaymentDisplayNumber } from '../../utils/normalizeGlPayment';
import { GlPaymentStatusBadge } from '../GlPaymentStatusBadge';

interface GlPaymentTableProps {
  payments: GlPayment[];
  isFetching?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onView: (payment: GlPayment) => void;
}

export function GlPaymentTable({
  payments,
  isFetching,
  page,
  pageSize,
  total,
  onPage,
  onView,
}: GlPaymentTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Payment No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p) => (
              <TableRow key={p.id} className="cursor-pointer">
                <TableCell mono>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(p)}
                  >
                    {glPaymentDisplayNumber(p)}
                  </button>
                </TableCell>
                <TableCell>{p.payment_date || '—'}</TableCell>
                <TableCell>{PAYMENT_DIRECTION_LABELS[p.direction] ?? p.direction}</TableCell>
                <TableCell>{p.party_name || p.party_id.slice(0, 8)}</TableCell>
                <TableCell mono>
                  {`${p.currency_code} ${p.amount.toLocaleString()}`}
                </TableCell>
                <TableCell>
                  {p.payment_method ? PAYMENT_METHOD_LABELS[p.payment_method] : '—'}
                </TableCell>
                <TableCell>
                  <GlPaymentStatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-2 text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {page} of {totalPages} ({total} payments)
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

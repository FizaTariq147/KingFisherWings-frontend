import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { PaymentRequestStatusBadge } from '../PaymentRequestStatusBadge';
import type { PaginationMeta, PaymentRequest } from '../../types/paymentRequest.types';
import { paymentRequestDisplayNumber } from '../../utils/normalizePaymentRequest';

interface PaymentRequestTableProps {
  paymentRequests: PaymentRequest[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  onView: (pr: PaymentRequest) => void;
}

export function PaymentRequestTable({
  paymentRequests,
  isFetching,
  meta,
  onPage,
  onView,
}: PaymentRequestTableProps) {
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
            <TableHead>Request No</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--color-neutral-400)] py-10">
                No payment requests found
              </TableCell>
            </TableRow>
          ) : (
            paymentRequests.map((pr) => (
              <TableRow key={pr.id} className="cursor-pointer">
                <TableCell mono>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(pr)}
                  >
                    {paymentRequestDisplayNumber(pr)}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="font-medium text-left"
                    onClick={() => onView(pr)}
                  >
                    {pr.party_name || pr.party_id.slice(0, 8)}
                  </button>
                </TableCell>
                <TableCell mono>
                  {`${pr.currency_code} ${pr.amount.toLocaleString()}`}
                </TableCell>
                <TableCell>{pr.due_date || '—'}</TableCell>
                <TableCell>
                  <PaymentRequestStatusBadge status={pr.status} />
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

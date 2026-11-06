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
import { useInvoice } from '@/features/invoices/hooks/useInvoices';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { useParty } from '@/features/parties/hooks/useParties';
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

function VoucherTableRow({
  voucher: v,
  onView,
}: {
  voucher: Voucher;
  onView: (voucher: Voucher) => void;
}) {
  const needsParty = Boolean(v.party_id) && !v.party_name;
  const needsInvoice = Boolean(v.invoice_id) && !v.invoice_number;
  const { data: party } = useParty(needsParty ? v.party_id || '' : '');
  const { data: invoice } = useInvoice(needsInvoice ? v.invoice_id || '' : '');

  const partyLabel = v.party_name || party?.name || party?.code || '—';
  const invoiceLabel =
    v.invoice_number || (invoice ? invoiceDisplayNumber(invoice) : '—');

  return (
    <TableRow className="cursor-pointer">
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
      <TableCell>{partyLabel}</TableCell>
      <TableCell>{invoiceLabel}</TableCell>
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
  );
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
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Voucher No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                No vouchers found
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((v) => (
              <VoucherTableRow key={v.id} voucher={v} onView={onView} />
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

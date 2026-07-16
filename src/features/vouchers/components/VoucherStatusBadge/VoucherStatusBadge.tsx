import { VOUCHER_STATUS_LABELS, type VoucherStatus } from '../../constants/voucher.constants';

const TONE: Record<VoucherStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  POSTED: 'bg-emerald-50 text-emerald-700',
  REVERSED: 'bg-amber-50 text-amber-800',
  CANCELLED: 'bg-rose-50 text-rose-700',
};

export function VoucherStatusBadge({ status }: { status: VoucherStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TONE[status] ?? TONE.DRAFT}`}
    >
      {VOUCHER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

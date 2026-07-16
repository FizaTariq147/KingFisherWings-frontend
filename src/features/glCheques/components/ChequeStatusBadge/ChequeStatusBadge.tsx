import { CHEQUE_STATUS_LABELS, type ChequeStatus } from '../../constants/cheque.constants';

const TONE: Record<ChequeStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  DEPOSITED: 'bg-sky-50 text-sky-700',
  CLEARED: 'bg-emerald-50 text-emerald-700',
  BOUNCED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export function ChequeStatusBadge({ status }: { status: ChequeStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TONE[status] ?? TONE.PENDING}`}
    >
      {CHEQUE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

import { GL_PAYMENT_STATUS_LABELS, type GlPaymentStatus } from '../../constants/glPayment.constants';

const TONE: Record<GlPaymentStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  POSTED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
};

export function GlPaymentStatusBadge({ status }: { status: GlPaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TONE[status] ?? TONE.DRAFT}`}
    >
      {GL_PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

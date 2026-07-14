import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PENDING_QUOTATION_STATUSES } from '@/features/quotations/constants/quotation.constants';
import { useQuotations } from '@/features/quotations/hooks/useQuotations';

export default function PendingQuotationsWidget() {
  const { data, isLoading } = useQuotations({
    page: 1,
    limit: 100,
    order: 'desc',
  });

  const quotations = data?.quotations ?? [];
  const pending = quotations.filter((q) =>
    PENDING_QUOTATION_STATUSES.includes(q.status),
  );
  const now = Date.now();
  const in48h = 48 * 60 * 60 * 1000;
  const expiring = pending.filter((q) => {
    if (!q.valid_until) return false;
    const ts = Date.parse(q.valid_until);
    if (Number.isNaN(ts)) return false;
    const delta = ts - now;
    return delta >= 0 && delta <= in48h;
  }).length;

  return (
    <Link
      to="/quotations/all"
      className="block rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 hover:border-[var(--color-primary-300)] transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-primary-50)' }}
        >
          <FileText size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">
          Pending Quotations
        </span>
      </div>
      {isLoading ? (
        <div className="h-8 w-16 bg-[var(--color-neutral-100)] rounded animate-pulse" />
      ) : (
        <>
          <div className="text-2xl font-bold text-[var(--color-neutral-900)] leading-none">
            {pending.length}
          </div>
          {expiring > 0 && (
            <div className="mt-2 text-[11px] font-medium text-[var(--color-warning-700)]">
              {expiring} expiring within 48h
            </div>
          )}
        </>
      )}
    </Link>
  );
}

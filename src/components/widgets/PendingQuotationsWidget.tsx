import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PENDING_QUOTATION_STATUSES } from '@/features/quotations/constants/quotation.constants';
import { quotationService } from '@/features/quotations/services/quotation.service';

export default function PendingQuotationsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['quotations', 'pending-widget', PENDING_QUOTATION_STATUSES],
    queryFn: async () => {
      const pages = await Promise.all(
        PENDING_QUOTATION_STATUSES.map((status) =>
          quotationService.list({ page: 1, limit: 1, status, order: 'desc' }),
        ),
      );
      const totalPending = pages.reduce((sum, page) => sum + (page.meta.total || 0), 0);

      // Sample recent pending rows for “expiring within 48h”
      const samples = await Promise.all(
        PENDING_QUOTATION_STATUSES.map((status) =>
          quotationService.list({ page: 1, limit: 20, status, order: 'desc' }),
        ),
      );
      const now = Date.now();
      const in48h = 48 * 60 * 60 * 1000;
      const expiring = samples
        .flatMap((p) => p.quotations)
        .filter((q) => {
          if (!q.valid_until) return false;
          const ts = Date.parse(q.valid_until);
          if (Number.isNaN(ts)) return false;
          const delta = ts - now;
          return delta >= 0 && delta <= in48h;
        }).length;

      return { totalPending, expiring };
    },
    staleTime: 60_000,
  });

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
            {data?.totalPending ?? 0}
          </div>
          {(data?.expiring ?? 0) > 0 && (
            <div className="mt-2 text-[11px] font-medium text-[var(--color-warning-700)]">
              {data?.expiring} expiring within 48h
            </div>
          )}
        </>
      )}
    </Link>
  );
}

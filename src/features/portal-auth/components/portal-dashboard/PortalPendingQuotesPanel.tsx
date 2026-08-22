import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import type { PortalQuotationListItem } from '@/features/portal-quotations/types/portalQuotations.types';
import {
  compactMoney,
  formatStatusLabel,
  isOpenQuote,
  quoteAmount,
  quoteCurrency,
} from '../../utils/portalDashboardFormat';
import { dashType } from '@/lib/dashboardTypography';
import { cn } from '@/lib/utils';

export function PortalPendingQuotesPanel({
  items,
  openCount,
  loading,
  error,
}: {
  items: PortalQuotationListItem[];
  openCount: number;
  loading: boolean;
  error: boolean;
}) {
  const pending = items.filter((item) => isOpenQuote(item.status));

  return (
    <section className="flex flex-col overflow-hidden rounded-[20px] bg-[#0A2942] p-5 text-white shadow-[0_14px_34px_rgba(10,41,66,0.22)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#FF9A4A]">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className={cn(dashType.panel.title, 'text-white')}>Pending quotations</h2>
        </div>
        <span className={dashType.panel.meta}>{openCount} open</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded-xl bg-white/10" />
          <div className="h-14 animate-pulse rounded-xl bg-white/10" />
        </div>
      ) : error ? (
        <p className="text-sm text-white/70">Could not load quotations.</p>
      ) : pending.length === 0 ? (
        <p className={cn(dashType.panel.empty, 'bg-white/5 text-white/70')}>
          No pending quotations.
        </p>
      ) : (
        <ul className="space-y-1">
          {pending.slice(0, 3).map((item) => {
            const amount = quoteAmount(item);
            return (
              <li key={item.id}>
                <Link to={`/portal/quotes/${item.id}`} className="block rounded-xl px-1 py-2.5 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn(dashType.panel.rowTitle, 'font-medium text-white')}>{item.number}</p>
                      <p className={cn(dashType.panel.rowMeta, 'uppercase tracking-wide text-white/45')}>
                        {formatStatusLabel(item.jobType ?? item.status)}
                      </p>
                    </div>
                    <p className={cn(dashType.panel.rowTitle, 'text-[#FF9A4A]')}>
                      {amount != null ? compactMoney(amount, quoteCurrency(item)) : '—'}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5">
        <Link
          to="/portal/quotes"
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-secondary)] text-sm font-semibold text-white hover:opacity-90"
        >
          Review quotes
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

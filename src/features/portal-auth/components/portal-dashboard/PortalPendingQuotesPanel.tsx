import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PortalQuotationListItem } from '@/features/portal-quotations/types/portalQuotations.types';
import {
  compactMoney,
  formatStatusLabel,
  isOpenQuote,
  quoteAmount,
  quoteCurrency,
} from '../../utils/portalDashboardFormat';

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
        <h2 className="text-[15px] font-semibold">Pending quotations</h2>
        <span className="text-[11px] text-white/55">{openCount} open</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded-xl bg-white/10" />
          <div className="h-14 animate-pulse rounded-xl bg-white/10" />
        </div>
      ) : error ? (
        <p className="text-sm text-white/70">Could not load quotations.</p>
      ) : pending.length === 0 ? (
        <p className="rounded-xl bg-white/5 px-3 py-8 text-center text-sm text-white/70">
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
                      <p className="truncate text-sm font-medium tracking-wide">{item.number}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/45">
                        {formatStatusLabel(item.jobType ?? item.status)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#FF9A4A]">
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
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#FF751F] text-sm font-semibold text-white hover:bg-[#E36A12]"
        >
          Review quotes
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

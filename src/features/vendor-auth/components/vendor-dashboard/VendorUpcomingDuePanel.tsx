import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import type { VendorScheduleItem } from '@/features/vendor-schedule/types/vendorSchedule.types';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { compactVendorAmount, formatShortDate } from '../../utils/vendorDashboardFormat';

export function VendorUpcomingDuePanel({
  items,
  loading,
  error,
}: {
  items: VendorScheduleItem[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[#0A2942]">Upcoming due</h2>
        <Link to="/vendor/schedule" className="text-[12px] font-semibold text-[#FF751F] hover:underline">
          View schedule
        </Link>
      </div>

      {loading ? (
        <div className="h-14 animate-pulse rounded-xl bg-[#EEF2F5]" />
      ) : error ? (
        <p className="py-6 text-sm text-[#C6303E]">Could not load schedule.</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-[#7A8A98]">Nothing scheduled.</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 6).map((item) => (
            <li key={item.id}>
              <Link
                to={`/vendor/invoices/${item.id}`}
                className="flex items-center gap-3 rounded-xl px-1 py-2.5 hover:bg-[#F8FAFB]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2F5] text-[#5B6B7A]">
                  <FileText size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0A2942]">{item.number}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8A98A6]">
                    {[
                      item.dueDate ? `Due ${item.dueDate}` : null,
                      formatVendorMoney(item.outstanding ?? item.amount, item.currencyCode),
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function VendorOpenInvoicePanel({
  item,
  overdueCount,
  loading,
}: {
  item?: VendorScheduleItem;
  overdueCount: number;
  loading: boolean;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-[20px] bg-[#0A2942] p-5 text-white shadow-[0_14px_34px_rgba(10,41,66,0.22)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Open invoice</h2>
        <span className="text-[11px] text-[#FF9A4A]">{overdueCount} overdue</span>
      </div>

      {loading ? (
        <div className="h-14 animate-pulse rounded-xl bg-white/10" />
      ) : !item ? (
        <p className="rounded-xl bg-white/5 px-3 py-8 text-center text-sm text-white/70">
          No open invoices.
        </p>
      ) : (
        <Link to={`/vendor/invoices/${item.id}`} className="block rounded-xl px-1 py-1 hover:bg-white/5">
          <p className="text-sm font-medium tracking-wide">{item.number}</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="text-[11px] text-white/50">
              Due {item.dueDate ? formatShortDate(item.dueDate) : '—'}
            </p>
            <p className="text-sm font-semibold text-[#FF9A4A]">
              {compactVendorAmount(item.outstanding ?? item.amount, item.currencyCode ?? 'AED')}
            </p>
          </div>
        </Link>
      )}

      <div className="mt-5">
        <Link
          to="/vendor/invoices"
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#FF751F] text-sm font-semibold text-white hover:bg-[#E36A12]"
        >
          View Invoices
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Ship, Truck } from 'lucide-react';
import type { PortalShipmentListItem } from '@/features/portal-shipments/types/portalShipments.types';
import {
  formatShortDate,
  formatStatusLabel,
  isActiveShipment,
  isCustomsHold,
  isDocsPending,
  shipmentMode,
  statusTone,
} from '../../utils/portalDashboardFormat';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | 'customs' | 'docs' | 'booked';

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customs', label: 'Customs hold' },
  { id: 'docs', label: 'Documents missing' },
  { id: 'booked', label: 'Booked' },
];

function ModeIcon({ jobType }: { jobType?: string }) {
  const mode = shipmentMode(jobType);
  const cls = 'text-[#5B6B7A]';
  if (mode === 'Air') return <Plane size={16} className={cls} />;
  if (mode === 'Land') return <Truck size={16} className={cls} />;
  return <Ship size={16} className={cls} />;
}

function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone(status);
  const classes = {
    info: 'bg-[#E8F4FF] text-[#1D6FA8]',
    warning: 'bg-[#FFF1E6] text-[#C7590F]',
    success: 'bg-[#E8F7EE] text-[#1F8A57]',
    cyan: 'bg-[#E6F7F8] text-[#17808A]',
    neutral: 'bg-[#F3F5F7] text-[#5B6B7A]',
  }[tone];

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide', classes)}>
      {formatStatusLabel(status)}
    </span>
  );
}

function matchesFilter(item: PortalShipmentListItem, filter: FilterKey): boolean {
  if (filter === 'customs') return isCustomsHold(item.status);
  if (filter === 'docs') return isDocsPending(item.status);
  if (filter === 'booked') return (item.status ?? '').toUpperCase().includes('BOOK');
  return true;
}

export function PortalActiveShipmentsPanel({
  items,
  loading,
  error,
}: {
  items: PortalShipmentListItem[];
  loading: boolean;
  error: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const active = useMemo(() => items.filter((item) => isActiveShipment(item.status)), [items]);
  const filtered = useMemo(
    () => active.filter((item) => matchesFilter(item, filter)),
    [active, filter],
  );

  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[#0A2942]">Active shipments</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                filter === item.id
                  ? 'bg-[#0A2942] text-white'
                  : 'text-[#6B7A88] hover:bg-[#F4F7F9]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9AA8B5]">
              <th className="pb-3 pr-3 font-semibold">Job / Route</th>
              <th className="pb-3 pr-3 font-semibold">Mode</th>
              <th className="pb-3 pr-3 font-semibold">Status</th>
              <th className="pb-3 text-right font-semibold">Eta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="py-3">
                    <div className="h-10 animate-pulse rounded-lg bg-[#EEF2F5]" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="py-8 text-sm text-[#C6303E]">
                  Could not load shipments.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-sm text-[#7A8A98]">
                  No active shipments for this filter.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 6).map((item) => (
                <tr key={item.id} className="border-t border-[#F1F4F7]">
                  <td className="py-3.5 pr-3">
                    <Link to={`/portal/shipments/${item.id}`} className="block min-w-[180px]">
                      <p className="font-semibold text-[#0A2942]">{item.reference}</p>
                      <p className="mt-0.5 text-[11px] text-[#8A98A6]">
                        {[item.origin, item.destination].filter(Boolean).join(' → ') || '—'}
                      </p>
                    </Link>
                  </td>
                  <td className="py-3.5 pr-3">
                    <ModeIcon jobType={item.jobType} />
                  </td>
                  <td className="py-3.5 pr-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 text-right text-[11px] text-[#6B7A88]">
                    ETA {formatShortDate(item.eta)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

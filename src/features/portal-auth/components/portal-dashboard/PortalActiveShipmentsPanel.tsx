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
import { dashType } from '@/lib/dashboardTypography';

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
  const visibleRows = filtered.slice(0, 6);
  const loadingRowCount = Math.min(6, Math.max(1, active.length || 3));

  return (
    <section className="h-auto w-full self-start rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4ED] text-[#FF751F]">
            <Ship className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className={dashType.panel.title}>Active shipments</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                dashType.panel.filterChip,
                filter === item.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)]',
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
            <tr className={cn(dashType.panel.meta, 'font-semibold uppercase tracking-[0.12em]')}>
              <th className="pb-3 pr-3 font-semibold">Job / Route</th>
              <th className="pb-3 pr-3 font-semibold">Mode</th>
              <th className="pb-3 pr-3 font-semibold">Status</th>
              <th className="pb-3 text-right font-semibold">Eta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingRowCount }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="py-3">
                    <div className="h-10 animate-pulse rounded-lg bg-[#EEF2F5]" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className={cn('py-8', dashType.panel.body, 'text-[var(--color-danger-600)]')}>
                  Could not load shipments.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={cn('py-8', dashType.panel.body)}>
                  No active shipments for this filter.
                </td>
              </tr>
            ) : (
              visibleRows.map((item) => (
                <tr key={item.id} className="border-t border-[#F1F4F7]">
                  <td className="py-3.5 pr-3">
                    <Link to={`/portal/shipments/${item.id}`} className="block min-w-[180px]">
                      <p className={dashType.panel.rowTitle}>{item.reference}</p>
                      <p className={dashType.panel.rowMeta}>
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
                  <td className={cn('py-3.5 text-right', dashType.panel.meta)}>
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

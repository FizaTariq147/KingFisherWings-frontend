import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  FileClock,
  Filter,
  Gavel,
  Landmark,
  Percent,
  Plane,
  RefreshCw,
  Settings2,
  Ship,
  ShieldAlert,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashCard, DashEmpty, DashSkeleton } from './DashCard';
import type { Job } from '@/features/jobs/types/job.types';
import { jobDetailPath, jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import {
  deptBadgeClass,
  deptForStatus,
  durationInDept,
  formatShortDate,
  isActiveJob,
  isCustomsHold,
  isDocsPending,
  jobClient,
  jobInitials,
  jobMetaHints,
  jobMode,
  jobModeDetail,
  jobPortCode,
  relativeTime,
  routeProgressInfo,
  shipmentStatusChip,
  shipmentStatusClass,
  shipmentStatusLabel,
  type ShipmentStatusChip,
} from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

type ViewKey = 'all' | 'mine' | 'customs' | 'docs' | 'air';

const SAVED_VIEWS: { id: ViewKey; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All jobs', icon: Briefcase },
  { id: 'mine', label: 'My jobs', icon: User },
  { id: 'customs', label: 'Customs holds', icon: ShieldAlert },
  { id: 'docs', label: 'Docs missing', icon: FileClock },
  { id: 'air', label: 'Air freight', icon: Plane },
];

const STATUS_CHIPS: { id: ShipmentStatusChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_transit', label: 'In transit' },
  { id: 'customs', label: 'Customs' },
  { id: 'docs_due', label: 'Docs due' },
  { id: 'booked', label: 'Booked' },
  { id: 'delivered', label: 'Delivered' },
];

const AVATAR_COLORS = ['#E8EEF4', '#FCE8EA', '#EDE8F4', '#E8F4F8', '#FDECDC', '#E7F6EC'];

function matchesView(job: Job, view: ViewKey, userId?: string): boolean {
  switch (view) {
    case 'mine':
      return Boolean(userId && (job.salesperson_id === userId || job.ops_user_id === userId));
    case 'customs':
      return isCustomsHold(job);
    case 'docs':
      return isDocsPending(job);
    case 'air':
      return jobMode(job.job_type) === 'Air';
    default:
      return true;
  }
}

function matchesChip(job: Job, chip: ShipmentStatusChip): boolean {
  if (chip === 'all') return true;
  return shipmentStatusChip(job) === chip;
}

function DeptIcon({ dept }: { dept: string }) {
  if (dept === 'Customs') return <Gavel className="h-3 w-3" aria-hidden />;
  if (dept === 'Documentation') return <FileClock className="h-3 w-3" aria-hidden />;
  if (dept === 'Sales') return <Percent className="h-3 w-3" aria-hidden />;
  if (dept === 'Accounts') return <Landmark className="h-3 w-3" aria-hidden />;
  return <Settings2 className="h-3 w-3" aria-hidden />;
}

export function ActiveShipmentsPanel({
  jobs,
  isLoading,
  isError,
  onRefresh,
  userId,
  lastUpdated,
  isFetching,
}: {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  userId?: string;
  lastUpdated?: number;
  isFetching?: boolean;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>('all');
  const [chip, setChip] = useState<ShipmentStatusChip>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const active = useMemo(() => jobs.filter((job) => isActiveJob(job.status)), [jobs]);

  const viewCounts = useMemo(
    () => ({
      all: active.length,
      mine: active.filter((job) => matchesView(job, 'mine', userId)).length,
      customs: active.filter((job) => matchesView(job, 'customs')).length,
      docs: active.filter((job) => matchesView(job, 'docs')).length,
      air: active.filter((job) => matchesView(job, 'air')).length,
    }),
    [active, userId],
  );

  const chipCounts = useMemo(() => {
    const counts: Record<ShipmentStatusChip, number> = {
      all: active.length,
      in_transit: 0,
      customs: 0,
      docs_due: 0,
      booked: 0,
      delivered: 0,
    };
    for (const job of active) {
      const key = shipmentStatusChip(job);
      if (key !== 'all') counts[key] += 1;
    }
    return counts;
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.filter((job) => {
      if (!matchesView(job, view, userId)) return false;
      if (!matchesChip(job, chip)) return false;
      if (!q) return true;
      const hay = [
        jobDisplayNumber(job),
        jobClient(job),
        jobPortCode(job.origin_port_code),
        jobPortCode(job.dest_port_code),
        job.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [active, view, chip, query, userId]);

  const visibleRows = filtered.slice(0, 8);
  const loadingRowCount = Math.min(8, Math.max(1, active.length || 3));

  const inTransitCount = chipCounts.in_transit + chipCounts.customs;
  const docsNeedCount = viewCounts.docs;

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashCard padding={false} className="h-auto w-full self-start overflow-hidden">
      <div className="border-b border-[var(--color-neutral-100)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-neutral-900)]">Active shipments</h3>
            <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">
              {inTransitCount} in transit · {docsNeedCount} need documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-neutral-400)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-500)]" />
              {lastUpdated ? `Updated ${relativeTime(new Date(lastUpdated).toISOString())}` : 'Live'}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)]"
              aria-label="Refresh shipments"
            >
              <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs/sea-import')}
              className="rounded-lg bg-[#FFF4ED] px-3 py-1.5 text-[11px] font-semibold text-[#FF751F] hover:bg-[#FFEBDD]"
            >
              View all
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            Saved views
          </span>
          {SAVED_VIEWS.map((item) => {
            const Icon = item.icon;
            const count = viewCounts[item.id];
            const activeView = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium',
                  activeView
                    ? 'bg-[#0A2942] text-white'
                    : 'border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]',
                )}
              >
                <Icon size={12} strokeWidth={2.25} className="shrink-0" aria-hidden />
                {item.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0 text-[10px] tabular-nums',
                    activeView ? 'bg-white/15 text-white' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Filter
              size={13}
              strokeWidth={2.25}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by job, customer, port"
              aria-label="Filter by job, customer, port"
              className="h-9 w-full rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] py-0 pl-8 pr-3 text-xs outline-none focus:border-[#2C557A]"
            />
          </div>
          {STATUS_CHIPS.map((item) => {
            const count = chipCounts[item.id];
            const activeChip = chip === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChip(item.id)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums',
                  activeChip
                    ? 'bg-[#0A2942] text-white'
                    : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)]',
                )}
              >
                {item.label} ({count})
              </button>
            );
          })}
          <span className="ml-auto text-[11px] text-[var(--color-neutral-400)]">
            {filtered.length} shipment{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: loadingRowCount }).map((_, i) => (
            <DashSkeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-5">
          <DashEmpty>Unable to load active shipments.</DashEmpty>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <DashEmpty>No active shipments match this view.</DashEmpty>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-[var(--color-neutral-50)]">
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                <th className="w-10 px-4 py-2.5" />
                <th className="px-3 py-2.5 font-semibold">Job</th>
                <th className="px-3 py-2.5 font-semibold">Route</th>
                <th className="px-3 py-2.5 font-semibold">Mode</th>
                <th className="px-3 py-2.5 font-semibold">With dept</th>
                <th className="px-3 py-2.5 font-semibold">ETA</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((job, index) => {
                const path = jobDetailPath(job);
                const client = jobClient(job);
                const route = routeProgressInfo(job);
                const dept = deptForStatus(job.status);
                const mode = jobMode(job.job_type);
                const modeLabel = jobModeDetail(job);
                const hints = jobMetaHints(job);
                const visibleHints = hints.slice(0, 2);
                const extraHints = hints.length - visibleHints.length;
                const eta = formatShortDate(job.eta || job.sea_fcl_details?.eta);

                return (
                  <tr
                    key={job.id}
                    className="border-t border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]/70"
                  >
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selected.has(job.id)}
                        onChange={() => toggleRow(job.id)}
                        className="mt-1 h-3.5 w-3.5 rounded border-[var(--color-neutral-300)]"
                        aria-label={`Select ${jobDisplayNumber(job)}`}
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-[#0A2942]"
                          style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                        >
                          {jobInitials(client)}
                        </span>
                        <div className="min-w-0">
                          <Link
                            to={path}
                            className="text-sm font-semibold text-[var(--color-neutral-900)] hover:underline"
                          >
                            {jobDisplayNumber(job)}
                          </Link>
                          <p className="truncate text-[11px] text-[var(--color-neutral-500)]">{client}</p>
                          {visibleHints.length > 0 ? (
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
                              {visibleHints.map((hint) => (
                                <span
                                  key={hint.text}
                                  className={cn(
                                    'inline-flex items-center gap-1',
                                    hint.tone === 'success'
                                      ? 'text-[#3BA066]'
                                      : 'text-[#E07A2F]',
                                  )}
                                >
                                  <span className="h-1 w-1 rounded-full bg-current" />
                                  {hint.text}
                                </span>
                              ))}
                              {extraHints > 0 ? (
                                <span className="text-[var(--color-neutral-400)]">+{extraHints} more</span>
                              ) : null}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="min-w-[170px]">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--color-neutral-800)]">
                          <span>{route.origin}</span>
                          <div className="relative h-1.5 min-w-[72px] flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                            <span
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ width: `${route.pct}%`, background: route.barColor }}
                            />
                          </div>
                          <span>{route.dest}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-[var(--color-neutral-400)]">{route.caption}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-neutral-700)]">
                        {mode === 'Air' ? (
                          <Plane className="h-3.5 w-3.5 text-[#FF751F]" aria-hidden />
                        ) : (
                          <Ship className="h-3.5 w-3.5 text-[#1F8A8A]" aria-hidden />
                        )}
                        {modeLabel}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          deptBadgeClass(dept),
                        )}
                      >
                        <DeptIcon dept={dept} />
                        {dept}
                      </span>
                      <p className="mt-1 text-[10px] text-[var(--color-neutral-400)]">
                        {durationInDept(job.updated_at || job.created_at)}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-[var(--color-neutral-700)]">{eta}</td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          shipmentStatusClass(job.status),
                        )}
                      >
                        {shipmentStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Link
                        to={path}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
                        aria-label={`Open ${jobDisplayNumber(job)}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  );
}

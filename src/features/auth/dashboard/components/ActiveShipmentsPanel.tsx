import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { DashCard, DashEmpty, DashSkeleton } from './DashCard';
import { JobStatusBadge } from '@/features/jobs/components/JobStatusBadge';
import type { Job } from '@/features/jobs/types/job.types';
import { jobDetailPath, jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import {
  deptForStatus,
  formatShortDate,
  isActiveJob,
  isCustomsHold,
  isDocsPending,
  jobClient,
  jobLane,
  jobMode,
} from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

type ViewKey =
  | 'all'
  | 'mine'
  | 'customs'
  | 'docs'
  | 'air'
  | 'inland'
  | 'booked'
  | 'delivered';

const VIEWS: { id: ViewKey; label: string }[] = [
  { id: 'all', label: 'All jobs' },
  { id: 'mine', label: 'My jobs' },
  { id: 'customs', label: 'Customs holds' },
  { id: 'docs', label: 'Docs pending' },
  { id: 'air', label: 'Air freight' },
];

const CHIPS: { id: ViewKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'inland', label: 'Inland' },
  { id: 'customs', label: 'Customs' },
  { id: 'docs', label: 'Docs due' },
  { id: 'booked', label: 'Booked' },
  { id: 'delivered', label: 'Delivered' },
];

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
    case 'inland':
      return jobMode(job.job_type) === 'Land';
    case 'booked':
      return job.status === 'BOOKING_CONFIRMED';
    case 'delivered':
      return job.status === 'DELIVERED';
    default:
      return true;
  }
}

export function ActiveShipmentsPanel({
  jobs,
  isLoading,
  isError,
  onRefresh,
  userId,
}: {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  userId?: string;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>('all');
  const [chip, setChip] = useState<ViewKey>('all');
  const [query, setQuery] = useState('');

  const active = useMemo(() => jobs.filter((j) => isActiveJob(j.status)), [jobs]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.filter((job) => {
      if (!matchesView(job, view, userId)) return false;
      if (chip !== 'all' && !matchesView(job, chip, userId)) return false;
      if (!q) return true;
      const hay = [
        jobDisplayNumber(job),
        jobClient(job),
        job.origin_port_code,
        job.dest_port_code,
        job.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [active, view, chip, query, userId]);

  return (
    <DashCard>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">Active shipments</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">
            {active.length} in transit · live job list
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-neutral-200)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          >
            <RefreshCw size={11} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs/air-export')}
            className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline"
          >
            View all
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--color-neutral-400)]">Saved views</span>
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium',
              view === item.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by job, customer, port"
          className="h-8 min-w-[180px] flex-1 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 text-xs outline-none focus:border-[var(--color-primary-200)]"
        />
        {CHIPS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setChip(item.id)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium',
              chip === item.id
                ? 'bg-[var(--color-secondary-50)] text-[var(--color-secondary-700)]'
                : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <DashSkeleton key={i} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <DashEmpty>Unable to load active shipments.</DashEmpty>
      ) : filtered.length === 0 ? (
        <DashEmpty>No active shipments match this view.</DashEmpty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                <th className="pb-2 pr-3 font-semibold">Job</th>
                <th className="pb-2 pr-3 font-semibold">Route</th>
                <th className="pb-2 pr-3 font-semibold">Mode</th>
                <th className="pb-2 pr-3 font-semibold">With dept</th>
                <th className="pb-2 pr-3 font-semibold">ETD</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 8).map((job) => {
                const path = jobDetailPath(job);
                return (
                  <tr key={job.id} className="border-t border-[var(--color-neutral-100)]">
                    <td className="py-3 pr-3">
                      <Link
                        to={path}
                        className="font-semibold text-[var(--color-primary-600)] hover:underline"
                      >
                        {jobDisplayNumber(job)}
                      </Link>
                      <div className="mt-0.5 max-w-[180px] truncate text-[11px] text-[var(--color-neutral-500)]">
                        {jobClient(job)}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="font-medium text-[var(--color-neutral-800)]">{jobLane(job)}</div>
                    </td>
                    <td className="py-3 pr-3 text-[var(--color-neutral-600)]">{jobMode(job.job_type)}</td>
                    <td className="py-3 pr-3">
                      <span className="rounded-full bg-[var(--color-neutral-50)] px-2 py-0.5 text-[11px] text-[var(--color-neutral-600)]">
                        {deptForStatus(job.status)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[var(--color-neutral-600)]">{formatShortDate(job.etd)}</td>
                    <td className="py-3">
                      <JobStatusBadge job={job} />
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

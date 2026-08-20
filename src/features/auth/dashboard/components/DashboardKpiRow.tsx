import { Link } from 'react-router-dom';
import { DashCard, DashSkeleton } from './DashCard';
import { compactMoney } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

function MiniBars({
  values,
  colors,
}: {
  values: number[];
  colors: string[];
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-4 flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <span
          key={`${i}-${v}`}
          className="w-2 rounded-sm"
          style={{
            height: `${Math.max(12, Math.round((v / max) * 100))}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

export function DashboardKpiRow({
  activeJobs,
  jobBars,
  pendingQuotes,
  quoteBars,
  receivables,
  agingBars,
  onTimePct,
  loading,
}: {
  activeJobs: number;
  jobBars: number[];
  pendingQuotes: number;
  quoteBars: number[];
  receivables: number;
  agingBars: number[];
  onTimePct: number | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/jobs/air-export"
        label="Active jobs"
        value={loading ? null : String(activeJobs)}
        hint="Open jobs across operations"
        bars={jobBars}
        barColors={['#0A2942', '#FF751F', '#C7590F', '#2C557A']}
      />
      <KpiCard
        to="/quotations/all"
        label="Pending quotations"
        value={loading ? null : String(pendingQuotes)}
        hint="Draft, submitted, approved, sent"
        bars={quoteBars}
        barColors={['#FF751F', '#0A2942', '#E8650F', '#2C557A']}
      />
      <KpiCard
        to="/gl/ar/aging"
        label="Receivables"
        value={loading ? null : compactMoney(receivables)}
        hint="Outstanding AR"
        bars={agingBars}
        barColors={['#0A2942', '#2C557A', '#FF751F', '#C7590F', '#163E60']}
      />
      <KpiCard
        to="/gl/mis/dashboard"
        label="On-time delivery"
        value={onTimePct == null ? '—' : `${Math.round(onTimePct)}%`}
        hint={
          onTimePct == null
            ? 'No operational on-time metric from the API yet'
            : 'From MIS operational metrics'
        }
        bars={onTimePct == null ? [4, 6, 5, 8, 7] : [6, 7, 7, 8, 9]}
        barColors={['#1F8A57', '#0A2942', '#1F8A57', '#2C557A']}
        muted={onTimePct == null}
      />
    </div>
  );
}

function KpiCard({
  to,
  label,
  value,
  hint,
  bars,
  barColors,
  muted,
}: {
  to: string;
  label: string;
  value: string | null;
  hint: string;
  bars: number[];
  barColors: string[];
  muted?: boolean;
}) {
  return (
    <Link to={to} className="block">
      <DashCard className="h-full transition-shadow hover:shadow-[0_12px_28px_rgba(10,41,66,0.08)]">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">{label}</p>
        {value == null ? (
          <DashSkeleton className="mt-3 h-8 w-16" />
        ) : (
          <p
            className={cn(
              'mt-2 text-[28px] font-semibold leading-none tracking-tight',
              muted ? 'text-[var(--color-neutral-400)]' : 'text-[var(--color-neutral-900)]',
            )}
          >
            {value}
          </p>
        )}
        <p className="mt-2 text-[11px] text-[var(--color-neutral-400)]">{hint}</p>
        <MiniBars values={bars.length ? bars : [2, 3, 2, 4]} colors={barColors} />
      </DashCard>
    </Link>
  );
}

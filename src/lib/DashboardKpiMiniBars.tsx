import { cn } from '@/lib/utils';
import {
  DASHBOARD_KPI_BAR_COUNT,
  expandDashboardKpiSeries,
} from './dashboardKpiBars';

export function DashboardKpiMiniBars({
  values,
  palette,
  loading,
  className,
}: {
  values: number[];
  palette: readonly string[];
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div
        className={cn(
          'mt-4 h-8 w-full animate-pulse rounded-[3px] bg-[var(--color-neutral-100)]',
          className,
        )}
      />
    );
  }

  const series = expandDashboardKpiSeries(values, DASHBOARD_KPI_BAR_COUNT);
  const max = Math.max(...series, 1);
  const hasData = series.some((v) => v > 0);

  return (
    <div className={cn('mt-4 flex h-8 w-full items-end gap-[3px]', className)}>
      {series.map((value, index) => {
        const color = palette[index % palette.length] ?? palette[0];
        return (
          <span
            key={`${index}-${value}`}
            className="min-w-0 flex-1 rounded-[3px]"
            style={{
              height: `${Math.max(hasData ? 28 : 22, Math.round((value / max) * 100))}%`,
              background: color,
              opacity: value > 0 ? 1 : 0.22,
            }}
          />
        );
      })}
    </div>
  );
}

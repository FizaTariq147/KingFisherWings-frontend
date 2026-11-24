import { ReportCard } from './ReportCard';
import type { DashboardReportCardModel } from '../../utils/dashboardFilters';

type ReportCardGridProps = {
  reports: DashboardReportCardModel[];
  isLoading: boolean;
  isError: boolean;
  onGenerate: (code: string) => void;
};

function SkeletonCard() {
  return (
    <div className="rounded-md border border-[var(--color-neutral-200)] bg-white p-3 animate-pulse space-y-2">
      <div className="h-3 w-1/3 rounded bg-[var(--color-neutral-100)]" />
      <div className="h-4 w-2/3 rounded bg-[var(--color-neutral-100)]" />
      <div className="h-8 rounded bg-[var(--color-neutral-50)]" />
      <div className="h-7 rounded bg-[var(--color-neutral-100)]" />
    </div>
  );
}

export function ReportCardGrid({
  reports,
  isLoading,
  isError,
  onGenerate,
}: ReportCardGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
        aria-busy="true"
        aria-label="Loading reports"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Could not enrich the catalogue from the live API. Local registry entries are still shown when
        available.
      </p>
    );
  }

  if (!reports.length) {
    return (
      <section className="space-y-2.5 overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white p-3.5 shadow-sm">
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No formats match the current filters.
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {reports.map((report, index) => (
        <ReportCard
          key={report.code}
          report={report}
          index={index}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
}

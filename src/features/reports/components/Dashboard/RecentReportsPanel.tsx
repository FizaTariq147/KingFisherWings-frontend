import { Link } from 'react-router-dom';

/**
 * Recent runs are not available — there is no report-job history list API.
 * Styled like catalogue status banners. See docs/reports/BACKEND_REPORT_HISTORY.md.
 */
export function RecentReportsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      className={
        compact
          ? 'rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-[13px] text-[var(--color-neutral-700)]'
          : 'rounded-sm border border-[var(--color-primary-200,#BFDBFE)] bg-[var(--color-primary-50,#EFF6FF)] px-3 py-2 text-[13px] text-[var(--color-primary-900,#1E3A5F)]'
      }
    >
      <p id="recent-reports-heading" className="font-medium">
        Recently generated
      </p>
      <p className="mt-0.5 text-[12px] leading-relaxed opacity-90">
        Report run history is not available yet. Generate still works from each card; jobs are polled
        only for the active download. Saved GL layouts:{' '}
        <Link to="/gl/saved-reports" className="underline underline-offset-2">
          My Reports
        </Link>
        .
      </p>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { appType, listShell, erpTable } from '@/lib/erpTypography';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState, OperationTypeBadge } from '@/components/erp';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import { jobStatusDisplayLabel } from '../constants/job.constants';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { getErrorMessage } from '../utils/getErrorMessage';

function formatWhen(value?: string): string {
  if (!value?.trim()) return '—';
  const d = Date.parse(value);
  if (!Number.isFinite(d)) return value;
  return new Date(d).toLocaleString();
}

/** Dashboard header “Closed” tab — jobs with status CLOSED only. */
export default function JobsClosedPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['jobs', 'closed', page] as const,
    queryFn: () =>
      jobService.list({ page, limit: 25, order: 'desc', status: 'CLOSED' }),
    enabled: Boolean(accessToken),
  });

  const jobs = query.data?.jobs ?? [];
  const meta = query.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const rows = useMemo(() => jobs, [jobs]);

  return (
    <div className={listShell.page}>
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Closed jobs</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Jobs with status CLOSED. Mutations stay locked until a reopen is approved.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={query.isFetching ? 'animate-spin' : undefined} />}
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
        </div>

        {query.isLoading ? (
          <p className="p-4 text-[13px] text-[#64748b]">Loading closed jobs…</p>
        ) : query.isError ? (
          <ErrorState
            message={getErrorMessage(query.error) || 'Failed to load closed jobs.'}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState title="No closed jobs" description="Jobs closed from ops will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className={erpTable.table}>
              <thead>
                <tr>
                  <th className={erpTable.th}>Job</th>
                  <th className={erpTable.th}>Type</th>
                  <th className={erpTable.th}>Status</th>
                  <th className={erpTable.th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id} className={erpTable.tr}>
                    <td className={erpTable.td}>
                      <Link
                        to={jobDetailPath(job)}
                        className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                      >
                        {jobDisplayNumber(job)}
                      </Link>
                    </td>
                    <td className={erpTable.td}>
                      <OperationTypeBadge code={job.job_type} />
                    </td>
                    <td className={erpTable.td}>{jobStatusDisplayLabel(job)}</td>
                    <td className={erpTable.td}>{formatWhen(job.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-2 border-t border-[var(--fresa-border,#E8EEF5)] px-4 py-3 text-[12px] text-[#64748B]">
            <span>
              Page {meta?.page ?? page} of {totalPages}
              {meta?.total != null ? ` · ${meta.total} total` : ''}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page <= 1 || query.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page >= totalPages || query.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { appType, listShell, erpTable } from '@/lib/erpTypography';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState, OperationTypeBadge } from '@/components/erp';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAccountsJobs } from '../hooks/useAccountsJobs';
import {
  JOB_STATUS_LABELS,
  jobStatusDisplayLabel,
  type JobStatus,
} from '../constants/job.constants';

const STATUS_FILTERS: Array<JobStatus | 'all'> = [
  'all',
  'COMPLETED',
  'DELIVERED',
  'CLOSED',
];

function formatDate(value?: string): string {
  if (!value?.trim()) return '—';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value;
  return new Date(t).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Accounts tab — GET /jobs/accounts (COMPLETED / DELIVERED / CLOSED).
 * Permission: jobs.accounts.view (Tenant Admin / finance pack).
 */
export default function AccountsJobsPage() {
  const [status, setStatus] = useState<JobStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [status, appliedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } = useAccountsJobs({
    page,
    limit: 25,
    order: 'desc',
    status: status === 'all' ? undefined : status,
    search: appliedSearch.trim() || undefined,
  });

  const jobs = data?.jobs ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className={listShell.page}>
      <PageBackLink to="/accounts" label="Back to accounts" />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Accounts jobs</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Completed, delivered, and closed jobs for finance (not scoped by ops job type).
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={isFetching ? 'animate-spin' : undefined} />}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        </div>

        <div className={listShell.toolbar}>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-sm border px-2.5 py-1 text-[12px] font-medium ${
                  status === s
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                    : 'border-[var(--fresa-border,#C9D3DF)] text-[#475569]'
                }`}
              >
                {s === 'all' ? 'All' : (JOB_STATUS_LABELS[s] ?? s)}
              </button>
            ))}
          </div>
          <form
            className="flex min-w-[220px] flex-1 gap-2 sm:max-w-sm sm:flex-none"
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedSearch(search.trim());
            }}
          >
            <input
              className="h-8 flex-1 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              placeholder="Search job number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>
        </div>

        {isError ? (
          <div className="px-3 py-3">
            <ErrorState
              message={
                getErrorMessage(error) ||
                'Failed to load accounts jobs. You may need jobs.accounts.view.'
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-1.5 px-3 py-4" aria-busy>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No accounts jobs found"
            description="Try another status filter or search, or wait for completed / delivered / closed jobs."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className={listShell.table}>
              <thead>
                <tr>
                  <th className={erpTable.th}>Job</th>
                  <th className={erpTable.th}>Type</th>
                  <th className={erpTable.th}>Status</th>
                  <th className={erpTable.th}>Branch</th>
                  <th className={erpTable.th}>Party</th>
                  <th className={erpTable.th}>ETD / ETA</th>
                  <th className={erpTable.th}>Invoices</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((row) => {
                  const href = row.job_type
                    ? jobDetailPath({ id: row.id, job_type: row.job_type })
                    : `/jobs/${row.id}`;
                  return (
                    <tr key={row.id} className={erpTable.row}>
                      <td className={erpTable.td}>
                        <Link
                          to={href}
                          className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                        >
                          {jobDisplayNumber(row)}
                        </Link>
                      </td>
                      <td className={erpTable.td}>
                        {row.job_type ? (
                          <OperationTypeBadge code={row.job_type} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={erpTable.td}>
                        {jobStatusDisplayLabel({ status: row.status })}
                      </td>
                      <td className={erpTable.td}>{row.branch_name || '—'}</td>
                      <td className={erpTable.td}>
                        {row.party_name ||
                          row.shipper_name ||
                          row.consignee_name ||
                          '—'}
                      </td>
                      <td className={erpTable.td}>
                        {formatDate(row.etd)} / {formatDate(row.eta)}
                      </td>
                      <td className={erpTable.td}>
                        {[
                          row.has_sale_invoice ? 'Sale' : null,
                          row.has_purchase_invoice ? 'PI' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                    </tr>
                  );
                })}
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
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page >= totalPages || isFetching}
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

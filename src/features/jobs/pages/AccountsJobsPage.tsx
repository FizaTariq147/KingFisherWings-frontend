import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { appType } from '@/lib/erpTypography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OperationTypeBadge } from '@/components/erp';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAccountsJobs } from '../hooks/useAccountsJobs';
import { JOB_STATUS_LABELS, type JobStatus } from '../constants/job.constants';

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
  const navigate = useNavigate();
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="mb-1 text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className={appType.pageTitle}>Accounts jobs</h2>
          <p className="mt-0.5 text-sm text-[var(--color-neutral-400)]">
            Completed, delivered, and closed jobs for finance (not scoped by ops job type).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
            className="flex min-w-[220px] flex-1 gap-2"
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
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getErrorMessage(error) ||
                'Failed to load accounts jobs. You may need jobs.accounts.view.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">
            No accounts jobs found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--fresa-border,#C9D3DF)] text-[11px] uppercase tracking-wide text-[#64748B]">
                  <th className="px-2 py-2 font-medium">Job</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Branch</th>
                  <th className="px-2 py-2 font-medium">Party</th>
                  <th className="px-2 py-2 font-medium">ETD / ETA</th>
                  <th className="px-2 py-2 font-medium">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((row) => {
                  const href =
                    row.job_type
                      ? jobDetailPath({ id: row.id, job_type: row.job_type })
                      : `/jobs/${row.id}`;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--fresa-border,#E8EEF5)] align-top"
                    >
                      <td className="px-2 py-2.5">
                        <Link
                          to={href}
                          className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                        >
                          {jobDisplayNumber(row)}
                        </Link>
                      </td>
                      <td className="px-2 py-2.5">
                        {row.job_type ? (
                          <OperationTypeBadge code={row.job_type} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-2 py-2.5">
                        {row.status
                          ? (JOB_STATUS_LABELS[row.status as JobStatus] ?? row.status)
                          : '—'}
                      </td>
                      <td className="px-2 py-2.5 text-[#334155]">
                        {row.branch_name || '—'}
                      </td>
                      <td className="px-2 py-2.5 text-[#334155]">
                        {row.party_name ||
                          row.shipper_name ||
                          row.consignee_name ||
                          '—'}
                      </td>
                      <td className="px-2 py-2.5 text-[#64748B]">
                        {formatDate(row.etd)} / {formatDate(row.eta)}
                      </td>
                      <td className="px-2 py-2.5 text-[12px] text-[#64748B]">
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

        {meta && (meta.totalPages ?? 1) > 1 ? (
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#64748B]">
            <span>
              Page {meta.page ?? page} of {meta.totalPages}
              {meta.total != null ? ` · ${meta.total} total` : ''}
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
                disabled={page >= (meta.totalPages ?? 1) || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

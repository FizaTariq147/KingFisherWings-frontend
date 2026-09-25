import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ClipboardList, FileSearch, Hash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { useCcDashboard, useCcQueue } from '../hooks/useCustomsClearance';

export default function CustomsClearanceHubPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const queueParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (statusFilter.trim()) params.status = statusFilter.trim();
    if (directionFilter.trim()) params.direction = directionFilter.trim();
    return params;
  }, [statusFilter, directionFilter]);
  const dashboard = useCcDashboard();
  const queue = useCcQueue(queueParams);
  const stats = dashboard.data;
  const items = queue.data?.items ?? [];

  const refresh = () => {
    void dashboard.refetch();
    void queue.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-900)]">
            Customs Clearance
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Queue and dashboard for CUSTOMS_CLEARANCE jobs — docs, classify, file, duty, clear,
            invoice, close.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Link to="/jobs/customs-clearance">
            <Button type="button" variant="secondary" size="sm">
              <ClipboardList className="h-3.5 w-3.5" />
              All CC jobs
            </Button>
          </Link>
          <Link to="/jobs/customs-clearance/new">
            <Button type="button" size="sm">
              New CC job
            </Button>
          </Link>
          <Link to="/customs-clearance/hs-validate">
            <Button type="button" variant="secondary" size="sm">
              <Hash className="h-3.5 w-3.5" />
              HS validate
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total', value: stats?.total },
          { label: 'Open', value: stats?.open },
          { label: 'Docs pending', value: stats?.docs_pending },
          { label: 'Assessment', value: stats?.in_assessment },
          { label: 'Duty pending', value: stats?.duty_pending },
          { label: 'Cleared', value: stats?.cleared },
          { label: 'Closed', value: stats?.closed },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className="px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                {kpi.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {dashboard.isLoading ? '…' : (kpi.value ?? '—')}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {dashboard.isError ? (
        <p className="text-sm text-[var(--color-danger-600)]">
          {dashboard.error instanceof Error
            ? dashboard.error.message
            : 'Could not load CC dashboard.'}
        </p>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            CC queue
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-36"
              placeholder="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <select
              className="rounded-md border border-[var(--color-neutral-200)] bg-white px-2 py-1.5 text-sm"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
            >
              <option value="">All directions</option>
              <option value="IMPORT">IMPORT</option>
              <option value="EXPORT">EXPORT</option>
              <option value="TRANSIT">TRANSIT</option>
            </select>
            <span className="text-xs text-[var(--color-neutral-500)]">
              {queue.data?.meta?.total != null
                ? `${queue.data.meta.total} item(s)`
                : `${items.length} item(s)`}
            </span>
          </div>
        </CardHeader>
        <div className="px-4 pb-4">
          {queue.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading queue…</p>
          ) : queue.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {queue.error instanceof Error ? queue.error.message : 'Could not load queue.'}
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">
              No jobs in the CC queue. Create a CUSTOMS_CLEARANCE job or convert an approved
              quotation.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
              {items.map((item) => {
                const jobId = item.job_id || item.id;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {item.job_number || jobId.slice(0, 8)}
                        {item.customer_name ? (
                          <span className="ml-2 font-normal text-[var(--color-neutral-500)]">
                            · {item.customer_name}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        {[item.stage, item.status, item.updated_at]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                    </div>
                    <Link
                      to={jobDetailPath({
                        id: jobId,
                        job_type: 'CUSTOMS_CLEARANCE',
                      })}
                      className="text-xs font-medium text-[var(--color-primary-600)] underline"
                    >
                      Open job
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

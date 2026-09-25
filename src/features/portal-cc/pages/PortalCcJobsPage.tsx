import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { usePortalCcJobs } from '../hooks/usePortalCc';

function formatLabel(value?: string | null): string {
  if (!value?.trim()) return '—';
  return value.replaceAll('_', ' ');
}

function statusVariant(
  status?: string | null,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = String(status ?? '').toUpperCase();
  if (/CLEAR|DONE|COMPLETE|RELEASED|CLOSED/.test(s)) return 'success';
  if (/HOLD|QUERY|PENDING|WAIT/.test(s)) return 'warning';
  if (/REJECT|FAIL|CANCEL|BLOCK/.test(s)) return 'danger';
  if (/PROGRESS|REVIEW|FILED|SUBMIT/.test(s)) return 'info';
  return 'neutral';
}

export default function PortalCcJobsPage() {
  const { data = [], isLoading, isError, error, refetch, isFetching } = usePortalCcJobs();

  const activeCount = data.filter((j) => {
    const s = String(j.status ?? j.stage ?? '').toUpperCase();
    return s && !/CLEAR|DONE|COMPLETE|RELEASED|CLOSED|CANCEL/.test(s);
  }).length;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Customs clearance"
        description="Track your customs clearance jobs, checklist progress, and document attachments."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <PortalStatCard
          label="CC jobs"
          value={isLoading ? '…' : data.length}
          Icon={ClipboardList}
          theme="navy"
        />
        <PortalStatCard
          label="In progress"
          value={isLoading ? '…' : activeCount}
          Icon={ShieldCheck}
          theme="orange"
        />
      </div>

      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading customs clearance jobs…" />
        ) : isError ? (
          <div className="space-y-2 p-6">
            <p className="text-sm text-[var(--color-danger-600)]" role="alert">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Could not load customs clearance jobs.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : data.length === 0 ? (
          <PortalEmptyState
            title="No customs clearance jobs"
            description="When a CUSTOMS_CLEARANCE job is opened for your account, it will appear here."
            Icon={ClipboardList}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {data.map((job) => (
              <PortalAnimatedListItem key={job.id}>
                <Link
                  to={`/portal/cc-jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--color-neutral-50)] sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary)]">
                      <ClipboardList size={16} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-neutral-900)]">
                        {job.job_number || job.id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--color-neutral-500)]">
                        {[formatLabel(job.stage), job.customer_name].filter(Boolean).join(' · ') ||
                          'Customs clearance'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    {job.status ? (
                      <Badge variant={statusVariant(job.status)}>
                        {formatLabel(job.status)}
                      </Badge>
                    ) : null}
                    <span className="text-xs font-semibold text-[var(--color-secondary)]">
                      Open
                    </span>
                  </div>
                </Link>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { appType, listShell } from '@/lib/erpTypography';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
import { JobConfirmModal } from '../components/JobConfirmModal';
import {
  JobMisFilters,
  jobMisFilterDraftToListParams,
  useJobMisFilterDraft,
} from '../components/JobFilters/JobMisFilters';
import { JobTable } from '../components/JobTable';
import {
  DEFAULT_JOB_PAGE_SIZE,
  JOB_SEGMENTS,
  type JobSegmentKey,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useJobs } from '../hooks/useJobs';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

export default function JobListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const segment = segmentFromPath(pathname) ?? 'air-export';
  const segmentConfig = JOB_SEGMENTS[segment as JobSegmentKey];

  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();
  const { draft, setDraft, applied, submit } = useJobMisFilterDraft(DEFAULT_JOB_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [segment, applied]);

  const listParams = useMemo(
    () =>
      jobMisFilterDraftToListParams(applied, page, {
        segmentJobTypes: segmentConfig.jobTypes,
      }),
    [applied, page, segmentConfig.jobTypes],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useJobs(listParams);
  const lifecycle = useJobLifecycleMutations();
  const prefix = jobRoutePrefix(segment as JobSegmentKey);

  const jobs = data?.jobs ?? [];
  const meta = data?.meta;

  const run = async (job: Job, fn: () => Promise<unknown>, successMsg: string) => {
    setActionError(null);
    setActionMessage(null);
    setPendingId(job.id);
    try {
      await fn();
      closeConfirm();
      setActionMessage(successMsg);
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className={listShell.page}>
      <PageBackLink to="/dashboard" label="Back" />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>{segmentConfig.label} Jobs</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="create"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => navigate(`${prefix}/new`)}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={isFetching ? 'animate-spin' : undefined} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>

        <JobMisFilters
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            setPage(1);
            submit();
          }}
          isSubmitting={isFetching}
          jobTypeOptions={segmentConfig.jobTypes}
          jobTypeAllLabel={`All ${segmentConfig.label} types`}
        />

        {actionError ? (
          <div
            role="alert"
            className="mx-3 mt-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {actionError}
          </div>
        ) : null}
        {actionMessage ? (
          <div
            role="status"
            className="mx-3 mt-2 rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700"
          >
            {actionMessage}
          </div>
        ) : null}

        {isError ? (
          <div className="px-3 py-3">
            <ErrorState
              message={getErrorMessage(error) || 'Failed to load jobs.'}
              onRetry={() => refetch()}
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
            title="No jobs found."
            description="Adjust filters and click Submit, or create a new job."
          />
        ) : (
          <JobTable
            jobs={jobs}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingId={pendingId}
            onView={(j) => navigate(`${prefix}/${j.id}`)}
            onEdit={(j) =>
              navigate(`${prefix}/${j.id}/edit`, {
                state: { from: `${location.pathname}${location.search}` },
              })
            }
            onCancel={(j) => requestConfirm('cancel', j)}
            onClose={(j) => requestConfirm('close', j)}
            onDelete={(j) => requestConfirm('delete', j)}
          />
        )}
      </div>

      {confirm ? (
        <JobConfirmModal
          open
          action={confirm.action}
          job={confirm.job}
          isPending={Boolean(pendingId)}
          onClose={closeConfirm}
          onConfirm={() => {
            const j = confirm.job;
            if (confirm.action === 'cancel') {
              return run(j, () => lifecycle.cancel.mutateAsync(j.id), 'Job cancelled.');
            }
            if (confirm.action === 'close') {
              return run(j, () => lifecycle.close.mutateAsync(j.id), 'Job closed.');
            }
            return run(j, () => lifecycle.remove.mutateAsync(j.id), 'Job deleted.');
          }}
        />
      ) : null}
    </div>
  );
}

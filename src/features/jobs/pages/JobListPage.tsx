import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appType, listShell } from '@/lib/erpTypography';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { JobConfirmModal } from '../components/JobConfirmModal';
import {
  JobMisFilters,
  jobMisDraftFromSearch,
  jobMisFilterDraftToListParams,
  useJobMisFilterDraft,
} from '../components/JobFilters/JobMisFilters';
import { JobTable } from '../components/JobTable';
import {
  DEFAULT_JOB_PAGE_SIZE,
  JOB_SEGMENTS,
  JOB_TYPES,
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { jobService } from '../services/job.service';
import type { Job } from '../types/job.types';
import { effectiveJobListType } from '../utils/effectiveJobListType';
import { getErrorMessage } from '../utils/getErrorMessage';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

/**
 * Department job list.
 * BE owns staff visibility. FE loads the full staff-visible job set, then
 * client-filters to this department (any creator). No job_type on the default
 * request that would collapse the list under operations_scope.
 */
export default function JobListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { pathname } = location;
  const segment = segmentFromPath(pathname) ?? 'air-export';
  const segmentConfig = JOB_SEGMENTS[segment as JobSegmentKey];

  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();
  const { draft, setDraft, applied, submit, setApplied } = useJobMisFilterDraft(
    DEFAULT_JOB_PAGE_SIZE,
    () => jobMisDraftFromSearch(location.search, DEFAULT_JOB_PAGE_SIZE),
  );

  useEffect(() => {
    const seeded = jobMisDraftFromSearch(location.search, applied.rows || DEFAULT_JOB_PAGE_SIZE);
    if (!seeded.status && !seeded.category) return;
    if (seeded.status === applied.status && seeded.category === applied.category) return;
    setDraft((prev) => ({ ...prev, status: seeded.status, category: seeded.category }));
    setApplied((prev) => ({ ...prev, status: seeded.status, category: seeded.category }));
    setPage(1);
  }, [location.search, applied.status, applied.category, applied.rows, setDraft, setApplied]);

  useEffect(() => {
    setPage(1);
  }, [segment, applied]);

  const allowedSegmentTypes = segmentConfig.jobTypes;
  const segmentTypeSet = useMemo(
    () => new Set<JobType>(allowedSegmentTypes),
    [allowedSegmentTypes],
  );

  // Admin: plain list. Staff: probe all types — BE enforces grants; FE only segments in UI.
  const scopeTypes = useMemo((): JobType[] | null => {
    if (isOpsUnrestrictedUser(user)) return null;
    return [...JOB_TYPES];
  }, [user]);

  const filterParams = useMemo(() => {
    const params = jobMisFilterDraftToListParams(applied, 1, {
      segmentJobTypes: undefined,
    });
    delete params.job_types;
    delete params.job_type;
    if (!applied.createdBy?.trim()) delete params.created_by;
    if (!applied.salespersonId?.trim()) delete params.salesperson_id;
    if (!applied.departmentId?.trim()) delete params.department_id;
    return params;
  }, [applied]);

  const listQuery = useQuery({
    queryKey: ['tenant', 'jobs', 'department-all-v3', segment, filterParams, scopeTypes === null ? 'admin' : 'staff'],
    queryFn: async () => {
      const byId = new Map<string, Job>();
      const first = await jobService.listVisibleJobs(
        {
          ...filterParams,
          page: 1,
          limit: 100,
          order: filterParams.order ?? 'desc',
        },
        { scopeTypes },
      );
      for (const job of first.jobs ?? []) {
        if (job?.id) byId.set(job.id, job);
      }

      const total = first.meta?.total ?? byId.size;
      const maxPages = Math.min(10, Math.ceil(Math.max(total, 1) / 100));
      for (let pageNum = 2; pageNum <= maxPages; pageNum += 1) {
        const more = await jobService.listVisibleJobs(
          {
            ...filterParams,
            page: pageNum,
            limit: 100,
            order: filterParams.order ?? 'desc',
          },
          { scopeTypes },
        );
        for (const job of more.jobs ?? []) {
          if (job?.id) byId.set(job.id, job);
        }
        if ((more.jobs?.length ?? 0) === 0) break;
      }

      return { jobs: [...byId.values()] };
    },
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });

  const lifecycle = useJobLifecycleMutations();
  const prefix = jobRoutePrefix(segment as JobSegmentKey);

  const filteredJobs = useMemo(() => {
    const rows = listQuery.data?.jobs ?? [];
    const selectedType = applied.jobType?.trim() as JobType | undefined;
    const inSegment = rows.filter((job) => {
      const type = effectiveJobListType(job);
      if (selectedType) return type === selectedType;
      return segmentTypeSet.has(type);
    });
    // If type labels are wrong but BE already scoped the staff list, still show
    // rows when this department would otherwise look empty while jobs exist.
    if (inSegment.length === 0 && rows.length > 0 && !selectedType) {
      return rows;
    }
    return inSegment;
  }, [listQuery.data?.jobs, applied.jobType, segmentTypeSet]);

  const pageSize = applied.rows || DEFAULT_JOB_PAGE_SIZE;
  const jobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page, pageSize]);

  const meta = useMemo(
    () => ({
      page,
      limit: pageSize,
      total: filteredJobs.length,
      totalPages: Math.max(1, Math.ceil(filteredJobs.length / pageSize) || 1),
    }),
    [filteredJobs.length, page, pageSize],
  );

  const isLoading = listQuery.isLoading;
  const isFetching = listQuery.isFetching;
  const isError = listQuery.isError;
  const error = listQuery.error;
  const refetch = () => void listQuery.refetch();

  useEffect(() => {
    void listQuery.refetch();
  }, [segment]); // eslint-disable-line react-hooks/exhaustive-deps -- refresh on department change

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
          jobTypeOptions={allowedSegmentTypes}
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

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appType, listShell } from '@/lib/erpTypography';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
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
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useVisibleJobListScope } from '../hooks/useVisibleJobListParams';
import { jobService } from '../services/job.service';
import type { Job } from '../types/job.types';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import {
  effectiveJobListType,
  inferJobTypeFromJobNumber,
} from '../utils/effectiveJobListType';
import { getErrorMessage } from '../utils/getErrorMessage';
import { resolveListProbesFromCounts } from '../utils/resolveListProbesFromCounts';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

/** Stamp job_type from job-number mid-code when it maps into this department. */
function stampJobForSegment(
  job: Job,
  segmentTypes: ReadonlySet<JobType>,
): Job | null {
  const resolved = effectiveJobListType(job);
  if (segmentTypes.has(resolved)) {
    return job.job_type === resolved ? job : { ...job, job_type: resolved };
  }
  const fromNum = inferJobTypeFromJobNumber(job.job_number);
  if (fromNum && segmentTypes.has(fromNum)) {
    return { ...job, job_type: fromNum };
  }
  return null;
}

/**
 * Department job list (staff + admin).
 * Staff never uses All Jobs MIS — only this page per Operation department.
 * Load strategy:
 * 1) jobService.list with this segment's job_types (typed + untyped merge inside list)
 * 2) listVisibleJobs (same path as Active shipments) then client-keep this segment
 * Never invent created_by; show every creator in the department.
 */
export default function JobListPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const fullScope = useVisibleJobListScope();
  const segmentScope = useVisibleJobListScope({
    candidates: allowedSegmentTypes,
  });

  const filterParams = useMemo(() => {
    const params = jobMisFilterDraftToListParams(applied, 1, {
      segmentJobTypes: allowedSegmentTypes,
    });
    // Department pages always scope to this segment's types (not a single job_type
    // query that can empty the list under a broken JWT filter).
    if (!applied.jobType?.trim()) {
      params.job_type = undefined;
      params.job_types = [...allowedSegmentTypes];
    }
    if (!applied.createdBy?.trim()) delete params.created_by;
    if (!applied.salespersonId?.trim()) delete params.salesperson_id;
    // Job-type department pages: never send org department_id (not staff ACL).
    delete params.department_id;
    return params;
  }, [applied, allowedSegmentTypes]);

  const listQuery = useQuery({
    queryKey: [
      'tenant',
      'jobs',
      'department-segment-v11',
      segment,
      filterParams,
      fullScope.kind,
      segmentScope.probeTypes.slice().sort().join(','),
      fullScope.probeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      let expectedTotal = 0;
      let countVisible: string[] | null | undefined;
      try {
        const counts = await jobService.dashboardCounts(
          filterParams.branch_id ? { branch_id: filterParams.branch_id } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
        countVisible = counts.visibleJobTypes;
      } catch {
        expectedTotal = 0;
      }

      const byId = new Map<string, Job>();
      const takeSegment = (jobs: Job[] | undefined) => {
        for (const job of jobs ?? []) {
          if (!job?.id) continue;
          const stamped = stampJobForSegment(job, segmentTypeSet);
          if (stamped) byId.set(stamped.id, stamped);
        }
      };

      const selectedType = applied.jobType?.trim() as JobType | undefined;
      const staffProbes =
        fullScope.probeTypes.length > 0
          ? fullScope.probeTypes
          : segmentScope.probeTypes.length > 0
            ? segmentScope.probeTypes
            : [...allowedSegmentTypes];

      const { scopeTypes: listScope, probeTypes: listProbes } =
        resolveListProbesFromCounts({
          staffScopeTypes: fullScope.scopeTypes,
          staffProbeTypes: staffProbes,
          countVisible,
        });

      // 1) Full visible list (no org department_id) — then keep this segment.
      const visible = await jobService.listVisibleJobs(
        {
          page: 1,
          limit: 100,
          order: filterParams.order ?? 'desc',
          status: filterParams.status,
          search: filterParams.search,
          branch_id: filterParams.branch_id,
          shipper_id: filterParams.shipper_id,
          consignee_id: filterParams.consignee_id,
          from_date: filterParams.from_date,
          to_date: filterParams.to_date,
          date_field: filterParams.date_field,
          department_id: undefined,
          created_by: filterParams.created_by,
          salesperson_id: filterParams.salesperson_id,
        },
        {
          scopeTypes: listScope,
          scopeConfident: false,
          probeTypes: listProbes,
          expectedTotal,
        },
      );
      takeSegment(visible.jobs);

      const visTotal = Math.max(visible.meta?.total ?? 0, expectedTotal);
      if (visTotal > 100) {
        const pages = Math.min(10, Math.ceil(visTotal / 100));
        for (let pageNum = 2; pageNum <= pages; pageNum += 1) {
          const more = await jobService.listVisibleJobs(
            {
              page: pageNum,
              limit: 100,
              order: filterParams.order ?? 'desc',
              status: filterParams.status,
              search: filterParams.search,
              branch_id: filterParams.branch_id,
              department_id: undefined,
            },
            {
              scopeTypes: listScope,
              scopeConfident: false,
              probeTypes: listProbes,
              expectedTotal,
            },
          );
          takeSegment(more.jobs);
          if ((more.jobs?.length ?? 0) === 0) break;
        }
      }

      // 2) Segment typed list if this department is still empty.
      if (byId.size === 0) {
        const typed = await jobService.list({
          ...filterParams,
          page: 1,
          limit: 100,
          order: filterParams.order ?? 'desc',
          department_id: undefined,
          job_types: selectedType ? undefined : [...allowedSegmentTypes],
          job_type: selectedType || undefined,
        });
        takeSegment(typed.jobs);
      }

      return {
        jobs: [...byId.values()],
        visibleJobTypes: visible.meta?.visible_job_types ?? countVisible,
        expectedTotal,
      };
    },
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });

  const lifecycle = useJobLifecycleMutations();
  const prefix = jobRoutePrefix(segment as JobSegmentKey);

  const filteredJobs = useMemo(() => {
    const rows = listQuery.data?.jobs ?? [];
    const selectedType = applied.jobType?.trim() as JobType | undefined;

    const stamped: Job[] = [];
    for (const job of rows) {
      if (selectedType) {
        const type = effectiveJobListType(job);
        const fromNum = inferJobTypeFromJobNumber(job.job_number);
        if (type === selectedType || fromNum === selectedType) {
          stamped.push(
            job.job_type === (fromNum === selectedType ? fromNum : type)
              ? job
              : {
                  ...job,
                  job_type: fromNum === selectedType ? fromNum : type,
                },
          );
        }
        continue;
      }
      const kept = stampJobForSegment(job, segmentTypeSet);
      if (kept) stamped.push(kept);
    }

    // Segment filter blanked a non-empty list — keep mid-code matches only (never other depts).
    if (stamped.length === 0 && rows.length > 0 && !selectedType) {
      for (const job of rows) {
        const fromNum = inferJobTypeFromJobNumber(job.job_number);
        if (fromNum && segmentTypeSet.has(fromNum)) {
          stamped.push({ ...job, job_type: fromNum });
        }
      }
    }

    return stamped;
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
          showOrgDepartmentFilter={false}
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

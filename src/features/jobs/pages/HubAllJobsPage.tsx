import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
import { documentationJobsService } from '@/features/documentation/services/documentation.service';
import { appType, listShell } from '@/lib/erpTypography';
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
  JOB_TYPES,
  type JobType,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useVisibleJobListScope } from '../hooks/useVisibleJobListParams';
import { jobService } from '../services/job.service';
import type { Job } from '../types/job.types';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import { effectiveJobListType } from '../utils/effectiveJobListType';
import { getErrorMessage } from '../utils/getErrorMessage';
import { normalizeJob } from '../utils/normalizeJob';
import { resolveListProbesFromCounts } from '../utils/resolveListProbesFromCounts';
import { jobDetailPath } from '../utils/jobRoute';
import { useAuthStore } from '@/store/authStore';

export type HubAllJobsVariant = 'nvocc' | 'documentation' | 'management';

const NVOCC_JOB_TYPES: JobType[] = ['NVOCC_EXPORT', 'NVOCC_IMPORT'];

function variantConfig(variant: HubAllJobsVariant) {
  if (variant === 'nvocc') {
    return {
      jobTypes: NVOCC_JOB_TYPES as JobType[],
      filterJobTypes: NVOCC_JOB_TYPES as JobType[],
      jobTypeFilterLabel: 'All NVOCC types',
      createPath: '/jobs/new?job_type=NVOCC_EXPORT',
      showUploadManifest: false,
      subtitle: 'NVOCC export and import jobs.',
    };
  }
  if (variant === 'documentation') {
    return {
      jobTypes: [...JOB_TYPES],
      filterJobTypes: undefined as JobType[] | undefined,
      jobTypeFilterLabel: 'All job types',
      createPath: '/jobs/new',
      showUploadManifest: true,
      subtitle: 'Jobs available for documentation and manifests.',
    };
  }
  return {
    jobTypes: [...JOB_TYPES],
    filterJobTypes: undefined as JobType[] | undefined,
    jobTypeFilterLabel: 'All job types',
    createPath: '/jobs/new',
    showUploadManifest: false,
    subtitle: 'Operations overview of all jobs for MIS.',
  };
}

export interface HubAllJobsPageProps {
  variant: HubAllJobsVariant;
  backTo: string;
  title: string;
  /** Overrides variant default subtitle (e.g. staff /jobs/all). */
  subtitle?: string;
}

/** Hub All Jobs list — reuses Jobs API/table; chrome matches Management/NVOCC/Documentation shells. */
export default function HubAllJobsPage({ variant, backTo, title, subtitle }: HubAllJobsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const config = variantConfig(variant);

  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [manifestHint, setManifestHint] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();
  const { draft, setDraft, applied, setApplied, submit } = useJobMisFilterDraft(
    DEFAULT_JOB_PAGE_SIZE,
    () => jobMisDraftFromSearch(location.search, DEFAULT_JOB_PAGE_SIZE),
  );

  // Hard client filter only for hub variants with a fixed type set (NVOCC).
  // Staff management uses granted departments only — never the full role pack.
  const hardClientTypes = useMemo((): JobType[] | null => {
    if (config.filterJobTypes?.length) return config.filterJobTypes;
    return null;
  }, [config.filterJobTypes]);

  const staffScope = useVisibleJobListScope({
    candidates: config.filterJobTypes?.length ? config.filterJobTypes : undefined,
  });

  // Admin: null (or NVOCC hard filter). Staff: granted ∩ hub candidates — never full JOB_TYPES.
  const scopeTypes = useMemo((): JobType[] | null => {
    if (staffScope.scopeTypes === null) {
      return hardClientTypes;
    }
    if (hardClientTypes?.length) {
      const allowed = new Set(
        staffScope.probeTypes.length
          ? staffScope.probeTypes
          : staffScope.scopeTypes,
      );
      return hardClientTypes.filter((t) => allowed.has(t));
    }
    return staffScope.scopeTypes;
  }, [hardClientTypes, staffScope.scopeTypes, staffScope.probeTypes]);

  const probeTypes = useMemo((): JobType[] => {
    if (scopeTypes === null) return [];
    if (Array.isArray(scopeTypes) && scopeTypes.length) return scopeTypes;
    return staffScope.probeTypes;
  }, [scopeTypes, staffScope.probeTypes]);

  const jobTypeOptions = useMemo((): JobType[] => {
    if (Array.isArray(scopeTypes) && scopeTypes.length) return scopeTypes;
    if (config.filterJobTypes?.length) return config.filterJobTypes;
    if (staffScope.jobTypes?.length) return staffScope.jobTypes;
    return config.jobTypes;
  }, [config.filterJobTypes, config.jobTypes, scopeTypes, staffScope.jobTypes]);

  // Keep filters in sync when dashboard pills change ?status= / ?category=
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
  }, [variant, applied]);

  const isStaffScoped = scopeTypes !== null;

  const filterParams = useMemo(() => {
    const params = jobMisFilterDraftToListParams(applied, 1, {
      segmentJobTypes: undefined,
    });
    // Plain GET /jobs — BE DB-resolves staff scope. Filter job_type client-side.
    delete params.job_types;
    delete params.job_type;
    // Default hub view: every creator in scope (admin + staff).
    if (!applied.createdBy?.trim()) delete params.created_by;
    if (!applied.salespersonId?.trim()) delete params.salesperson_id;
    // Staff ACL is job type, not org department_id (null on most jobs → 14→1).
    // Admin MIS may still filter by org department.
    if (isStaffScoped || !applied.departmentId?.trim()) {
      delete params.department_id;
    }
    return params;
  }, [applied, isStaffScoped]);

  const categoryFilter = applied.category.trim();
  const useCategoryList = Boolean(categoryFilter) && variant !== 'documentation';

  const jobsQuery = useQuery({
    queryKey: [
      'tenant',
      'jobs',
      'hub-visible-v10',
      variant,
      filterParams,
      isStaffScoped ? 'staff' : 'admin',
      probeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      // Same ACL target as Total jobs: branch_id only — never org department_id.
      const branchId = filterParams.branch_id?.trim() || undefined;
      let expectedTotal = 0;
      let countVisible: string[] | null | undefined;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
        countVisible = counts.visibleJobTypes;
      } catch {
        expectedTotal = 0;
      }

      const { scopeTypes: listScope, probeTypes: listProbes } =
        resolveListProbesFromCounts({
          staffScopeTypes: scopeTypes,
          staffProbeTypes: probeTypes,
          countVisible,
        });

      const listOpts = {
        scopeTypes: listScope,
        scopeConfident: false,
        probeTypes: listProbes,
        expectedTotal,
      };

      const listParams = {
        order: filterParams.order ?? ('desc' as const),
        search: filterParams.search,
        status: filterParams.status,
        shipper_id: filterParams.shipper_id,
        consignee_id: filterParams.consignee_id,
        branch_id: branchId,
        origin_port_id: filterParams.origin_port_id,
        dest_port_id: filterParams.dest_port_id,
        date_field: filterParams.date_field,
        from_date: filterParams.from_date,
        to_date: filterParams.to_date,
        masters_only: filterParams.masters_only,
        created_by: filterParams.created_by,
        salesperson_id: filterParams.salesperson_id,
        // Staff: never org department_id (null on most jobs → empty/1-row lists).
        department_id:
          listScope === null && filterParams.department_id
            ? filterParams.department_id
            : undefined,
      };

      const byId = new Map<string, Job>();
      for (let pageNum = 1; pageNum <= 10; pageNum += 1) {
        const result = await jobService.listVisibleJobs(
          { ...listParams, page: pageNum, limit: 100 },
          listOpts,
        );
        for (const job of result.jobs ?? []) {
          if (job?.id) byId.set(job.id, job);
        }
        const got = result.jobs?.length ?? 0;
        if (got === 0) break;
        if (pageNum * 100 >= Math.max(result.meta?.total ?? got, expectedTotal)) break;
        if (expectedTotal > 0 && byId.size >= expectedTotal) break;
      }

      return {
        jobs: [...byId.values()],
        expectedTotal: Math.max(expectedTotal, byId.size),
      };
    },
    enabled: Boolean(accessToken) && variant !== 'documentation' && !useCategoryList,
    staleTime: 15_000,
  });
  const categoryQuery = useQuery({
    queryKey: ['tenant', 'jobs', 'by-category', categoryFilter, page, applied.rows, applied.order],
    queryFn: () =>
      jobService.listByCategory(categoryFilter, {
        page,
        limit: applied.rows,
        order: applied.order,
        search: applied.search.trim() || undefined,
      }),
    enabled: Boolean(accessToken) && useCategoryList,
  });
  const documentationQuery = useQuery({
    queryKey: ['documentation', 'jobs', filterParams],
    queryFn: () =>
      documentationJobsService.list({
        page: 1,
        limit: 100,
        search: filterParams.search,
        status: filterParams.status,
        order: filterParams.order,
        from_date: filterParams.from_date,
        to_date: filterParams.to_date,
        branch_id: filterParams.branch_id,
        // Staff: omit org department_id (same ACL as jobs list / counts).
        ...(isStaffScoped ? {} : { department_id: filterParams.department_id }),
      }),
    enabled: variant === 'documentation',
  });

  const rawJobs = useMemo(() => {
    if (variant === 'documentation') {
      return (documentationQuery.data?.items ?? [])
        .map((row) => normalizeJob(row))
        .filter((j): j is Job => Boolean(j));
    }
    if (useCategoryList) return categoryQuery.data?.jobs ?? [];
    return jobsQuery.data?.jobs ?? [];
  }, [
    variant,
    useCategoryList,
    documentationQuery.data?.items,
    categoryQuery.data?.jobs,
    jobsQuery.data?.jobs,
  ]);

  const filteredJobs = useMemo(() => {
    const selectedType = applied.jobType?.trim();
    const scopeSet = hardClientTypes
      ? new Set(hardClientTypes.map((t) => canonicalizeJobType(String(t))))
      : null;
    return rawJobs.filter((job) => {
      const type = effectiveJobListType(job);
      if (selectedType) return type === canonicalizeJobType(selectedType);
      if (scopeSet) return scopeSet.has(type);
      return true;
    });
  }, [rawJobs, applied.jobType, hardClientTypes]);

  const pageSize = applied.rows || DEFAULT_JOB_PAGE_SIZE;
  const jobs = useMemo(() => {
    if (useCategoryList) return filteredJobs;
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page, pageSize, useCategoryList]);

  const meta = useMemo(() => {
    if (useCategoryList) return categoryQuery.data?.meta;
    if (variant === 'documentation') {
      return {
        page,
        limit: pageSize,
        total: filteredJobs.length,
        totalPages: Math.max(1, Math.ceil(filteredJobs.length / pageSize) || 1),
      };
    }
    return {
      page,
      limit: pageSize,
      total: filteredJobs.length,
      totalPages: Math.max(1, Math.ceil(filteredJobs.length / pageSize) || 1),
    };
  }, [
    useCategoryList,
    categoryQuery.data?.meta,
    variant,
    filteredJobs.length,
    page,
    pageSize,
  ]);

  const isLoading =
    variant === 'documentation'
      ? documentationQuery.isLoading
      : useCategoryList
        ? categoryQuery.isLoading
        : jobsQuery.isLoading;
  const isFetching =
    variant === 'documentation'
      ? documentationQuery.isFetching
      : useCategoryList
        ? categoryQuery.isFetching
        : jobsQuery.isFetching;
  const isError =
    variant === 'documentation'
      ? documentationQuery.isError
      : useCategoryList
        ? categoryQuery.isError
        : jobsQuery.isError;
  const error =
    variant === 'documentation'
      ? documentationQuery.error
      : useCategoryList
        ? categoryQuery.error
        : jobsQuery.error;
  const refetch =
    variant === 'documentation'
      ? documentationQuery.refetch
      : useCategoryList
        ? categoryQuery.refetch
        : jobsQuery.refetch;
  const lifecycle = useJobLifecycleMutations();

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

  const hubBackLabel =
    variant === 'nvocc'
      ? 'Back to NVOCC'
      : variant === 'documentation'
        ? 'Back to Documentation'
        : 'Back to Management';

  return (
    <div className={listShell.page}>
      <PageBackLink to={backTo} label={hubBackLabel} />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>{title}</h2>
            <p className={appType.pageSubtitle}>{subtitle ?? config.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="create"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => navigate(config.createPath)}
            >
              Create
            </Button>
            {config.showUploadManifest ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Upload />}
                onClick={() =>
                  setManifestHint(
                    'Upload Manifest is not connected to an API yet. Open a job and use the Documents tab.',
                  )
                }
              >
                Upload Manifest
              </Button>
            ) : null}
            {variant === 'documentation' ? (
              <Button
                type="button"
                variant="edit"
                size="sm"
                leftIcon={<Wand2 />}
                onClick={() =>
                  void documentationJobsService
                    .createWizard()
                    .then(() => navigate('/jobs/new'))
                    .catch((err) => setActionError(getErrorMessage(err)))
                }
              >
                Create wizard
              </Button>
            ) : null}
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
          jobTypeOptions={jobTypeOptions}
          jobTypeAllLabel={config.jobTypeFilterLabel}
          showOrgDepartmentFilter={!isStaffScoped}
          showUserFilters={!isStaffScoped}
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
        {manifestHint ? (
          <div
            role="status"
            className="mx-3 mt-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[13px] text-[#64748b]"
          >
            {manifestHint}
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
            onView={(j) => navigate(jobDetailPath(j))}
            onEdit={(j) => navigate(`${jobDetailPath(j)}/edit`)}
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

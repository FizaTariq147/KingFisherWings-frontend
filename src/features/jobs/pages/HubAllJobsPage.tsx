import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { JobConfirmModal } from '../components/JobConfirmModal';
import { JobFilters } from '../components/JobFilters';
import { JobTable } from '../components/JobTable';
import {
  DEFAULT_JOB_PAGE_SIZE,
  JOB_TYPES,
  type JobStatus,
  type JobType,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useJobs } from '../hooks/useJobs';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath } from '../utils/jobRoute';

export type HubAllJobsVariant = 'nvocc' | 'documentation' | 'management';

const NVOCC_JOB_TYPES: JobType[] = ['NVOCC_EXPORT', 'NVOCC_IMPORT'];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function variantConfig(variant: HubAllJobsVariant) {
  if (variant === 'nvocc') {
    return {
      jobTypes: NVOCC_JOB_TYPES as JobType[],
      /** Client-side type filter after fetch (NVOCC-only hub). */
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
      filterJobTypes: undefined,
      jobTypeFilterLabel: 'All job types',
      createPath: '/jobs/new',
      showUploadManifest: true,
      subtitle: 'Jobs available for documentation and manifests.',
    };
  }
  return {
    jobTypes: [...JOB_TYPES],
    filterJobTypes: undefined,
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
}

/** Hub All Jobs list — reuses Jobs API/table; chrome matches Management/NVOCC/Documentation shells. */
export default function HubAllJobsPage({ variant, backTo, title }: HubAllJobsPageProps) {
  const navigate = useNavigate();
  const config = variantConfig(variant);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | JobStatus>('');
  const [jobType, setJobType] = useState<'' | JobType>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [mastersOnly, setMastersOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [manifestHint, setManifestHint] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, jobType, order, fromDate, toDate, mastersOnly, variant]);

  const listParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_JOB_PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: status || undefined,
      job_type: jobType || undefined,
      job_types: !jobType ? config.filterJobTypes : undefined,
      order,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      masters_only: mastersOnly || undefined,
    }),
    [
      page,
      debouncedSearch,
      status,
      jobType,
      config.jobTypes,
      order,
      fromDate,
      toDate,
      mastersOnly,
    ],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useJobs(listParams);
  const lifecycle = useJobLifecycleMutations();
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

  const hubBackLabel =
    variant === 'nvocc'
      ? 'Back to NVOCC'
      : variant === 'documentation'
        ? 'Back to Documentation'
        : 'Back to Management';

  return (
    <div className="space-y-3">
      <PageBackLink to={backTo} label={hubBackLabel} />
      <div className="bg-white border border-[var(--color-neutral-200)] rounded-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-b border-[var(--color-neutral-200)]">
        <div>
          <h2 className="text-[17px] font-medium text-[var(--color-neutral-800)]">{title}</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">{config.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {config.showUploadManifest && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setManifestHint(
                  'Upload Manifest is not connected to an API yet. Open a job and use the Documents tab.',
                )
              }
            >
              <Upload className="h-4 w-4" />
              Upload Manifest
            </Button>
          )}
          <Button type="button" onClick={() => navigate(config.createPath)}>
            <Wand2 className="h-4 w-4 sm:hidden" />
            <Plus className="h-4 w-4 hidden sm:block" />
            Create
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <JobFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          jobType={jobType}
          onJobTypeChange={setJobType}
          jobTypeOptions={config.jobTypes}
          jobTypeAllLabel={config.jobTypeFilterLabel}
          order={order}
          onOrderChange={setOrder}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
          mastersOnly={mastersOnly}
          onMastersOnlyChange={setMastersOnly}
        />

        {isError && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-danger-600)]">
            <AlertCircle className="h-4 w-4" />
            {getErrorMessage(error)}
          </div>
        )}
        {actionError && (
          <div role="alert" className="text-sm text-[var(--color-danger-600)]">
            {actionError}
          </div>
        )}
        {actionMessage && (
          <div role="status" className="text-sm text-[var(--color-success-700)]">
            {actionMessage}
          </div>
        )}
        {manifestHint && (
          <div role="status" className="text-sm text-[var(--color-neutral-600)]">
            {manifestHint}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-8 text-center">Loading jobs…</p>
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

      {confirm && (
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
      )}
      </div>
    </div>
  );
}

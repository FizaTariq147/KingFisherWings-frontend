import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  JobConfirmModal,
} from '../components/JobConfirmModal';
import { JobFilters } from '../components/JobFilters';
import { JobTable } from '../components/JobTable';
import {
  DEFAULT_JOB_PAGE_SIZE,
  JOB_SEGMENTS,
  type JobSegmentKey,
  type JobStatus,
  type JobType,
} from '../constants/job.constants';
import { useJobLifecycleMutations } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useJobs } from '../hooks/useJobs';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function JobListPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segment = segmentFromPath(pathname) ?? 'air-export';
  const segmentConfig = JOB_SEGMENTS[segment as JobSegmentKey];

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
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, jobType, order, fromDate, toDate, mastersOnly, segment]);

  const listParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_JOB_PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: status || undefined,
      job_type: jobType || undefined,
      job_types: jobType ? undefined : segmentConfig.jobTypes,
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
      segmentConfig.jobTypes,
      order,
      fromDate,
      toDate,
      mastersOnly,
    ],
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            {segmentConfig.label} Jobs
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Bookings, milestones, charges, and documents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${prefix}/new`)}>
            <Plus className="h-4 w-4" />
            Create job
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <JobFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          jobType={jobType}
          onJobTypeChange={setJobType}
          jobTypeOptions={segmentConfig.jobTypes}
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
        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-8 text-center">Loading jobs…</p>
        ) : (
          <JobTable
            jobs={jobs}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingId={pendingId}
            onView={(j) => navigate(`${prefix}/${j.id}`)}
            onEdit={(j) => navigate(`${prefix}/${j.id}/edit`)}
            onCancel={(j) => requestConfirm('cancel', j)}
            onClose={(j) => requestConfirm('close', j)}
            onDelete={(j) => requestConfirm('delete', j)}
          />
        )}
      </Card>

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
  );
}

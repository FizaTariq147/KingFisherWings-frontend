import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { JobStatusBadge } from '@/features/jobs/components/JobStatusBadge';
import type { JobStatus, JobType } from '@/features/jobs/constants/job.constants';
import { JOB_TYPES } from '@/features/jobs/constants/job.constants';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useDashboardJobCounts } from '@/features/auth/dashboard/hooks/useDashboardJobCounts';
import { useAuth } from '@/hooks/useAuth';
import { canonicalizeJobType } from '@/features/jobs/utils/canonicalizeJobType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import {
  jobDetailPath,
  jobDisplayNumber,
} from '@/features/jobs/utils/jobRoute';

const WIDGET_LIMIT = 8;
const FETCH_LIMIT = 40;

/** Statuses treated as closed — excluded from widget rows. */
const CLOSED_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

function formatEtd(value?: string): string {
  if (!value?.trim()) return '—';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

/**
 * Dashboard card: latest jobs from GET /jobs (BE scopes by JWT).
 * Badge / title count uses dashboard job_count — not open / created_in_period.
 */
export function CurrentActiveJobsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobCounts = useDashboardJobCounts('month');
  const staffJobTypes = useMemo((): JobType[] | undefined => {
    if (isOpsUnrestrictedUser(user)) return undefined;
    const types = new Set<JobType>();
    for (const raw of [
      ...(Array.isArray(user?.visibleJobTypes) ? user.visibleJobTypes : []),
      ...(Array.isArray(user?.writableJobTypes) ? user.writableJobTypes : []),
    ]) {
      types.add(canonicalizeJobType(raw));
    }
    return types.size ? [...types] : [...JOB_TYPES];
  }, [user]);
  const { data, isLoading, isError } = useJobs({
    page: 1,
    limit: FETCH_LIMIT,
    order: 'desc',
    ...(staffJobTypes?.length ? { job_types: staffJobTypes } : {}),
  });

  const activeJobs = (data?.jobs ?? [])
    .filter((job) => !CLOSED_STATUSES.includes(job.status))
    .slice(0, WIDGET_LIMIT);

  const totalJobs =
    jobCounts.data?.jobCount ?? data?.meta?.total ?? activeJobs.length;

  return (
    <DashboardCard
      title="Total jobs"
      count={totalJobs}
      isLoading={isLoading || jobCounts.isLoading}
      isEmpty={!isLoading && (isError || activeJobs.length === 0)}
      emptyMessage={isError ? 'Could not load jobs.' : 'No jobs yet.'}
      onExpand={() => navigate('/management/all-jobs-mis')}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>ETD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeJobs.map((job) => {
            const path = jobDetailPath(job);
            return (
              <TableRow key={job.id}>
                <TableCell>
                  <Link
                    to={path}
                    className="font-medium text-[var(--color-primary-700)] hover:underline"
                  >
                    {jobDisplayNumber(job)}
                  </Link>
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-[var(--color-neutral-600)]">
                  {formatEtd(job.etd)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}

export default CurrentActiveJobsWidget;

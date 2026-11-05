import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { useDashboardJobCounts } from '@/features/auth/dashboard/hooks/useDashboardJobCounts';
import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/features/jobs/services/job.service';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import {
  jobDetailPath,
  jobDisplayNumber,
} from '@/features/jobs/utils/jobRoute';
import { useAuthStore } from '@/store/authStore';

const WIDGET_LIMIT = 8;
const FETCH_LIMIT = 40;

const CLOSED_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

function formatEtd(value?: string): string {
  if (!value?.trim()) return '—';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

/** Latest jobs for staff/admin — same visibility path as Active shipments. */
export function CurrentActiveJobsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const jobCounts = useDashboardJobCounts('month');

  const scopeTypes = useMemo((): JobType[] | null => {
    if (isOpsUnrestrictedUser(user)) return null;
    return [...JOB_TYPES];
  }, [user]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenant', 'widgets', 'active-jobs-v3', scopeTypes === null ? 'admin' : 'staff'],
    queryFn: () =>
      jobService.listVisibleJobs(
        { page: 1, limit: FETCH_LIMIT, order: 'desc' },
        { scopeTypes },
      ),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });

  const activeJobs = (data?.jobs ?? [])
    .filter((job) => !CLOSED_STATUSES.includes(job.status))
    .slice(0, WIDGET_LIMIT);

  const totalJobs =
    jobCounts.data?.jobCount ?? data?.meta?.total ?? activeJobs.length;

  return (
    <DashboardCard
      title={`Total jobs (${totalJobs})`}
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
                  <JobStatusBadge job={job} />
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

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
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import {
  jobDetailPath,
  jobDisplayNumber,
} from '@/features/jobs/utils/jobRoute';

const WIDGET_LIMIT = 8;
const FETCH_LIMIT = 40;

/** Statuses treated as closed — excluded from "active" jobs. */
const CLOSED_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

function formatEtd(value?: string): string {
  if (!value?.trim()) return '—';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

/**
 * Dashboard card: latest open jobs from GET /jobs.
 * Auth / tenant isolation via existing JWT + Axios (same pattern as PendingQuotationsWidget).
 * Menu permission keys are not required here — Sidebar also shows Jobs without those flags.
 */
export function CurrentActiveJobsWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useJobs({
    page: 1,
    limit: FETCH_LIMIT,
    order: 'desc',
  });

  const activeJobs = (data?.jobs ?? [])
    .filter((job) => !CLOSED_STATUSES.includes(job.status))
    .slice(0, WIDGET_LIMIT);

  return (
    <DashboardCard
      title="Current Active Jobs"
      accent="secondary"
      isLoading={isLoading}
      isEmpty={!isLoading && (isError || activeJobs.length === 0)}
      emptyMessage={
        isError ? 'Unable to load active jobs.' : 'No active jobs right now.'
      }
      onExpand={() => navigate('/jobs/air-export')}
      onAdd={() => navigate('/jobs/new')}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job No.</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>POL</TableHead>
            <TableHead>POD</TableHead>
            <TableHead>ETD</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeJobs.map((job) => {
            const client =
              job.shipper_name?.trim() ||
              job.consignee_name?.trim() ||
              '—';
            const path = jobDetailPath(job);
            return (
              <TableRow key={job.id}>
                <TableCell className="text-[var(--color-primary)]">
                  <Link
                    to={path}
                    className="hover:underline focus:outline-none focus:underline"
                  >
                    {jobDisplayNumber(job)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  <div title={client}>{client}</div>
                </TableCell>
                <TableCell>{job.origin_port_code || '—'}</TableCell>
                <TableCell>{job.dest_port_code || '—'}</TableCell>
                <TableCell>{formatEtd(job.etd)}</TableCell>
                <TableCell>
                  <JobStatusBadge job={job} />
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

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
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import {
  jobDetailPath,
  jobDisplayNumber,
} from '@/features/jobs/utils/jobRoute';
import type { Job } from '@/features/jobs/types/job.types';

const WIDGET_LIMIT = 8;
const FETCH_LIMIT = 40;
const CLOSED_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

function shipmentNumber(job: Job): string {
  return (
    job.hawb_number?.trim() ||
    job.mawb_number?.trim() ||
    job.hbl_number?.trim() ||
    job.mbl_number?.trim() ||
    jobDisplayNumber(job)
  );
}

/** Dashboard card: active jobs presented as shipments (HAWB/MAWB/HBL/MBL when present). */
export function CurrentActiveShipmentsWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useJobs({
    page: 1,
    limit: FETCH_LIMIT,
    order: 'desc',
  });

  const shipments = (data?.jobs ?? [])
    .filter((job) => !CLOSED_STATUSES.includes(job.status))
    .slice(0, WIDGET_LIMIT);

  return (
    <DashboardCard
      title="Current Active Shipments"
      accent="primary"
      isLoading={isLoading}
      isEmpty={!isLoading && (isError || shipments.length === 0)}
      emptyMessage={
        isError ? 'Unable to load active shipments.' : 'No active shipments right now.'
      }
      onExpand={() => navigate('/jobs/air-export')}
      onAdd={() => navigate('/jobs/new')}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shipment No.</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Job No.</TableHead>
            <TableHead>POR</TableHead>
            <TableHead>POF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((job) => {
            const client =
              job.shipper_name?.trim() ||
              job.consignee_name?.trim() ||
              '—';
            const path = jobDetailPath(job);
            return (
              <TableRow key={job.id}>
                <TableCell mono className="text-[var(--color-primary)]">
                  <Link
                    to={path}
                    className="hover:underline focus:outline-none focus:underline"
                  >
                    {shipmentNumber(job)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  <div title={client}>{client}</div>
                </TableCell>
                <TableCell mono className="text-[var(--color-primary)]">
                  <Link
                    to={path}
                    className="hover:underline focus:outline-none focus:underline"
                  >
                    {jobDisplayNumber(job)}
                  </Link>
                </TableCell>
                <TableCell>{job.origin_port_code || '—'}</TableCell>
                <TableCell>{job.dest_port_code || '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}

export default CurrentActiveShipmentsWidget;

import { StatusBadge } from '@/components/erp';
import { JOB_STATUS_LABELS, type JobStatus } from '../../constants/job.constants';
import type { Job } from '../../types/job.types';

export function JobStatusBadge({ job }: { job: Pick<Job, 'status'> }) {
  const status = job.status;
  return (
    <StatusBadge
      status={status}
      label={JOB_STATUS_LABELS[status as JobStatus] ?? status}
    />
  );
}

import { Badge } from '@/components/ui/Badge';
import { JOB_STATUS_LABELS, type JobStatus } from '../../constants/job.constants';
import type { Job } from '../../types/job.types';

const TONE: Record<JobStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  ENQUIRY: 'neutral',
  QUOTATION: 'info',
  BOOKING_CONFIRMED: 'info',
  IN_PROGRESS: 'warning',
  DOCS_PENDING: 'warning',
  CUSTOMS_CLEARANCE: 'warning',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  ON_HOLD: 'neutral',
};

export function JobStatusBadge({ job }: { job: Pick<Job, 'status'> }) {
  const status = job.status;
  return (
    <Badge variant={TONE[status] ?? 'neutral'}>
      {JOB_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

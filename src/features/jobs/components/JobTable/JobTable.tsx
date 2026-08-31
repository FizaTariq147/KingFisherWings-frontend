import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { JOB_TYPE_LABELS } from '../../constants/job.constants';
import type { Job, PaginationMeta } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';
import { jobPartyLabel, jobScheduleLabel } from '../../utils/jobDisplay';
import { JobActionMenu } from '../JobActionMenu';
import { JobStatusBadge } from '../JobStatusBadge';

interface JobTableProps {
  jobs: Job[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingId?: string | null;
  onView: (j: Job) => void;
  onEdit: (j: Job) => void;
  onCancel: (j: Job) => void;
  onClose: (j: Job) => void;
  onDelete: (j: Job) => void;
}

export function JobTable({
  jobs,
  isFetching,
  meta,
  onPage,
  pendingId,
  onView,
  onEdit,
  onCancel,
  onClose,
  onDelete,
}: JobTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Job #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Shipper</TableHead>
            <TableHead>Consignee</TableHead>
            <TableHead>ETD / ETA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((j) => (
              <TableRow key={j.id} className="cursor-pointer">
                <TableCell>
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => onView(j)}
                  >
                    {jobDisplayNumber(j)}
                  </button>
                </TableCell>
                <TableCell>{JOB_TYPE_LABELS[j.job_type] ?? j.job_type}</TableCell>
                <TableCell>{jobPartyLabel(j, 'shipper')}</TableCell>
                <TableCell>{jobPartyLabel(j, 'consignee')}</TableCell>
                <TableCell>{jobScheduleLabel(j)}</TableCell>
                <TableCell>
                  <JobStatusBadge job={j} />
                </TableCell>
                <TableCell>
                  <JobActionMenu
                    job={j}
                    disabled={pendingId === j.id}
                    onView={onView}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    onClose={onClose}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {meta && meta.totalPages > 1 && onPage && (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} jobs)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
              className="px-3 py-1 rounded border disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
              className="px-3 py-1 rounded border disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { AppFetchBar } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { ListRowEditButton } from '@/components/ui/ListRowEditButton';
import { OperationTypeBadge } from '@/components/erp';
import { useParties } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import { erpTable, listShell } from '@/lib/erpTypography';
import { useMemo } from 'react';
import { JOB_TYPE_LABELS } from '../../constants/job.constants';
import type { Job, PaginationMeta } from '../../types/job.types';
import { jobDisplayNumber, jobEditable } from '../../utils/jobRoute';
import { jobPartyLabel, jobRouteLabel, jobScheduleLabel } from '../../utils/jobDisplay';
import { JobActionMenu } from '../JobActionMenu';
import { JobStatusBadge } from '../JobStatusBadge';

interface JobTableProps {
  jobs: Job[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingId?: string | null;
  emptyMessage?: string;
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
  emptyMessage = 'No jobs found',
  onView,
  onEdit,
  onCancel,
  onClose,
  onDelete,
}: JobTableProps) {
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of partiesResult?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      const label = [p.code, p.name].filter(Boolean).join(' — ');
      if (label) map.set(p.id, label);
    }
    return map;
  }, [partiesResult?.parties]);

  return (
    <div className="relative">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <div className="overflow-x-auto">
        <table className={listShell.table}>
          <thead>
            <tr>
              <th className={`${erpTable.th} w-10`}>{''}</th>
              <th className={erpTable.th}>Job No</th>
              <th className={erpTable.th}>Department</th>
              <th className={erpTable.th}>Shipper</th>
              <th className={erpTable.th}>Consignee</th>
              <th className={erpTable.th}>POL / POD</th>
              <th className={erpTable.th}>Commodity</th>
              <th className={erpTable.th}>ETD / ETA</th>
              <th className={erpTable.th}>Status</th>
              <th className={`${erpTable.th} w-10`}>{''}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={10} className={`${erpTable.td} ${listShell.empty}`}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              jobs.map((j) => {
                const canEdit = jobEditable(j.status);
                return (
                  <tr
                    key={j.id}
                    className={`${erpTable.row} cursor-pointer`}
                    onClick={() => onView(j)}
                  >
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                      <ListRowEditButton
                        disabled={pendingId === j.id || !canEdit}
                        title={canEdit ? 'Edit job' : 'Job is not editable'}
                        onClick={() => (canEdit ? onEdit(j) : onView(j))}
                      />
                    </td>
                    <td className={erpTable.td}>
                      <span className="font-semibold text-[var(--color-primary-700)]">
                        {jobDisplayNumber(j)}
                      </span>
                    </td>
                    <td className={erpTable.td}>
                      <OperationTypeBadge code={j.job_type} />
                      <span className="sr-only">{JOB_TYPE_LABELS[j.job_type] ?? j.job_type}</span>
                    </td>
                    <td className={erpTable.td}>{jobPartyLabel(j, 'shipper', partyMap)}</td>
                    <td className={erpTable.td}>{jobPartyLabel(j, 'consignee', partyMap)}</td>
                    <td className={erpTable.td}>{jobRouteLabel(j)}</td>
                    <td className={erpTable.td}>
                      {j.commodity?.trim() && !isUuid(j.commodity.trim())
                        ? j.commodity.trim()
                        : '—'}
                    </td>
                    <td className={erpTable.td}>{jobScheduleLabel(j)}</td>
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                      <JobStatusBadge job={j} />
                    </td>
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                      <JobActionMenu
                        job={j}
                        disabled={pendingId === j.id}
                        onView={onView}
                        onEdit={onEdit}
                        onCancel={onCancel}
                        onClose={onClose}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && onPage ? (
        <div className="flex items-center justify-between border-t border-[#d0d7de] px-3 py-2 text-[13px]">
          <span className="text-[#64748b]">
            {meta.total} job(s) · Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="px-2 py-1.5">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

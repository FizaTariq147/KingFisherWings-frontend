import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { JobBillsOfLadingPanel } from '../components/JobBillsOfLadingPanel';
import { JobCargoPanel } from '../components/JobCargoPanel';
import { JobChargesPanel } from '../components/JobChargesPanel';
import { JobConfirmModal } from '../components/JobConfirmModal';
import { JobContainersPanel } from '../components/JobContainersPanel';
import { JobDocumentsPanel } from '../components/JobDocumentsPanel';
import { JobLogisticsPanel } from '../components/JobLogisticsPanel';
import { JobMilestonesPanel } from '../components/JobMilestonesPanel';
import { JobNotesPanel } from '../components/JobNotesPanel';
import { JobOpsPanel } from '../components/JobOpsPanel';
import { JobOverviewPanel } from '../components/JobOverviewPanel';
import { JobPnlPanel } from '../components/JobPnlPanel';
import { JobStuffingPanel } from '../components/JobStuffingPanel';
import { JOB_STATUS_LABELS, JOB_SEGMENTS, type JobSegmentKey } from '../constants/job.constants';
import { useJobActions } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useJob, useJobHouseJobs } from '../hooks/useJobs';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  jobDisplayNumber,
  jobEditable,
  jobRoutePrefix,
  segmentFromPath,
} from '../utils/jobRoute';

function statusTone(status: string): 'emerald' | 'amber' | 'rose' | 'slate' {
  if (status === 'COMPLETED' || status === 'DELIVERED') return 'emerald';
  if (status === 'CANCELLED') return 'rose';
  if (status === 'IN_PROGRESS' || status === 'DOCS_PENDING') return 'amber';
  return 'slate';
}

function isSeaFcl(jobType: string): boolean {
  return jobType === 'SEA_FCL_EXPORT' || jobType === 'SEA_FCL_IMPORT';
}

export default function JobDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segment = (segmentFromPath(pathname) ?? 'air-export') as JobSegmentKey;
  const prefix = jobRoutePrefix(segment);
  const segmentLabel = JOB_SEGMENTS[segment].label;

  const { data: job, isLoading, isError, error, refetch } = useJob(id);
  const { data: houseJobs = [] } = useJobHouseJobs(id, Boolean(job && !job.parent_job_id));
  const actions = useJobActions(id);
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const tabs = useMemo(() => {
    if (!job) return [];
    const sea = isSeaFcl(job.job_type);
    return [
      { key: 'overview', label: 'Overview', content: <JobOverviewPanel job={job} /> },
      { key: 'ops', label: 'Ops / Mode', content: <JobOpsPanel job={job} /> },
      ...(sea
        ? [
            { key: 'containers', label: 'Containers', content: <JobContainersPanel jobId={id} /> },
            { key: 'cargo', label: 'Cargo', content: <JobCargoPanel jobId={id} /> },
            { key: 'bl', label: 'Bills of lading', content: <JobBillsOfLadingPanel jobId={id} /> },
            { key: 'stuffing', label: 'Stuffing', content: <JobStuffingPanel jobId={id} /> },
          ]
        : []),
      {
        key: 'charges',
        label: 'Charges',
        content: <JobChargesPanel job={job} onChanged={() => refetch()} />,
      },
      { key: 'pnl', label: 'P&L', content: <JobPnlPanel jobId={id} /> },
      { key: 'milestones', label: 'Milestones', content: <JobMilestonesPanel jobId={id} /> },
      { key: 'notes', label: 'Notes', content: <JobNotesPanel jobId={id} /> },
      { key: 'documents', label: 'Documents', content: <JobDocumentsPanel jobId={id} jobType={job.job_type} /> },
      {
        key: 'logistics',
        label: 'Logistics',
        content: <JobLogisticsPanel jobId={id} jobType={job.job_type} />,
      },
      ...(houseJobs.length
        ? [
            {
              key: 'house',
              label: `House jobs (${houseJobs.length})`,
              content: (
                <ul className="space-y-2 text-sm">
                  {houseJobs.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        className="underline text-[var(--color-primary-600)]"
                        onClick={() => navigate(`${prefix}/${h.id}`)}
                      >
                        {jobDisplayNumber(h)}
                      </button>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]
        : []),
    ];
  }, [job, id, houseJobs, prefix, navigate, refetch]);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !job) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Job not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const editable = jobEditable(job.status);
  const canDelete = job.status === 'COMPLETED' || job.status === 'CANCELLED';

  const run = async (fn: () => Promise<unknown>, successMsg: string, navigateAway?: boolean) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      await fn();
      closeConfirm();
      if (navigateAway) {
        navigate(prefix);
        return;
      }
      setActionMessage(successMsg);
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(editable
      ? [
          {
            label: 'Edit',
            onClick: () => navigate(`${prefix}/${id}/edit`),
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: 'Close job',
            onClick: () => requestConfirm('close', job),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: 'Cancel job',
            onClick: () => requestConfirm('cancel', job),
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: 'Delete',
            onClick: () => requestConfirm('delete', job),
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {(actionError || actionMessage) && (
        <div className="mb-3 space-y-2">
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
        </div>
      )}
      <DetailPageTemplate
        title={jobDisplayNumber(job)}
        subtitle={`${segmentLabel} · ${job.shipper_name || job.shipper_id}`}
        statusLabel={JOB_STATUS_LABELS[job.status] ?? job.status}
        statusTone={statusTone(job.status)}
        tabs={tabs}
        actions={headerActions}
        actionsDisabled={pending || actions.cancel.isPending || actions.close.isPending}
        onBack={() => navigate(prefix)}
        backLabel={`${segmentLabel} jobs`}
      />
      {confirm && (
        <JobConfirmModal
          open
          action={confirm.action}
          job={confirm.job}
          isPending={pending}
          onClose={closeConfirm}
          onConfirm={() => {
            if (confirm.action === 'cancel') {
              return run(() => actions.cancel.mutateAsync(), 'Job cancelled.');
            }
            if (confirm.action === 'close') {
              return run(() => actions.close.mutateAsync(), 'Job closed.');
            }
            return run(() => actions.remove.mutateAsync(), 'Job deleted.', true);
          }}
        />
      )}
    </>
  );
}

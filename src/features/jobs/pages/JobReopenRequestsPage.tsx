import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { appType } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { JobReopenRequest, JobReopenRequestStatus } from '../types/job.types';

/** Prefer a human name; never surface a bare user UUID in the inbox. */
function requesterLabel(row: JobReopenRequest): string {
  const name = String(row.requested_by_name ?? '').trim();
  if (name && !isUuid(name)) return name;
  return '—';
}
import {
  useApproveJobReopenRequest,
  useJobReopenRequests,
  useRejectJobReopenRequest,
} from '../hooks/useJobReopenRequests';

const STATUS_FILTERS: Array<JobReopenRequestStatus | 'all'> = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'all',
];

function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (s === 'PENDING') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (s === 'APPROVED') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === 'REJECTED') return 'bg-rose-50 text-rose-800 border-rose-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function JobReopenRequestsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<JobReopenRequestStatus | 'all'>('PENDING');
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<JobReopenRequest | null>(null);
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const listParams = {
    page,
    limit: 50,
    status: status === 'all' ? undefined : status,
  };
  const { data, isLoading, isFetching, isError, error, refetch } =
    useJobReopenRequests(listParams);
  const approve = useApproveJobReopenRequest();
  const reject = useRejectJobReopenRequest();
  const items = data?.items ?? [];
  const meta = data?.meta;
  const pending = approve.isPending || reject.isPending;

  const openReview = (row: JobReopenRequest, mode: 'approve' | 'reject') => {
    setReviewTarget(row);
    setReviewMode(mode);
    setNotes('');
    setRejectReason('');
    setActionError(null);
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setActionError(null);
    try {
      if (reviewMode === 'approve') {
        await approve.mutateAsync({
          requestId: reviewTarget.id,
          jobId: reviewTarget.job_id,
          dto: notes.trim() ? { notes: notes.trim() } : {},
        });
      } else {
        const reason = rejectReason.trim();
        if (reason.length < 3) {
          setActionError('Rejection reason is required (at least 3 characters).');
          return;
        }
        await reject.mutateAsync({
          requestId: reviewTarget.id,
          jobId: reviewTarget.job_id,
          dto: {
            reason,
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          },
        });
      }
      setReviewTarget(null);
      void refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="mb-1 text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
          <h2 className={appType.pageTitle}>Job reopen requests</h2>
          <p className="mt-0.5 text-sm text-[var(--color-neutral-400)]">
            Tenant Admin inbox — approve or reject staff reopen requests for closed jobs.
            Branch Managers cannot approve.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-sm border px-2.5 py-1 text-[12px] font-medium ${
                status === s
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                  : 'border-[var(--fresa-border,#C9D3DF)] text-[#475569]'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getErrorMessage(error) || 'Failed to load reopen requests.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">
            No reopen requests{status !== 'all' ? ` with status ${status}` : ''}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--fresa-border,#C9D3DF)] text-[11px] uppercase tracking-wide text-[#64748B]">
                  <th className="px-2 py-2 font-medium">Job</th>
                  <th className="px-2 py-2 font-medium">Requested by</th>
                  <th className="px-2 py-2 font-medium">Reason</th>
                  <th className="px-2 py-2 font-medium">Target</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const jobHref =
                    row.job_id && row.job_type
                      ? jobDetailPath({ id: row.job_id, job_type: row.job_type })
                      : row.job_id
                        ? `/jobs/${row.job_id}`
                        : null;
                  const jobLabel = jobDisplayNumber({
                    job_number: row.job_number ?? row.job?.job_number,
                    id: row.job_id,
                  });
                  const isPending = String(row.status).toUpperCase() === 'PENDING';
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--fresa-border,#E8EEF5)] align-top"
                    >
                      <td className="px-2 py-2.5">
                        {jobHref ? (
                          <Link
                            to={jobHref}
                            className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                          >
                            {jobLabel}
                          </Link>
                        ) : (
                          <span>{jobLabel}</span>
                        )}
                        {row.job_status ? (
                          <div className="mt-0.5 text-[11px] text-[#64748B]">{row.job_status}</div>
                        ) : null}
                      </td>
                      <td className="px-2 py-2.5 text-[#334155]">
                        {requesterLabel(row)}
                        {row.created_at ? (
                          <div className="mt-0.5 text-[11px] text-[#64748B]">
                            {new Date(row.created_at).toLocaleString()}
                          </div>
                        ) : null}
                      </td>
                      <td className="max-w-[280px] px-2 py-2.5 text-[#334155]">
                        <span className="line-clamp-3">{row.reason || '—'}</span>
                      </td>
                      <td className="px-2 py-2.5 text-[#334155]">
                        {row.target_status || 'IN_PROGRESS'}
                      </td>
                      <td className="px-2 py-2.5">
                        <span
                          className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${statusTone(String(row.status))}`}
                        >
                          {String(row.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        {isPending ? (
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="report"
                              leftIcon={<CheckCircle2 />}
                              disabled={pending}
                              onClick={() => openReview(row, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              leftIcon={<X />}
                              disabled={pending}
                              onClick={() => openReview(row, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#64748B]">
                            {(row.reviewed_by_name && !isUuid(row.reviewed_by_name)
                              ? row.reviewed_by_name
                              : null) ||
                              row.review_notes ||
                              '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && (meta.totalPages ?? 1) > 1 ? (
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#64748B]">
            <span>
              Page {meta.page ?? page} of {meta.totalPages}
              {meta.total != null ? ` · ${meta.total} total` : ''}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page >= (meta.totalPages ?? 1) || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      {reviewTarget ? (
        <Modal
          open
          onClose={() => !pending && setReviewTarget(null)}
          title={reviewMode === 'approve' ? 'Approve reopen request' : 'Reject reopen request'}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setReviewTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant={reviewMode === 'approve' ? 'report' : 'danger'}
                disabled={pending}
                onClick={() => void submitReview()}
              >
                {pending
                  ? reviewMode === 'approve'
                    ? 'Approving…'
                    : 'Rejecting…'
                  : reviewMode === 'approve'
                    ? 'Approve & reopen'
                    : 'Reject'}
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-[13px] text-[#475569]">
            Job{' '}
            <strong>
              {jobDisplayNumber({
                job_number: reviewTarget.job_number ?? reviewTarget.job?.job_number,
                id: reviewTarget.job_id,
              })}
            </strong>
            {' — '}
            {reviewTarget.reason}
          </p>
          {actionError ? (
            <p className="mb-3 text-[13px] text-[var(--color-danger-600)]" role="alert">
              {actionError}
            </p>
          ) : null}
          {reviewMode === 'reject' ? (
            <label className="mb-3 block text-[13px]">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                Rejection reason (required)
              </span>
              <textarea
                className="min-h-[72px] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 py-2 text-[13px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={2000}
              />
            </label>
          ) : null}
          <label className="block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">
              Notes (optional)
            </span>
            <textarea
              className="min-h-[56px] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 py-2 text-[13px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
          </label>
        </Modal>
      ) : null}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, RefreshCw } from 'lucide-react';
import { appType, listShell, erpTable } from '@/lib/erpTypography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { Job } from '../types/job.types';

function formatWhen(value?: string): string {
  if (!value?.trim()) return '—';
  const d = Date.parse(value);
  if (!Number.isFinite(d)) return value;
  return new Date(d).toLocaleString();
}

export default function JobsOnHoldPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [heldAt, setHeldAt] = useState('');
  const [expectedRelease, setExpectedRelease] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['jobs', 'by-category', 'on_hold', page] as const,
    queryFn: () =>
      jobService.listByCategory('on_hold', { page, limit: 25, order: 'desc' }),
    enabled: Boolean(accessToken),
  });

  const patchHold = useMutation({
    mutationFn: ({
      id,
      reason,
      held_at,
      expected_release_at,
    }: {
      id: string;
      reason?: string;
      held_at?: string | null;
      expected_release_at?: string | null;
    }) => jobService.patchHold(id, { reason, held_at, expected_release_at }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['jobs', 'by-category', 'on_hold'] });
    },
  });

  const jobs = query.data?.jobs ?? [];
  const meta = query.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const rows = useMemo(() => jobs, [jobs]);

  const toDatetimeLocal = (iso?: string | null): string => {
    if (!iso?.trim()) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEdit = (job: Job) => {
    setEditJob(job);
    setHoldReason(job.hold_reason ?? '');
    setHeldAt(toDatetimeLocal(job.held_at));
    setExpectedRelease(
      job.expected_release_at ? job.expected_release_at.slice(0, 10) : '',
    );
    setError(null);
    setMsg(null);
  };

  const saveEdit = async () => {
    if (!editJob) return;
    setError(null);
    setMsg(null);
    try {
      const heldAtIso = (() => {
        const raw = heldAt.trim();
        if (!raw) return null;
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
      })();
      await patchHold.mutateAsync({
        id: editJob.id,
        reason: holdReason.trim() || undefined,
        held_at: heldAtIso,
        expected_release_at: expectedRelease.trim() || null,
      });
      setMsg('Hold details updated.');
      setEditJob(null);
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={listShell.page}>
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Jobs on hold</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Held jobs with reasons, dates, and related documents.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={query.isFetching ? 'animate-spin' : undefined} />}
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
        </div>

        {error ? <p className="px-4 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="px-4 text-sm text-[var(--color-success-700)]">{msg}</p> : null}

        {query.isLoading ? (
          <p className="p-4 text-[13px] text-[#64748b]">Loading held jobs…</p>
        ) : query.isError ? (
          <ErrorState
            message={getErrorMessage(query.error) || 'Could not load held jobs.'}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState title="No jobs on hold" description="Held jobs will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className={erpTable.table}>
              <thead>
                <tr>
                  <th className={erpTable.th}>Job</th>
                  <th className={erpTable.th}>Hold reason</th>
                  <th className={erpTable.th}>Held at</th>
                  <th className={erpTable.th}>Expected release</th>
                  <th className={erpTable.th}>Type</th>
                  <th className={erpTable.th} />
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id} className={erpTable.tr}>
                    <td className={erpTable.td}>
                      <Link
                        className="font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                        to={jobDetailPath(job)}
                      >
                        {jobDisplayNumber(job)}
                      </Link>
                    </td>
                    <td className={erpTable.td}>{job.hold_reason || '—'}</td>
                    <td className={erpTable.td}>{formatWhen(job.held_at)}</td>
                    <td className={erpTable.td}>
                      {job.expected_release_at
                        ? formatWhen(job.expected_release_at)
                        : '—'}
                    </td>
                    <td className={erpTable.td}>
                      {job.job_type?.replaceAll('_', ' ') || '—'}
                    </td>
                    <td className={erpTable.td}>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={() => openEdit(job)}
                      >
                        Edit hold
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 px-4 py-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-[12px] text-[#64748b]">
              Page {page} / {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      {editJob ? (
        <Modal
          open
          onClose={() => !patchHold.isPending && setEditJob(null)}
          title={`Edit hold · ${jobDisplayNumber(editJob)}`}
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={patchHold.isPending}
                onClick={() => setEditJob(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={patchHold.isPending}
                onClick={() => void saveEdit()}
              >
                {patchHold.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Hold reason"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
            />
            <Input
              label="Held at"
              type="datetime-local"
              value={heldAt}
              onChange={(e) => setHeldAt(e.target.value)}
            />
            <Input
              label="Expected release date"
              type="date"
              value={expectedRelease}
              onChange={(e) => setExpectedRelease(e.target.value)}
            />
            <SectionAttachmentsPanel
              entity="jobs"
              entityId={editJob.id}
              section="pods"
              title="Hold-related documents"
              compact
            />
            {editJob.resume_reason ? (
              <p className="text-[12px] text-[#64748b]">
                Last resume reason: {editJob.resume_reason}
              </p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';
import type { JobConfirmAction } from '../../hooks/useJobConfirmState';
import { useJobCloseChecklist } from '../../hooks/useJobCloseChecklist';
import type { JobCloseBlocker } from '../../utils/normalizeJobCloseChecklist';

const CONFIG: Record<
  JobConfirmAction,
  {
    title: string;
    description: (label: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  cancel: {
    title: 'Cancel job?',
    description: (label) => `${label} will be marked CANCELLED.`,
    confirmLabel: 'Cancel job',
    variant: 'danger',
  },
  close: {
    title: 'Close job?',
    description: (label) =>
      `${label} will be marked CLOSED. Ops-finished COMPLETED is a separate status.`,
    confirmLabel: 'Close job',
    variant: 'primary',
  },
  delete: {
    title: 'Delete job?',
    description: (label) => `${label} will be soft-deleted.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

interface JobConfirmModalProps {
  open: boolean;
  action: JobConfirmAction;
  job: Job;
  isPending?: boolean;
  /** Tenant Admin / Branch Manager may force-close past checklist blockers. */
  allowForceClose?: boolean;
  onConfirm: (opts?: { force?: boolean }) => void;
  onClose: () => void;
  /** Navigate to clear a blocker (costing / vouchers / shipments). */
  onResolveBlocker?: (hint: NonNullable<JobCloseBlocker['resolveHint']>) => void;
}

export function JobConfirmModal({
  open,
  action,
  job,
  isPending,
  allowForceClose = false,
  onConfirm,
  onClose,
  onResolveBlocker,
}: JobConfirmModalProps) {
  const checklistQuery = useJobCloseChecklist(
    job.id,
    open && action === 'close',
  );
  const checklist = checklistQuery.data;
  const blockers = checklist?.blockers ?? [];
  const blocked = action === 'close' && blockers.length > 0;

  if (!open) return null;
  const cfg = CONFIG[action];
  const label = jobDisplayNumber(job);

  return (
    <Modal open={open} onClose={onClose} title={cfg.title}>
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning-600)]" />
          <p className="text-sm text-[var(--color-neutral-700)]">
            {cfg.description(label)}
          </p>
        </div>

        {action === 'close' ? (
          <div className="space-y-2 text-[13px]">
            {checklistQuery.isLoading ? (
              <p className="text-[#64748B]">Checking close checklist…</p>
            ) : checklistQuery.isError ? (
              <p className="text-[var(--color-danger-600)]">
                Could not load close checklist. You can still try to close; the
                server will reject if blockers remain.
              </p>
            ) : blocked ? (
              <div className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <p className="font-medium">
                  Job cannot be closed until checklist blockers are cleared
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-4">
                  {blockers.map((b) => (
                    <li key={`${b.code}-${b.message}`}>
                      <span>{b.message}</span>
                      {b.resolveHint && onResolveBlocker ? (
                        <>
                          {' '}
                          <button
                            type="button"
                            className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                            onClick={() => onResolveBlocker(b.resolveHint!)}
                          >
                            {b.resolveHint === 'costing'
                              ? 'Open Costing'
                              : b.resolveHint === 'vouchers'
                                ? 'Open Vouchers'
                                : 'Open Shipments'}
                          </button>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[12px] text-rose-800/90">
                  Clear these on the job (invoice sale charges, post vouchers,
                  finish open shipments), then close again.
                </p>
              </div>
            ) : (
              <p className="text-[var(--color-success-700)]">
                Close checklist is clear — no blockers.
              </p>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          {action === 'close' && blocked && allowForceClose ? (
            <Button
              type="button"
              variant="danger"
              disabled={isPending}
              onClick={() => onConfirm({ force: true })}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Force close
            </Button>
          ) : null}
          <Button
            type="button"
            variant={cfg.variant}
            disabled={isPending || (action === 'close' && blocked)}
            onClick={() => onConfirm()}
            title={
              blocked
                ? 'Clear checklist blockers before closing'
                : undefined
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cfg.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

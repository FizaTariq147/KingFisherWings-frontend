import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';
import type { JobConfirmAction } from '../../hooks/useJobConfirmState';

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
    description: (label) => `${label} will be marked COMPLETED.`,
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
  onConfirm: () => void;
  onClose: () => void;
}

export function JobConfirmModal({
  open,
  action,
  job,
  isPending,
  onConfirm,
  onClose,
}: JobConfirmModalProps) {
  if (!open) return null;
  const cfg = CONFIG[action];
  const label = jobDisplayNumber(job);

  return (
    <Modal open={open} onClose={onClose} title={cfg.title}>
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-[var(--color-warning-600)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-neutral-700)]">{cfg.description(label)}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant={cfg.variant} disabled={isPending} onClick={onConfirm}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cfg.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { zipDistanceDisplayLabel } from '../../utils/normalizeZipDistance';
import type { ZipDistance } from '../../types/zipDistance.types';

export type ZipDistanceConfirmAction = 'delete' | 'activate' | 'deactivate';

const CONFIG: Record<
  ZipDistanceConfirmAction,
  {
    title: string;
    description: (label: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  delete: {
    title: 'Delete zip distance?',
    description: (label) => `${label} will be soft-deleted.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  },
  activate: {
    title: 'Activate record?',
    description: (label) => `${label} will be set active.`,
    confirmLabel: 'Activate',
    variant: 'primary',
  },
  deactivate: {
    title: 'Deactivate record?',
    description: (label) => `${label} will be set inactive.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  },
};

interface ZipDistanceConfirmModalProps {
  open: boolean;
  action: ZipDistanceConfirmAction;
  item: ZipDistance;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ZipDistanceConfirmModal({
  open,
  action,
  item,
  isPending,
  onConfirm,
  onClose,
}: ZipDistanceConfirmModalProps) {
  if (!open) return null;
  const cfg = CONFIG[action];
  const label = zipDistanceDisplayLabel(item);

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

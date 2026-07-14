import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { AwbStockBatch } from '../../types/awbStock.types';
import { awbBatchDisplayLabel } from '../../utils/normalizeAwbStock';

export type AwbStockConfirmAction = 'delete';

const CONFIG: Record<
  AwbStockConfirmAction,
  {
    title: string;
    description: (label: string) => string;
    confirmLabel: string;
  }
> = {
  delete: {
    title: 'Delete AWB stock batch?',
    description: (label) =>
      `${label} will be soft-deleted. Only empty batches can be removed.`,
    confirmLabel: 'Delete',
  },
};

interface AwbStockConfirmModalProps {
  open: boolean;
  action: AwbStockConfirmAction;
  batch: AwbStockBatch;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function AwbStockConfirmModal({
  open,
  action,
  batch,
  isPending,
  onConfirm,
  onClose,
}: AwbStockConfirmModalProps) {
  if (!open) return null;
  const cfg = CONFIG[action];
  const label = awbBatchDisplayLabel(batch);

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
          <Button type="button" variant="danger" disabled={isPending} onClick={onConfirm}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cfg.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

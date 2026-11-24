import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type CompanyConfirmAction =
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'restore'
  | 'permanent';

interface CompanyConfirmModalProps {
  open: boolean;
  action?: CompanyConfirmAction;
  companyName: string;
  isDefault?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CompanyConfirmModal({
  open,
  action = 'delete',
  companyName,
  isDefault,
  isPending,
  onConfirm,
  onClose,
}: CompanyConfirmModalProps) {
  const label =
    typeof companyName === 'string' && companyName.trim() ? companyName.trim() : 'This company';

  const isBlockedDefaultDelete = action === 'delete' && Boolean(isDefault);

  const title = isBlockedDefaultDelete
    ? 'Cannot delete company'
    : action === 'delete'
      ? 'Delete company?'
      : action === 'activate'
        ? 'Activate company?'
        : action === 'deactivate'
          ? 'Deactivate company?'
          : action === 'restore'
            ? 'Restore company?'
            : 'Permanently delete company?';

  const description = isBlockedDefaultDelete
    ? `${label} is the default company. Soft-delete is blocked until another company is set as default.`
    : action === 'delete'
      ? `${label} will be soft-deleted and appear in Deleted trash until permanently removed.`
      : action === 'activate'
        ? `${label} will be marked active.`
        : action === 'deactivate'
          ? `${label} will be marked inactive.`
          : action === 'restore'
            ? `${label} will be restored from trash.`
            : `${label} will be permanently deleted. This cannot be undone. Related data may return 409.`;

  const confirmLabel =
    action === 'delete'
      ? 'Delete company'
      : action === 'activate'
        ? 'Activate'
        : action === 'deactivate'
          ? 'Deactivate'
          : action === 'restore'
            ? 'Restore'
            : 'Delete permanently';
  const confirmVariant = action === 'activate' || action === 'restore' ? 'primary' : 'danger';

  return (
    <Modal
      open={open}
      onClose={isPending ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        isBlockedDefaultDelete ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Working…' : confirmLabel}
            </Button>
          </>
        )
      }
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-danger-100)' }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--color-danger-700)' }} aria-hidden="true" />
        </div>
        <div className="space-y-2 text-sm text-[var(--color-neutral-600)] leading-relaxed">
          <p>{description}</p>
          {action === 'delete' && !isBlockedDefaultDelete && (
            <p className="text-xs text-[var(--color-neutral-400)]">
              Platform company profiles map to tenants — soft-delete uses the tenant trash.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

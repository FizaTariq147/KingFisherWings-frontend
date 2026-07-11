import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type CompanyConfirmAction = 'delete' | 'activate' | 'deactivate';

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
        : 'Deactivate company?';

  const description = isBlockedDefaultDelete
    ? `${label} is the default company. Soft-delete is blocked until another company is set as default.`
    : action === 'delete'
      ? `${label} will be soft-deleted.`
      : action === 'activate'
        ? `${label} will be marked active.`
        : `${label} will be marked inactive.`;

  const confirmLabel =
    action === 'delete' ? 'Delete company' : action === 'activate' ? 'Activate' : 'Deactivate';
  const confirmVariant = action === 'activate' ? 'primary' : 'danger';

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
              The API also blocks delete if this is the only company in the tenant.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

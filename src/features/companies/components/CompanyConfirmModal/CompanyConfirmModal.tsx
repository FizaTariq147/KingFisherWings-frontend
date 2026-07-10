import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type CompanyConfirmAction = 'delete' | 'activate' | 'deactivate';

const ACTION_CONFIG: Record<
  CompanyConfirmAction,
  {
    title: string;
    description: (name: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  delete: {
    title: 'Delete company?',
    description: (name) => `${name} will be soft-deleted.`,
    confirmLabel: 'Delete company',
    variant: 'danger',
  },
  activate: {
    title: 'Activate company?',
    description: (name) => `${name} will be marked active.`,
    confirmLabel: 'Activate',
    variant: 'primary',
  },
  deactivate: {
    title: 'Deactivate company?',
    description: (name) => `${name} will be marked inactive.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  },
};

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
  const config = ACTION_CONFIG[action];

  return (
    <Modal
      open={open}
      onClose={isPending ? () => {} : onClose}
      title={config.title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant={config.variant} onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'Working…' : config.confirmLabel}
          </Button>
        </>
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
          <p>
            <strong>{companyName}</strong> — {config.description(companyName)}
          </p>
          {action === 'delete' && isDefault && (
            <p className="text-[var(--color-danger-700)]">
              This is the default company — deletion may be blocked by the API.
            </p>
          )}
          {action === 'delete' && (
            <p>Deletion is blocked if this is the only company in your tenant.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

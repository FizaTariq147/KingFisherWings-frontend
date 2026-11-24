import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type TenantConfirmAction = 'delete' | 'deactivate' | 'restore' | 'permanent';

const ACTION_CONFIG: Record<
  TenantConfirmAction,
  { title: string; description: (name: string) => string; confirmLabel: string; variant: 'danger' | 'primary' }
> = {
  delete: {
    title: 'Delete tenant?',
    description: (name) =>
      `${name} will be soft-deleted. You can restore it later from the Deleted trash tab.`,
    confirmLabel: 'Delete tenant',
    variant: 'danger',
  },
  deactivate: {
    title: 'Deactivate tenant?',
    description: (name) =>
      `${name} will be deactivated. Users will be logged out and unable to sign in until reactivated.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  },
  restore: {
    title: 'Restore tenant?',
    description: (name) =>
      `${name} will be restored from trash and become available again.`,
    confirmLabel: 'Restore tenant',
    variant: 'primary',
  },
  permanent: {
    title: 'Permanently delete tenant?',
    description: (name) =>
      `${name} will be permanently deleted. This cannot be undone. If related ERP data still exists, the API returns 409.`,
    confirmLabel: 'Delete permanently',
    variant: 'danger',
  },
};

interface TenantConfirmModalProps {
  open: boolean;
  action: TenantConfirmAction;
  tenantName: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function TenantConfirmModal({
  open,
  action,
  tenantName,
  isPending,
  onConfirm,
  onClose,
}: TenantConfirmModalProps) {
  const config = ACTION_CONFIG[action];
  const label =
    typeof tenantName === 'string' && tenantName.trim() ? tenantName.trim() : 'This tenant';

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
          <Button
            variant={config.variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'Processing…' : config.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background:
              config.variant === 'danger' ? 'var(--color-danger-100)' : 'var(--color-primary-50)',
          }}
        >
          <AlertTriangle
            size={18}
            style={{
              color:
                config.variant === 'danger'
                  ? 'var(--color-danger-700)'
                  : 'var(--color-primary-600)',
            }}
            aria-hidden="true"
          />
        </div>
        <p className="text-sm text-[var(--color-neutral-600)] leading-relaxed">
          {config.description(label)}
        </p>
      </div>
    </Modal>
  );
}

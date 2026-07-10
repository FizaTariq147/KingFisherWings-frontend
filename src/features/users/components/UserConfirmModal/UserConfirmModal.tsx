import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type UserConfirmAction = 'delete' | 'deactivate' | 'activate' | 'restore';

const ACTION_CONFIG: Record<
  UserConfirmAction,
  {
    title: string;
    description: (name: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  delete: {
    title: 'Delete user?',
    description: (name) =>
      `${name} will be removed from this tenant. You can restore the account later if supported.`,
    confirmLabel: 'Delete user',
    variant: 'danger',
  },
  deactivate: {
    title: 'Deactivate user?',
    description: (name) =>
      `${name} will be set to inactive and will not be able to sign in until reactivated.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  },
  activate: {
    title: 'Activate user?',
    description: (name) => `${name} will be activated and allowed to sign in.`,
    confirmLabel: 'Activate',
    variant: 'primary',
  },
  restore: {
    title: 'Restore user?',
    description: (name) => `${name} will be restored and available again.`,
    confirmLabel: 'Restore user',
    variant: 'primary',
  },
};

interface UserConfirmModalProps {
  open: boolean;
  action: UserConfirmAction;
  userName: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function UserConfirmModal({
  open,
  action,
  userName,
  isPending,
  onConfirm,
  onClose,
}: UserConfirmModalProps) {
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
          {config.description(userName)}
        </p>
      </div>
    </Modal>
  );
}

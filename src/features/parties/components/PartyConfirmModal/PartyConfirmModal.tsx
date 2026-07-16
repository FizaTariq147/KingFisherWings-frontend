import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  CREDIT_STATUSES,
  CREDIT_STATUS_LABELS,
  type CreditStatus,
} from '../../constants/party.constants';
import { updateCreditStatusSchema } from '../../schemas/party.schema';

export type PartyConfirmAction =
  | 'delete'
  | 'deactivate'
  | 'activate'
  | 'credit_status';

const ACTION_CONFIG: Record<
  Exclude<PartyConfirmAction, 'credit_status'>,
  {
    title: string;
    description: (name: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  delete: {
    title: 'Delete party?',
    description: (name) => `${name} will be soft-deleted and hidden from active lists.`,
    confirmLabel: 'Delete party',
    variant: 'danger',
  },
  deactivate: {
    title: 'Deactivate party?',
    description: (name) => `${name} will be set inactive.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  },
  activate: {
    title: 'Activate party?',
    description: (name) => `${name} will be activated.`,
    confirmLabel: 'Activate',
    variant: 'primary',
  },
};

interface PartyConfirmModalProps {
  open: boolean;
  action: PartyConfirmAction;
  partyName: string;
  isPending?: boolean;
  onConfirm: (extra?: { credit_status?: CreditStatus; reason?: string }) => void;
  onClose: () => void;
}

export function PartyConfirmModal({
  open,
  action,
  partyName,
  isPending,
  onConfirm,
  onClose,
}: PartyConfirmModalProps) {
  const [creditStatus, setCreditStatus] = useState<CreditStatus>('ON_HOLD');
  const [reason, setReason] = useState('');
  const [creditError, setCreditError] = useState<string | null>(null);

  if (action === 'credit_status') {
    return (
      <Modal
        open={open}
        onClose={isPending ? () => {} : onClose}
        title="Change credit status"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const parsed = updateCreditStatusSchema.safeParse({
                  credit_status: creditStatus,
                  reason: reason.trim() || undefined,
                });
                if (!parsed.success) {
                  setCreditError(parsed.error.issues[0]?.message ?? 'Invalid credit status');
                  return;
                }
                setCreditError(null);
                onConfirm({
                  credit_status: parsed.data.credit_status,
                  reason: parsed.data.reason,
                });
              }}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Saving…' : 'Update status'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-neutral-600)]">
            Update credit status for <strong>{partyName}</strong>.
          </p>
          {creditError && (
            <p className="text-xs text-[var(--color-danger-700)]">{creditError}</p>
          )}
          <label className="block text-xs font-medium text-[var(--color-neutral-500)]">
            Credit status
            <select
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={creditStatus}
              onChange={(e) => {
                setCreditStatus(e.target.value as CreditStatus);
                setCreditError(null);
              }}
            >
              {CREDIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CREDIT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--color-neutral-500)]">
            Reason (optional)
            <input
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setCreditError(null);
              }}
              maxLength={255}
              placeholder="e.g. Overdue 90+ days"
            />
          </label>
        </div>
      </Modal>
    );
  }

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
            onClick={() => onConfirm()}
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
          />
        </div>
        <p className="text-sm text-[var(--color-neutral-600)]">{config.description(partyName)}</p>
      </div>
    </Modal>
  );
}

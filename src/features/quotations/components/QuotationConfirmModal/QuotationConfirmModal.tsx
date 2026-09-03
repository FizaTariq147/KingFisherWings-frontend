import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LOST_REASONS, type LostReason } from '../../constants/quotation.constants';
import type { QuotationConfirmKind } from '../../hooks/useQuotationConfirmState';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';
import type { Quotation } from '../../types/quotation.types';

const CONFIG: Record<
  Exclude<QuotationConfirmKind, 'mark-lost' | 'approve' | 'reject'>,
  {
    title: string;
    description: (label: string) => string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  }
> = {
  submit: {
    title: 'Submit quotation?',
    description: (label) => `${label} will move to Submitted for approval.`,
    confirmLabel: 'Submit',
    variant: 'primary',
  },
  send: {
    title: 'Send quotation?',
    description: (label) => `${label} will be marked as Sent to the customer.`,
    confirmLabel: 'Send',
    variant: 'primary',
  },
  'mark-won': {
    title: 'Mark as approved?',
    description: (label) =>
      `${label} will be marked customer-approved, then a job and draft customer invoice are created automatically.`,
    confirmLabel: 'Mark approved',
    variant: 'primary',
  },
  convert: {
    title: 'Convert to job?',
    description: (label) =>
      `${label} will create a job, copy revenue charges, and create a draft customer invoice.`,
    confirmLabel: 'Convert',
    variant: 'primary',
  },
  archive: {
    title: 'Archive quotation?',
    description: (label) => `${label} will be archived (soft-deleted).`,
    confirmLabel: 'Archive',
    variant: 'danger',
  },
  expire: {
    title: 'Expire quotation?',
    description: (label) => `${label} will be marked Expired.`,
    confirmLabel: 'Expire',
    variant: 'danger',
  },
  delete: {
    title: 'Delete quotation?',
    description: (label) => `${label} (DRAFT) will be soft-deleted.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  },
  duplicate: {
    title: 'Duplicate quotation?',
    description: (label) => `Create a new DRAFT revision from ${label}.`,
    confirmLabel: 'Duplicate',
    variant: 'primary',
  },
};

interface QuotationConfirmModalProps {
  open: boolean;
  kind: QuotationConfirmKind;
  quotation: Quotation;
  isPending?: boolean;
  onConfirm: (extra?: {
    comments?: string;
    reason?: LostReason;
    notes?: string;
  }) => void;
  onClose: () => void;
}

export function QuotationConfirmModal({
  open,
  kind,
  quotation,
  isPending,
  onConfirm,
  onClose,
}: QuotationConfirmModalProps) {
  const label = quotationDisplayNumber(quotation);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState<LostReason>('Competitor Rate');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  if (kind === 'mark-lost') {
    return (
      <Modal open={open} onClose={onClose} title="Mark quotation rejected">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-neutral-600)]">
            Record why {label} was rejected. Status becomes <strong>Rejected</strong> on staff and
            portal.
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Reason *</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value as LostReason)}
            >
              {LOST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Notes</span>
            <textarea
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isPending}
              onClick={() => onConfirm({ reason, notes: notes || undefined })}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Mark rejected
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (kind === 'approve' || kind === 'reject') {
    const isReject = kind === 'reject';
    return (
      <Modal open={open} onClose={onClose} title={isReject ? 'Reject quotation?' : 'Internally approve?'}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-neutral-600)]">
            {isReject
              ? `${label} will return to Rejected.`
              : `${label} will be internally approved so you can send it to the customer.`}
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Comments</span>
            <textarea
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={500}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={isReject ? 'danger' : 'primary'}
              disabled={isPending}
              onClick={() => onConfirm({ comments: comments || undefined })}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isReject ? 'Reject' : 'Internally approve'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const cfg = CONFIG[kind];
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
          <Button
            type="button"
            variant={cfg.variant}
            disabled={isPending}
            onClick={() => onConfirm()}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cfg.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

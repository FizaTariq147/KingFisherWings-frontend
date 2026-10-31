import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { PortalRequestDraftBlDto } from '../types/portalShipments.types';

export function PortalRequestDraftBlModal({
  open,
  pending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (dto: PortalRequestDraftBlDto) => Promise<void>;
}) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      setError('Comment is required for Docs / ops.');
      return;
    }
    setError(null);
    await onSubmit({ comment: trimmed });
  };

  return (
    <Modal
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Request draft BL"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={pending} onClick={() => void submit()}>
            {pending ? 'Submitting…' : 'Request draft BL'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
            Comment for Docs *
          </span>
          <textarea
            className="min-h-[96px] w-full rounded-sm border border-[var(--color-neutral-200)] px-2.5 py-2 text-[13px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            placeholder="Notes for staff drafting the BL…"
          />
        </label>
      </div>
    </Modal>
  );
}

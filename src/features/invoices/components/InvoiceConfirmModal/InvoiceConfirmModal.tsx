import { AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type InvoiceConfirmKind = 'draft-pdf' | 'cancel' | 'delete';

interface InvoiceConfirmModalProps {
  open: boolean;
  kind: InvoiceConfirmKind;
  invoiceLabel: string;
  isPending?: boolean;
  /** Shown for draft-pdf when the invoice can still be posted. */
  canPost?: boolean;
  onClose: () => void;
  /** Primary confirm (generate draft PDF / cancel / delete). */
  onConfirm: () => void;
  /** draft-pdf only: post first, then generate. */
  onPostThenGenerate?: () => void;
}

const COPY: Record<
  InvoiceConfirmKind,
  {
    title: string;
    confirmLabel: string;
    variant: 'primary' | 'danger';
  }
> = {
  'draft-pdf': {
    title: 'Generate PDF from draft?',
    confirmLabel: 'Generate preview',
    variant: 'primary',
  },
  cancel: {
    title: 'Cancel invoice?',
    confirmLabel: 'Cancel invoice',
    variant: 'danger',
  },
  delete: {
    title: 'Delete draft invoice?',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

export function InvoiceConfirmModal({
  open,
  kind,
  invoiceLabel,
  isPending,
  canPost = false,
  onClose,
  onConfirm,
  onPostThenGenerate,
}: InvoiceConfirmModalProps) {
  if (!open) return null;

  const cfg = COPY[kind];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cfg.title}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Close
          </Button>
          {kind === 'draft-pdf' && canPost && onPostThenGenerate ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={onPostThenGenerate}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Post, then generate
            </Button>
          ) : null}
          <Button
            type="button"
            variant={cfg.variant}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cfg.confirmLabel}
          </Button>
        </>
      }
    >
      {kind === 'draft-pdf' ? (
        <div className="space-y-3">
          <div className="flex gap-3 rounded-lg border border-[var(--color-warning-200,#FDE68A)] bg-[var(--color-warning-50,#FFFBEB)] px-3 py-2.5">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning-700,#B45309)]" />
            <div className="space-y-1 text-sm text-[var(--color-neutral-700)]">
              <p>
                <span className="font-medium text-[var(--color-neutral-900)]">
                  {invoiceLabel}
                </span>{' '}
                is still a <span className="font-medium">draft</span>.
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--color-neutral-600)]">
                You can generate a preview PDF now. Some systems only store the
                final customer PDF after the invoice is posted.
              </p>
            </div>
          </div>
          {canPost ? (
            <p className="text-[12px] text-[var(--color-neutral-500)]">
              Prefer the final copy? Use <span className="font-medium">Post, then generate</span>.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex gap-3 rounded-lg border border-[var(--color-warning-200,#FDE68A)] bg-[var(--color-warning-50,#FFFBEB)] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning-600,#D97706)]" />
          <p className="text-sm text-[var(--color-neutral-700)]">
            {kind === 'cancel'
              ? `${invoiceLabel} will be cancelled and can no longer be posted.`
              : `${invoiceLabel} will be soft-deleted. This cannot be undone from the list.`}
          </p>
        </div>
      )}
    </Modal>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { buildShareEmailBody } from './buildShareEmailBody';
import type { ShareEmailDto, ShareEmailFormValues } from './types';

interface ShareEmailModalProps {
  open: boolean;
  title: string;
  description?: string;
  isPending?: boolean;
  defaultTo?: string;
  defaultMessage?: string;
  /** When false, hide include_pdf toggle (still defaults to true in body if needed). */
  showIncludePdf?: boolean;
  onClose: () => void;
  onSend: (dto: ShareEmailDto) => void | Promise<void>;
}

export function ShareEmailModal({
  open,
  title,
  description,
  isPending,
  defaultTo = '',
  defaultMessage = 'Please find attached.',
  showIncludePdf = true,
  onClose,
  onSend,
}: ShareEmailModalProps) {
  const [toText, setToText] = useState(defaultTo);
  const [ccText, setCcText] = useState('');
  const [message, setMessage] = useState(defaultMessage);
  const [includePdf, setIncludePdf] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setToText(defaultTo);
    setCcText('');
    setMessage(defaultMessage);
    setIncludePdf(true);
    setLocalError(null);
  }, [open, defaultTo, defaultMessage]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setLocalError(null);
          const values: ShareEmailFormValues = {
            to_text: toText,
            cc_text: ccText,
            message,
            include_pdf: includePdf,
          };
          void (async () => {
            try {
              const dto = buildShareEmailBody(values);
              await onSend(dto);
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Could not send email.');
            }
          })();
        }}
      >
        {description ? (
          <p className="text-xs text-[var(--color-neutral-500)]">{description}</p>
        ) : (
          <p className="text-xs text-[var(--color-neutral-500)]">
            Leave To empty to use the party / portal / vendor / admin inboxes configured on the
            server.
          </p>
        )}

        {localError ? (
          <p role="alert" className="text-sm text-[var(--color-danger-600)]">
            {localError}
          </p>
        ) : null}

        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">
            To (optional — one per line)
          </span>
          <textarea
            className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={toText}
            onChange={(e) => setToText(e.target.value)}
            placeholder="customer@example.com"
            disabled={isPending}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">
            CC (optional)
          </span>
          <textarea
            className="min-h-[56px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={ccText}
            onChange={(e) => setCcText(e.target.value)}
            disabled={isPending}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">Message</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={message}
            maxLength={2000}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
        </label>

        {showIncludePdf ? (
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input
              type="checkbox"
              checked={includePdf}
              onChange={(e) => setIncludePdf(e.target.checked)}
              disabled={isPending}
            />
            Include PDF attachment
          </label>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Sending… (may take a few minutes)' : 'Send email'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

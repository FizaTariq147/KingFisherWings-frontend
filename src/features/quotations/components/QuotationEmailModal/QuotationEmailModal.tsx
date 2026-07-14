import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PDF_MODES, type PdfMode } from '../../constants/quotation.constants';
import type { SendQuotationEmailDto } from '../../types/quotation.types';

interface QuotationEmailModalProps {
  open: boolean;
  isPending?: boolean;
  defaultTo?: string;
  onClose: () => void;
  onSend: (dto: SendQuotationEmailDto) => void;
}

export function QuotationEmailModal({
  open,
  isPending,
  defaultTo = '',
  onClose,
  onSend,
}: QuotationEmailModalProps) {
  const [toEmail, setToEmail] = useState(defaultTo);
  const [ccEmail, setCcEmail] = useState('');
  const [pdfMode, setPdfMode] = useState<PdfMode>('CUSTOMER');
  const [message, setMessage] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Email quotation PDF">
      <div className="space-y-3">
        <Input
          label="To email *"
          type="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
        />
        <Input
          label="CC email"
          type="email"
          value={ccEmail}
          onChange={(e) => setCcEmail(e.target.value)}
        />
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">PDF mode</span>
          <select
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={pdfMode}
            onChange={(e) => setPdfMode(e.target.value as PdfMode)}
          >
            {PDF_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">Message</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || !toEmail.trim()}
            onClick={() =>
              onSend({
                to_email: toEmail.trim(),
                cc_email: ccEmail.trim() || undefined,
                pdf_mode: pdfMode,
                message: message.trim() || undefined,
              })
            }
          >
            {isPending ? 'Sending…' : 'Send email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

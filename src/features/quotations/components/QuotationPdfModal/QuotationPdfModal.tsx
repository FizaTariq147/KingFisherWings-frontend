import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PDF_MODES, type PdfMode } from '../../constants/quotation.constants';

interface QuotationPdfModalProps {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onGenerate: (mode: PdfMode, layout_variant?: string) => void;
  pdfInfo?: { customer_pdf_url?: string; internal_pdf_url?: string };
}

export function QuotationPdfModal({
  open,
  isPending,
  onClose,
  onGenerate,
  pdfInfo,
}: QuotationPdfModalProps) {
  const [mode, setMode] = useState<PdfMode>('CUSTOMER');
  const [layout, setLayout] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Quotation PDF">
      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">Mode</span>
          <select
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as PdfMode)}
          >
            {PDF_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">
            Layout variant
          </span>
          <input
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            maxLength={50}
          />
        </label>
        {(pdfInfo?.customer_pdf_url || pdfInfo?.internal_pdf_url) && (
          <div className="text-sm space-y-1">
            {pdfInfo.customer_pdf_url && (
              <a
                className="text-[var(--color-primary-600)] underline block"
                href={pdfInfo.customer_pdf_url}
                target="_blank"
                rel="noreferrer"
              >
                Customer PDF
              </a>
            )}
            {pdfInfo.internal_pdf_url && (
              <a
                className="text-[var(--color-primary-600)] underline block"
                href={pdfInfo.internal_pdf_url}
                target="_blank"
                rel="noreferrer"
              >
                Internal PDF
              </a>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => onGenerate(mode, layout || undefined)}
          >
            {isPending ? 'Queuing…' : 'Generate PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

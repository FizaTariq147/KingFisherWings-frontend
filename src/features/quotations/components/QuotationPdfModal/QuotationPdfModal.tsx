import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { PDF_MODES, type PdfMode } from '../../constants/quotation.constants';
import { useQuotationPdfStatus } from '../../hooks/useQuotationActions';
import type { QuotationPdfInfo } from '../../types/quotation.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface QuotationPdfModalProps {
  quotationId: string;
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onGenerate: (mode: PdfMode, layout_variant?: string) => Promise<QuotationPdfInfo | void>;
  pdfInfo?: QuotationPdfInfo;
  error?: string | null;
}

function pickReadyPdfUrl(info: QuotationPdfInfo | undefined, mode: PdfMode): string | undefined {
  if (!info) return undefined;
  if (mode === 'INTERNAL') {
    return info.internal_pdf_url || info.customer_pdf_url;
  }
  return info.customer_pdf_url || info.internal_pdf_url;
}

export function QuotationPdfModal({
  quotationId,
  open,
  isPending,
  onClose,
  onGenerate,
  pdfInfo,
  error,
}: QuotationPdfModalProps) {
  const [mode, setMode] = useState<PdfMode>('CUSTOMER');
  const [layout, setLayout] = useState('');
  const [poll, setPoll] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [latestInfo, setLatestInfo] = useState<QuotationPdfInfo | undefined>(pdfInfo);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const { data: statusData, refetch } = useQuotationPdfStatus(quotationId, open && poll);

  useEffect(() => {
    if (open) {
      setLatestInfo(pdfInfo);
      setReadyOpen(false);
      setReadyUrl(null);
    }
  }, [open, pdfInfo]);

  const statusRows = useMemo(() => {
    if (Array.isArray(statusData)) return statusData;
    if (statusData && typeof statusData === 'object') {
      const items = (statusData as { items?: unknown[] }).items;
      if (Array.isArray(items)) return items;
      return [statusData];
    }
    return [];
  }, [statusData]);

  useEffect(() => {
    if (!poll || !open) return;
    const t = window.setInterval(() => {
      void refetch();
    }, 3000);
    return () => window.clearInterval(t);
  }, [poll, open, refetch]);

  useEffect(() => {
    if (!open || !poll || readyOpen) return;
    const url = pickReadyPdfUrl(latestInfo, mode) || pickReadyPdfUrl(pdfInfo, mode);
    if (url) {
      setReadyUrl(url);
      setReadyOpen(true);
      setPoll(false);
    }
  }, [open, poll, readyOpen, latestInfo, pdfInfo, mode]);

  const customerUrl = latestInfo?.customer_pdf_url;
  const internalUrl = latestInfo?.internal_pdf_url;
  const displayError = localError || error;

  return (
    <>
      <Modal open={open} onClose={onClose} title="Quotation PDF">
        <div className="space-y-4">
          {displayError && (
            <div
              role="alert"
              className="rounded-md border px-3 py-2 text-sm"
              style={{
                background: 'var(--color-danger-100)',
                borderColor: '#FECACA',
                color: 'var(--color-danger-700)',
              }}
            >
              {displayError}
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Mode *</span>
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
              Layout variant (optional)
            </span>
            <input
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              maxLength={50}
              placeholder="Leave blank for default"
            />
          </label>

          {(customerUrl || internalUrl) && (
            <div className="text-sm space-y-1">
              <p className="text-xs font-medium text-[var(--color-neutral-500)]">Available PDFs</p>
              {customerUrl && (
                <StoredFileLink url={customerUrl} label="Open customer PDF" />
              )}
              {internalUrl && (
                <StoredFileLink url={internalUrl} label="Open internal PDF" />
              )}
            </div>
          )}

          {poll && !customerUrl && !internalUrl && !displayError && (
            <p className="text-xs text-[var(--color-neutral-500)]">
              Generation queued. A popup appears when the PDF is ready — check Generation status below.
            </p>
          )}

          {poll && (
            <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-2 text-xs space-y-1 max-h-32 overflow-auto">
              <p className="font-medium text-[var(--color-neutral-600)]">Generation status</p>
              {statusRows.length > 0 ? (
                statusRows.map((row, i) => (
                  <pre
                    key={i}
                    className="text-[11px] text-[var(--color-neutral-500)] whitespace-pre-wrap"
                  >
                    {typeof row === 'object' ? JSON.stringify(row) : String(row)}
                  </pre>
                ))
              ) : (
                <p className="text-[var(--color-neutral-400)]">Waiting for status…</p>
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
              onClick={async () => {
                setLocalError(null);
                setPoll(true);
                setReadyOpen(false);
                setReadyUrl(null);
                try {
                  const result = await onGenerate(mode, layout.trim() || undefined);
                  if (result) {
                    setLatestInfo(result);
                    const url = pickReadyPdfUrl(result, mode);
                    if (url) {
                      setReadyUrl(url);
                      setReadyOpen(true);
                      setPoll(false);
                    }
                  }
                } catch (err) {
                  setLocalError(getErrorMessage(err));
                }
              }}
            >
              {isPending ? 'Generating…' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </Modal>

      <PdfReadyModal
        open={readyOpen}
        onClose={() => setReadyOpen(false)}
        url={readyUrl}
        title="Quotation PDF ready"
        fileName={`quotation-${quotationId}.pdf`}
        description="Your quotation PDF was created successfully."
      />
    </>
  );
}

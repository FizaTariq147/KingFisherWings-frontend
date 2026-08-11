import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { PDF_MODES, type PdfMode } from '../../constants/quotation.constants';
import { useQuotationPdfStatus } from '../../hooks/useQuotationActions';
import type { QuotationPdfInfo } from '../../types/quotation.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { normalizeQuotationPdfInfo } from '../../utils/normalizeQuotationPdf';

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

function statusLabel(raw: unknown): string {
  const info = normalizeQuotationPdfInfo(raw);
  const status = String(info.status || '').trim();
  if (!status || status === 'NOT_FOUND') return 'Waiting for the generator…';
  return status.replaceAll('_', ' ');
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
  const wasOpen = useRef(false);
  const { data: statusData, refetch } = useQuotationPdfStatus(quotationId, open && poll);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setLatestInfo(pdfInfo);
      setReadyOpen(false);
      setReadyUrl(null);
      setLocalError(null);
      setPoll(false);
    }
    if (!open) {
      setPoll(false);
    }
    wasOpen.current = open;
  }, [open, pdfInfo]);

  useEffect(() => {
    if (!open || !pdfInfo) return;
    setLatestInfo((prev) => ({ ...prev, ...pdfInfo }));
  }, [open, pdfInfo]);

  useEffect(() => {
    if (!open || !poll || !statusData) return;
    const next = normalizeQuotationPdfInfo(statusData);
    setLatestInfo((prev) => ({ ...prev, ...next }));
  }, [open, poll, statusData]);

  useEffect(() => {
    if (!poll || !open) return;
    const t = window.setInterval(() => {
      void refetch();
    }, 3000);
    return () => window.clearInterval(t);
  }, [poll, open, refetch]);

  useEffect(() => {
    if (!open || !poll || readyOpen || !statusData) return;
    const fromStatus = normalizeQuotationPdfInfo(statusData);
    const url = pickReadyPdfUrl(fromStatus, mode);
    if (!url) return;
    setLatestInfo((prev) => ({ ...prev, ...fromStatus }));
    setReadyUrl(url);
    setReadyOpen(true);
    setPoll(false);
  }, [open, poll, readyOpen, statusData, mode]);

  const customerUrl = latestInfo?.customer_pdf_url;
  const internalUrl = latestInfo?.internal_pdf_url;
  const displayError = localError || error;
  const statusText = useMemo(() => statusLabel(statusData), [statusData]);

  const closeReady = () => {
    setReadyOpen(false);
    setReadyUrl(null);
    onClose();
  };

  return (
    <>
      <Modal open={open && !readyOpen} onClose={onClose} title="Quotation PDF">
        <div className="space-y-4">
          {displayError ? (
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
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Mode *</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as PdfMode)}
            >
              {PDF_MODES.map((m) => (
                <option key={m} value={m}>
                  {m === 'CUSTOMER' ? 'Customer' : 'Internal'}
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
            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium text-[var(--color-neutral-500)]">Available PDFs</p>
              {customerUrl ? <StoredFileLink url={customerUrl} label="Open customer PDF" /> : null}
              {internalUrl ? <StoredFileLink url={internalUrl} label="Open internal PDF" /> : null}
            </div>
          )}

          {poll && !displayError ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              Generation queued. A popup opens when the PDF is ready.
              {statusData ? ` Status: ${statusText}.` : ''}
            </p>
          ) : null}

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
                    setLatestInfo((prev) => ({ ...prev, ...result }));
                    const url = pickReadyPdfUrl(result, mode);
                    if (url) {
                      setReadyUrl(url);
                      setReadyOpen(true);
                      setPoll(false);
                    }
                  }
                } catch (err) {
                  setPoll(false);
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
        onClose={closeReady}
        url={readyUrl}
        title="Quotation PDF ready"
        fileName={`quotation-${quotationId}.pdf`}
        description="Your quotation PDF was created successfully."
      />
    </>
  );
}

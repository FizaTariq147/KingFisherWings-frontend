import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { quotationPdfBranding } from '@/features/files/utils/pdfBranding';
import { useAuthStore } from '@/store/authStore';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { PDF_MODES, type PdfMode } from '../../constants/quotation.constants';
import { useQuotationPdfStatus } from '../../hooks/useQuotationActions';
import type { Quotation, QuotationPdfInfo } from '../../types/quotation.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { generateQuotationPdf } from '../../utils/generateQuotationPdf';
import { normalizeQuotationPdfInfo } from '../../utils/normalizeQuotationPdf';

interface QuotationPdfModalProps {
  quotationId: string;
  quotationNumber: string;
  quotationDate?: string;
  /** Full quotation for FRESA-style client PDF layout. */
  quotation?: Quotation | null;
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
  quotationNumber,
  quotationDate,
  quotation,
  open,
  isPending,
  onClose,
  onGenerate,
  pdfInfo,
  error,
}: QuotationPdfModalProps) {
  const user = useAuthStore((s) => s.user);
  const { data: companies = [] } = useTenantCompanies(true);
  const [mode, setMode] = useState<PdfMode>('CUSTOMER');
  const [layout, setLayout] = useState('');
  const [poll, setPoll] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [latestInfo, setLatestInfo] = useState<QuotationPdfInfo | undefined>(pdfInfo);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const [clientPending, setClientPending] = useState(false);
  const wasOpen = useRef(false);
  const { data: statusData, refetch } = useQuotationPdfStatus(quotationId, open && poll);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setLatestInfo(pdfInfo);
      setReadyOpen(false);
      setReadyUrl(null);
      setReadyBlob(null);
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

  // Only open ready modal from server URL if we did not already open a client-formatted blob.
  useEffect(() => {
    if (!open || !poll || readyOpen || readyBlob || !statusData) return;
    const fromStatus = normalizeQuotationPdfInfo(statusData);
    const url = pickReadyPdfUrl(fromStatus, mode);
    if (!url) return;
    setLatestInfo((prev) => ({ ...prev, ...fromStatus }));
    setReadyUrl(url);
    setReadyOpen(true);
    setPoll(false);
  }, [open, poll, readyOpen, readyBlob, statusData, mode]);

  const customerUrl = latestInfo?.customer_pdf_url;
  const internalUrl = latestInfo?.internal_pdf_url;
  const displayError = localError || error;
  const statusText = useMemo(() => statusLabel(statusData), [statusData]);
  const pdfFileName = formatPdfFilename(quotationNumber, 'quotation');
  const pdfBranding = quotationPdfBranding(quotationNumber, quotationDate);
  const busy = Boolean(isPending || clientPending);

  const companyForPdf = useMemo(() => {
    const match =
      companies.find((c) => c.id && quotation?.company_id && c.id === quotation.company_id) ||
      companies[0];
    return {
      name: match?.name || 'KingFisher Wings',
      addressLines: [] as string[],
    };
  }, [companies, quotation?.company_id]);

  const closeReady = () => {
    setReadyOpen(false);
    setReadyUrl(null);
    setReadyBlob(null);
    onClose();
  };

  const buildClientPdf = async (): Promise<Blob | null> => {
    if (!quotation) return null;
    return generateQuotationPdf({
      quotation,
      company: companyForPdf,
      generatedBy: user?.email || user?.name || undefined,
      confirmNote: mode === 'CUSTOMER' ? 'Please confirm the quote.' : undefined,
    });
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
              <p className="text-xs font-medium text-[var(--color-neutral-500)]">Stored PDFs</p>
              {customerUrl ? (
                <StoredFileLink
                  url={customerUrl}
                  label="Open stored customer PDF"
                  displayName={pdfFileName}
                  branding={pdfBranding}
                />
              ) : null}
              {internalUrl ? (
                <StoredFileLink
                  url={internalUrl}
                  label="Open stored internal PDF"
                  displayName={pdfFileName}
                  branding={pdfBranding}
                />
              ) : null}
            </div>
          )}

          {poll && !displayError && !readyBlob ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              Server PDF queued in background.
              {statusData ? ` Status: ${statusText}.` : ''}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={async () => {
                setLocalError(null);
                setReadyOpen(false);
                setReadyUrl(null);
                setReadyBlob(null);
                setClientPending(true);
                try {
                  // Prefer FRESA-style client layout for preview/download.
                  const blob = await buildClientPdf();
                  if (blob) {
                    setReadyBlob(blob);
                    setReadyOpen(true);
                  }

                  // Keep server generate for stored/email PDFs (unchanged API).
                  setPoll(true);
                  try {
                    const result = await onGenerate(mode, layout.trim() || undefined);
                    if (result) {
                      setLatestInfo((prev) => ({ ...prev, ...result }));
                      if (!blob) {
                        const url = pickReadyPdfUrl(result, mode);
                        if (url) {
                          setReadyUrl(url);
                          setReadyOpen(true);
                          setPoll(false);
                        }
                      }
                    }
                  } catch (err) {
                    // Client PDF already shown — don't block UI on server failure.
                    if (!blob) {
                      setPoll(false);
                      setLocalError(getErrorMessage(err));
                    } else {
                      setPoll(false);
                    }
                  }
                } catch (err) {
                  setPoll(false);
                  setLocalError(getErrorMessage(err));
                } finally {
                  setClientPending(false);
                }
              }}
            >
              {busy ? 'Generating…' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </Modal>

      <PdfReadyModal
        open={readyOpen}
        onClose={closeReady}
        url={readyBlob ? null : readyUrl}
        blob={readyBlob}
        title="Quotation PDF ready"
        fileName={pdfFileName}
        branding={readyBlob ? undefined : pdfBranding}
        skipBranding={Boolean(readyBlob)}
        description="Your quotation PDF was created successfully."
      />
    </>
  );
}

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

/** Shared layout id for staff store + portal render. */
export const QUOTATION_KFW_LAYOUT = 'KFW_STANDARD';

interface QuotationPdfModalProps {
  quotationId: string;
  quotationNumber: string;
  quotationDate?: string;
  /** Full quotation for dynamic KingFisher PDF (required for matching portal UI). */
  quotation?: Quotation | null;
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  /**
   * Persist the generated KingFisher PDF (upload when supported, else queue store).
   * Receives the client blob so admin + portal share the same document.
   */
  onGenerate: (
    mode: PdfMode,
    opts: { layout_variant: string; blob: Blob; fileName: string },
  ) => Promise<QuotationPdfInfo | void>;
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
      name: match?.name || 'KingFisher Wings Group',
      tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
      phone: '+971 55 5355 286',
      email: 'info@kingfisherwingsgroup.com',
      website: 'www.kingfisherwingsgroup.com',
      addressLines: [] as string[],
    };
  }, [companies, quotation?.company_id]);

  const closeReady = () => {
    setReadyOpen(false);
    setReadyUrl(null);
    setReadyBlob(null);
    onClose();
  };

  const buildClientPdf = async (): Promise<Blob> => {
    if (!quotation) {
      throw new Error('Quotation data is required to generate the KingFisher PDF.');
    }
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

          <p className="text-xs text-[var(--color-neutral-500)]">
            Generates the KingFisher quotation layout from live quote data, stores it for the
            customer portal, and opens the same PDF here.
          </p>

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
              Storing PDF…
              {statusData ? ` Status: ${statusText}.` : ''}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              disabled={busy || !quotation}
              onClick={async () => {
                setLocalError(null);
                setReadyOpen(false);
                setReadyUrl(null);
                setReadyBlob(null);
                setClientPending(true);
                try {
                  const blob = await buildClientPdf();
                  setReadyBlob(blob);
                  setReadyOpen(true);
                  setPoll(true);
                  try {
                    const result = await onGenerate(mode, {
                      layout_variant: QUOTATION_KFW_LAYOUT,
                      blob,
                      fileName: pdfFileName,
                    });
                    if (result) {
                      setLatestInfo((prev) => ({ ...prev, ...result }));
                    }
                  } catch (err) {
                    // Client PDF already shown — storage failure is non-blocking for preview.
                    setPoll(false);
                    setLocalError(
                      `${getErrorMessage(err)} (Preview is ready; storage may still be pending.)`,
                    );
                  }
                } catch (err) {
                  setPoll(false);
                  setLocalError(getErrorMessage(err));
                } finally {
                  setClientPending(false);
                }
              }}
            >
              {busy ? 'Generating…' : 'Generate & store PDF'}
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
        description="Same KingFisher layout is stored for the customer portal."
      />
    </>
  );
}

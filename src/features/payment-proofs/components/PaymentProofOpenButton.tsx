import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { isUuid } from '@/lib/isUuid';
import type { PaymentProof } from '../types/paymentProof.types';
import {
  downloadPaymentProofFile,
  fetchPaymentProofBlob,
  openBlankPreviewTab,
  type PaymentProofViewer,
} from '../utils/openPaymentProofFile';
import { openBlobInNewTab } from '@/features/files/utils/triggerBlobDownload';

type PaymentProofOpenButtonProps = {
  proof: PaymentProof;
  viewer: PaymentProofViewer;
  size?: 'sm' | 'md';
  /** Portal scoped file path needs the invoice id. */
  invoiceId?: string;
  /** Show an explicit Download control next to Open (purchase-invoice / staff review). */
  showDownload?: boolean;
};

/**
 * Opens payment proof inline (PDF modal / image modal) so browsers do not block pop-ups.
 * Prefers GET /payment-proofs/{id}/file so absolute storage URLs are not required.
 */
export function PaymentProofOpenButton({
  proof,
  viewer,
  size = 'sm',
  invoiceId,
  showDownload = false,
}: PaymentProofOpenButtonProps) {
  const pdfViewer = usePdfViewer();
  const [pending, setPending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState('Payment proof');

  const url = proof.fileUrl?.trim() || '';
  const proofId = proof.id?.trim() || '';
  const canOpen = Boolean(url) || isUuid(proofId);
  const displayName = proof.fileName || 'payment-proof';
  const fetchOpts = {
    proofId: isUuid(proofId) ? proofId : undefined,
    invoiceId: invoiceId && isUuid(invoiceId) ? invoiceId : proof.invoiceId,
  };

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  if (!canOpen) {
    return (
      <span className="text-[10px] text-[var(--color-neutral-400)]" title="No file URL from API">
        No file
      </span>
    );
  }

  const closeImage = () => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const open = async () => {
    setError(null);
    setPending(true);
    try {
      const blob = await fetchPaymentProofBlob(url, viewer, fetchOpts);
      const isPdf = await blobLooksLikePdf(blob);
      const isImage =
        blob.type.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif)$/i.test(displayName);

      if (isPdf) {
        pdfViewer.showBlob(blob, {
          fileName: displayName.toLowerCase().endsWith('.pdf')
            ? displayName
            : `${displayName}.pdf`,
          title: 'Payment proof',
        });
        return;
      }

      if (isImage) {
        const src = URL.createObjectURL(blob);
        setImageTitle(displayName);
        setImageSrc(src);
        return;
      }

      let preview: Window | null = null;
      try {
        preview = openBlankPreviewTab();
        await openBlobInNewTab(blob, preview, { filename: displayName });
      } catch {
        preview?.close();
        await downloadPaymentProofFile(url, viewer, displayName, fetchOpts);
      }
    } catch (err) {
      try {
        await downloadPaymentProofFile(url, viewer, displayName, fetchOpts);
        setError(null);
      } catch {
        setError(err instanceof Error ? err.message : 'Could not open file.');
      }
    } finally {
      setPending(false);
    }
  };

  const download = async () => {
    setError(null);
    setDownloading(true);
    try {
      await downloadPaymentProofFile(url, viewer, displayName, fetchOpts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <span className="inline-flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          size={size}
          variant="secondary"
          disabled={pending || pdfViewer.loading || downloading}
          onClick={() => void open()}
        >
          {pending || pdfViewer.loading ? 'Opening…' : 'Open'}
        </Button>
        {showDownload ? (
          <Button
            type="button"
            size={size}
            variant="secondary"
            disabled={pending || downloading || pdfViewer.loading}
            onClick={() => void download()}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </Button>
        ) : null}
      </span>
      {error ? (
        <span className="max-w-[14rem] text-right text-[10px] text-[var(--color-danger-600)]">
          {error}
        </span>
      ) : null}

      <PdfViewerModal
        open={pdfViewer.open}
        onClose={pdfViewer.close}
        src={pdfViewer.src}
        blob={pdfViewer.blob}
        fileName={pdfViewer.fileName}
        title={pdfViewer.title}
        loading={pdfViewer.loading}
        error={pdfViewer.error}
        skipBranding
      />

      <Modal open={Boolean(imageSrc)} onClose={closeImage} title={imageTitle}>
        {imageSrc ? (
          <div className="space-y-3">
            <img
              src={imageSrc}
              alt={imageTitle}
              className="max-h-[70vh] w-full object-contain"
            />
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="secondary" onClick={closeImage}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </span>
  );
}

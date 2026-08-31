import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { openPdfBlobInNewTab, type PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';

export interface PdfViewerModalProps {
  open: boolean;
  onClose: () => void;
  /** Blob URL for inline iframe preview. */
  src?: string | null;
  title?: string;
  fileName?: string;
  loading?: boolean;
  error?: string | null;
  /** Original blob — used for download / new-tab when preview src is a blob URL. */
  blob?: Blob | null;
  branding?: PdfBrandingOptions;
}

export function PdfViewerModal({
  open,
  onClose,
  src,
  title = 'PDF preview',
  fileName = 'document.pdf',
  loading = false,
  error = null,
  blob,
  branding,
}: PdfViewerModalProps) {
  const blobOptions = { filename: fileName, branding };

  const handleDownload = () => {
    if (!blob) return;
    void triggerBrandedPdfDownload(blob, fileName, blobOptions).catch(() => undefined);
  };

  const handleOpenInNewTab = () => {
    if (blob) {
      try {
        openPdfBlobInNewTab(blob, undefined, fileName);
        return;
      } catch {
        /* fall through to blob URL */
      }
    }
    if (src) {
      window.open(src, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl" layer="nested">
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-[var(--color-neutral-500)] py-8 text-center">Loading PDF…</p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger-600)]">
            {error}
          </p>
        ) : null}

        {!loading && !error && src ? (
          <iframe
            src={src}
            title={fileName}
            className="w-full rounded-md border border-[var(--color-neutral-200)] bg-white"
            style={{ height: 'min(75vh, 900px)' }}
          />
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {blob ? (
            <Button type="button" variant="secondary" disabled={loading} onClick={handleDownload}>
              <Download size={16} aria-hidden="true" />
              Download
            </Button>
          ) : null}
          {src ? (
            <Button type="button" disabled={loading} onClick={handleOpenInNewTab}>
              <ExternalLink size={16} aria-hidden="true" />
              Open in new tab
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

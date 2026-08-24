import { Download, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
import { isPdfUrl, openBrandedPdfUrl, type PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';
import {
  openBlobInNewTab,
  triggerBrandedPdfDownload,
} from '@/features/files/utils/triggerBlobDownload';
import { openSafeHttpUrl } from '@/lib/safeHttpUrl';

export interface PdfReadyModalProps {
  open: boolean;
  onClose: () => void;
  /** Absolute or `/files/...` / `/backend/...` PDF URL. */
  url?: string | null;
  /** Prefer in-memory PDF bytes when the stored file URL is missing or stale. */
  blob?: Blob | null;
  title?: string;
  fileName?: string;
  description?: string;
  branding?: PdfBrandingOptions;
}

/**
 * Shown after PDF generation succeeds — Download + Open in new tab.
 */
export function PdfReadyModal({
  open,
  onClose,
  url,
  blob,
  title = 'PDF ready',
  fileName = 'document.pdf',
  description = 'Your PDF was created successfully.',
  branding,
}: PdfReadyModalProps) {
  const { openStoredFile, downloadStoredFile, isPending, error, clearError } = useFileDownload();
  const ready = Boolean(blob || url);
  const brandingOptions = {
    ...branding,
    title: branding?.title || fileName,
    documentNumber: branding?.documentNumber || stripPdfExtension(fileName),
  };
  const blobOptions = { filename: fileName, branding: brandingOptions };
  const storedFileOptions = { displayName: fileName, branding: brandingOptions };

  useEffect(() => {
    if (open) clearError();
  }, [open, clearError]);

  const handleOpen = () => {
    if (blob) {
      void openBlobInNewTab(blob, undefined, blobOptions).catch(() => undefined);
      return;
    }
    if (!url) return;
    if (url.startsWith('blob:')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (isStoredFileUrl(url)) {
      void openStoredFile(url, storedFileOptions).catch(() => undefined);
      return;
    }
    if (isPdfUrl(url, fileName)) {
      try {
        void openBrandedPdfUrl(url, brandingOptions);
      } catch {
        openSafeHttpUrl(url);
      }
      return;
    }
    openSafeHttpUrl(url);
  };

  const handleDownload = () => {
    if (blob) {
      void triggerBrandedPdfDownload(blob, fileName, blobOptions).catch(() => undefined);
      return;
    }
    if (!url) return;
    if (url.startsWith('blob:')) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }
    if (isStoredFileUrl(url)) {
      void downloadStoredFile(url, storedFileOptions).catch(() => undefined);
      return;
    }
    if (isPdfUrl(url, fileName)) {
      void downloadStoredFile(url, storedFileOptions).catch(() => undefined);
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener noreferrer';
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <Modal open={open} onClose={onClose} title={ready ? title : 'Generating PDF'} size="sm" layer="nested">
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-neutral-600)]">
          {ready ? description : 'Please wait while the PDF is generated…'}
        </p>

        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger-600)]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!ready || isPending}
            onClick={handleDownload}
          >
            <Download size={16} aria-hidden="true" />
            {isPending ? 'Working…' : 'Download'}
          </Button>
          <Button type="button" disabled={!ready || isPending} onClick={handleOpen}>
            <ExternalLink size={16} aria-hidden="true" />
            Open in new tab
          </Button>
        </div>
      </div>
    </Modal>
  );
}

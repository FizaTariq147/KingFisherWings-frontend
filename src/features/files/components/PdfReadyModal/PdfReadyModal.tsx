import { Download, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { filesService } from '@/features/files/services/files.service';
import { isPdfUrl, type PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';
import { triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';

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
 * Shown after PDF generation succeeds — Download + Preview (inline, no pop-ups).
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
  const { downloadStoredFile, isPending, error, clearError } = useFileDownload();
  const viewer = usePdfViewer();
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

  const handlePreview = () => {
    if (blob) {
      viewer.showBlob(blob, { fileName, title, branding: brandingOptions });
      return;
    }
    if (!url) return;
    if (url.startsWith('blob:')) {
      viewer.showSrc(url, { fileName, title, branding: brandingOptions });
      return;
    }
    void viewer.loadPreview(
      () => filesService.fetchStoredPdfBlob(url, storedFileOptions),
      { fileName, title, branding: brandingOptions },
    );
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
    if (isStoredFileUrl(url) || isPdfUrl(url, fileName)) {
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
    <>
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
            <Button type="button" disabled={!ready || isPending} onClick={handlePreview}>
              <ExternalLink size={16} aria-hidden="true" />
              Preview PDF
            </Button>
          </div>
        </div>
      </Modal>

      <PdfViewerModal
        open={viewer.open}
        onClose={viewer.close}
        src={viewer.src}
        blob={viewer.blob}
        fileName={viewer.fileName}
        title={viewer.title}
        loading={viewer.loading}
        error={viewer.error}
        branding={viewer.branding}
      />
    </>
  );
}

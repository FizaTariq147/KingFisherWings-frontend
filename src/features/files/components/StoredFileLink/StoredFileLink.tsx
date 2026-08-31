import { PdfViewerModal } from '../PdfViewerModal';
import { useFileDownload } from '../../hooks/useFileDownload';
import { usePdfViewer } from '../../hooks/usePdfViewer';
import { filesService } from '../../services/files.service';
import { isPdfUrl, type PdfBrandingOptions } from '../../utils/pdfBranding';
import { isStoredFileUrl } from '../../utils/parseFilesApiUrl';
import { stripPdfExtension } from '../../utils/pdfFilename';
import { isSafeHttpUrl, openSafeHttpUrl } from '@/lib/safeHttpUrl';

interface StoredFileLinkProps {
  url: string;
  label: string;
  displayName?: string;
  branding?: PdfBrandingOptions;
  className?: string;
}

/**
 * Opens or downloads a stored file. `/files/{tenantId}/{filename}` paths use
 * authenticated GET (Bearer JWT). PDFs preview inline in a modal (no pop-ups).
 */
export function StoredFileLink({
  url,
  label,
  displayName,
  branding,
  className = 'text-[var(--color-primary-600)] underline block text-left',
}: StoredFileLinkProps) {
  const { isPending, error } = useFileDownload();
  const viewer = usePdfViewer();

  if (!url) return null;

  const fileOptions = {
    displayName,
    branding: {
      ...branding,
      title: branding?.title || displayName || label,
      documentNumber: branding?.documentNumber || stripPdfExtension(displayName || label),
    },
  };

  const previewPdf = () => {
    const fileName = fileOptions.branding.documentNumber
      ? `${stripPdfExtension(fileOptions.branding.documentNumber)}.pdf`
      : displayName || 'document.pdf';

    void viewer.loadPreview(
      () => filesService.fetchStoredPdfBlob(url, fileOptions),
      {
        fileName,
        title: label,
        branding: fileOptions.branding,
      },
    );
  };

  if (!isStoredFileUrl(url)) {
    if (!isSafeHttpUrl(url)) return null;
    if (isPdfUrl(url, displayName)) {
      return (
        <>
          <span className="block">
            <button
              type="button"
              className={className}
              disabled={viewer.loading}
              onClick={previewPdf}
            >
              {viewer.loading ? 'Opening…' : label}
            </button>
          </span>
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

    return (
      <a className={className} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <>
      <span className="block">
        <button
          type="button"
          className={className}
          disabled={isPending || viewer.loading}
          onClick={previewPdf}
        >
          {isPending || viewer.loading ? 'Opening…' : label}
        </button>
        {error && (
          <span className="block text-xs text-[var(--color-danger-600)] mt-0.5">{error}</span>
        )}
      </span>
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

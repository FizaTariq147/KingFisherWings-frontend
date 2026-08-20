import { useFileDownload } from '../../hooks/useFileDownload';
import { isPdfUrl, openBrandedPdfUrl, type PdfBrandingOptions } from '../../utils/pdfBranding';
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
 * authenticated GET (Bearer JWT); external URLs open directly.
 */
export function StoredFileLink({
  url,
  label,
  displayName,
  branding,
  className = 'text-[var(--color-primary-600)] underline block text-left',
}: StoredFileLinkProps) {
  const { openStoredFile, isPending, error } = useFileDownload();

  if (!url) return null;

  const fileOptions = {
    displayName,
    branding: {
      ...branding,
      title: branding?.title || displayName || label,
      documentNumber: branding?.documentNumber || stripPdfExtension(displayName || label),
    },
  };

  if (!isStoredFileUrl(url)) {
    if (!isSafeHttpUrl(url)) return null;
    if (isPdfUrl(url, displayName)) {
      return (
        <span className="block">
          <button
            type="button"
            className={className}
            onClick={() => {
              try {
                void openBrandedPdfUrl(url, fileOptions.branding);
              } catch {
                openSafeHttpUrl(url);
              }
            }}
          >
            {label}
          </button>
        </span>
      );
    }

    return (
      <a className={className} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <span className="block">
      <button
        type="button"
        className={className}
        disabled={isPending}
        onClick={() => void openStoredFile(url, fileOptions)}
      >
        {isPending ? 'Opening…' : label}
      </button>
      {error && (
        <span className="block text-xs text-[var(--color-danger-600)] mt-0.5">{error}</span>
      )}
    </span>
  );
}

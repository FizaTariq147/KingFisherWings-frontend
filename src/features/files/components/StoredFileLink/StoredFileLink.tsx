import { useFileDownload } from '../../hooks/useFileDownload';
import { isStoredFileUrl } from '../../utils/parseFilesApiUrl';

interface StoredFileLinkProps {
  url: string;
  label: string;
  displayName?: string;
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
  className = 'text-[var(--color-primary-600)] underline block text-left',
}: StoredFileLinkProps) {
  const { openStoredFile, isPending, error } = useFileDownload();

  if (!url) return null;

  if (!isStoredFileUrl(url)) {
    return (
      <a className={className} href={url} target="_blank" rel="noreferrer">
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
        onClick={() => void openStoredFile(url, displayName)}
      >
        {isPending ? 'Opening…' : label}
      </button>
      {error && (
        <span className="block text-xs text-[var(--color-danger-600)] mt-0.5">{error}</span>
      )}
    </span>
  );
}

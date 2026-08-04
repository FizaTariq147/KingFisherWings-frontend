import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';

export interface PdfReadyModalProps {
  open: boolean;
  onClose: () => void;
  /** Absolute or `/files/...` / `/backend/...` PDF URL. */
  url: string | null | undefined;
  title?: string;
  fileName?: string;
  description?: string;
}

/**
 * Shown after PDF generation succeeds — Download + Open in new tab.
 */
export function PdfReadyModal({
  open,
  onClose,
  url,
  title = 'PDF ready',
  fileName = 'document.pdf',
  description = 'Your PDF was created successfully.',
}: PdfReadyModalProps) {
  const { openStoredFile, downloadStoredFile, isPending, error } = useFileDownload();

  if (!open || !url) return null;

  const handleOpen = () => {
    if (isStoredFileUrl(url)) {
      void openStoredFile(url, fileName);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    if (isStoredFileUrl(url)) {
      void downloadStoredFile(url, fileName);
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
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-neutral-600)]">{description}</p>

        {error && (
          <p role="alert" className="text-sm text-[var(--color-danger-600)]">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={handleDownload}
          >
            <Download size={16} aria-hidden="true" />
            {isPending ? 'Working…' : 'Download'}
          </Button>
          <Button type="button" disabled={isPending} onClick={handleOpen}>
            <ExternalLink size={16} aria-hidden="true" />
            Open in new tab
          </Button>
        </div>
      </div>
    </Modal>
  );
}

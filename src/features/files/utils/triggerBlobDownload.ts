import { isPdfBlob, openPdfBlobInNewTab, resolvePdfBranding, type PdfBrandingOptions } from './pdfBranding';
import { ensureBrandedPdfBlob } from './stampPdfBranding';
import { resolvePdfDownloadFilename } from './pdfFilename';

export type BlobOpenOptions = {
  filename?: string;
  branding?: PdfBrandingOptions;
};

/** Save a Blob in the browser with a suggested filename. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

/** Download PDF with quote-no filename; header/footer overlay preserves body alignment. */
export async function triggerBrandedPdfDownload(
  blob: Blob,
  filename: string,
  options?: BlobOpenOptions,
): Promise<void> {
  const downloadName = resolvePdfDownloadFilename(filename, {
    documentNumber: options?.branding?.documentNumber,
    title: options?.branding?.title || options?.filename,
  });
  const branding = resolvePdfBranding(options?.branding);
  const output = isPdfBlob(blob, filename)
    ? await ensureBrandedPdfBlob(blob, branding)
    : blob;
  triggerBlobDownload(output, downloadName);
}

export function openBlankPreviewTab(_options?: BlobOpenOptions): Window {
  const opened = window.open('about:blank', '_blank', 'noopener,noreferrer');
  if (!opened) {
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  try {
    opened.document.title = 'Loading…';
    opened.document.body.replaceChildren();
    const paragraph = opened.document.createElement('p');
    paragraph.style.cssText = 'font-family:system-ui,sans-serif;padding:1.5rem;color:#555';
    paragraph.textContent = 'Loading preview…';
    opened.document.body.append(paragraph);
  } catch {
    /* ignore */
  }
  return opened;
}

/** Open PDF in a new tab with header/footer overlay (content position unchanged). */
export async function openBlobInNewTab(
  blob: Blob,
  targetWindow?: Window | null,
  options?: BlobOpenOptions,
): Promise<void> {
  const filename = options?.filename;
  if (isPdfBlob(blob, filename)) {
    const branding = resolvePdfBranding(options?.branding);
    const blobToOpen = await ensureBrandedPdfBlob(blob, branding);
    openPdfBlobInNewTab(blobToOpen, targetWindow, filename);
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  if (targetWindow && !targetWindow.closed) {
    try {
      targetWindow.location.replace(objectUrl);
    } catch {
      targetWindow.location.href = objectUrl;
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
    return;
  }

  const opened = window.open(objectUrl, '_blank');
  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
}

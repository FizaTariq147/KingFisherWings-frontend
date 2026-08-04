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

/**
 * Open a blank tab synchronously (must run in the click handler) so the
 * browser does not treat a later navigation as a blocked pop-up.
 */
export function openBlankPreviewTab(): Window {
  const opened = window.open('about:blank', '_blank');
  if (!opened) {
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  try {
    opened.document.title = 'Loading…';
    opened.document.body.innerHTML =
      '<p style="font-family:system-ui,sans-serif;padding:1.5rem;color:#555">Loading preview…</p>';
  } catch {
    /* ignore — some browsers restrict about:blank writes */
  }
  return opened;
}

/**
 * Open a Blob in a new tab (useful for PDF preview).
 * Pass `targetWindow` from {@link openBlankPreviewTab} when the blob is
 * fetched asynchronously after a user click.
 */
export function openBlobInNewTab(blob: Blob, targetWindow?: Window | null): void {
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

  // Synchronous path only — after await, this is usually blocked by the browser.
  const opened = window.open(objectUrl, '_blank');
  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
}

import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/lib/axios';
import { portalApiClient } from '@/lib/portalApiClient';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { filesService } from '@/features/files/services/files.service';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { openPdfBlobInNewTab } from '@/features/files/utils/pdfBranding';
import {
  openBlankPreviewTab,
  openBlobInNewTab,
  triggerBlobDownload,
} from '@/features/files/utils/triggerBlobDownload';
import { isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';

export type PaymentProofViewer = 'staff' | 'portal' | 'vendor';

/** Normalize API file paths for axios clients whose baseURL is `/backend` or absolute API. */
export function paymentProofApiRequestPath(url: string): string {
  let u = url.trim();
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) {
    if (!isSafeHttpUrl(u) || !isApiOriginUrl(u)) {
      throw new Error('Blocked an unsafe payment proof URL.');
    }
    try {
      const parsed = new URL(u);
      u = `${parsed.pathname}${parsed.search}`;
    } catch {
      throw new Error('Invalid payment proof URL.');
    }
  }
  if (u.startsWith('/backend/')) u = u.slice('/backend'.length) || '/';
  if (!u.startsWith('/')) u = `/${u}`;
  return u;
}

function clientFor(viewer: PaymentProofViewer): AxiosInstance {
  if (viewer === 'portal') return portalApiClient;
  if (viewer === 'vendor') return vendorApiClient;
  return axiosInstance;
}

export async function fetchPaymentProofBlob(
  url: string,
  viewer: PaymentProofViewer,
): Promise<Blob> {
  const parsed = parseFilesApiUrl(url);
  if (viewer === 'staff' && parsed) {
    return filesService.downloadBlob({
      tenantId: parsed.tenantId,
      filename: parsed.filename,
    });
  }

  // Portal/vendor: also try staff-style /files/ path via their Bearer client.
  const path = paymentProofApiRequestPath(url);
  const client = clientFor(viewer);
  const res = await client.get<Blob>(path, { responseType: 'blob' });
  const blob = res.data;

  const contentType = (blob.type || '').toLowerCase();
  if (
    contentType.includes('json') ||
    contentType.includes('text') ||
    (blob.size < 2048 && contentType === '')
  ) {
    const text = await blob.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const json = JSON.parse(trimmed) as { message?: unknown; error?: unknown };
        const message = json.message ?? json.error;
        const msg =
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.map(String).join('; ')
              : 'Could not open payment proof file.';
        throw new Error(msg);
      } catch (err) {
        if (err instanceof SyntaxError) {
          throw new Error('Could not open payment proof file.');
        }
        throw err;
      }
    }
    // Not JSON — treat original bytes as the file (some servers omit Content-Type).
    return new Blob([text], { type: contentType || 'application/octet-stream' });
  }
  return blob;
}

/**
 * Open a payment proof in a new tab.
 * Pass `previewWindow` from a sync `openBlankPreviewTab()` on click to avoid popup blockers.
 */
export async function openPaymentProofFile(
  url: string,
  viewer: PaymentProofViewer,
  displayName?: string,
  previewWindow?: Window | null,
): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) throw new Error('No file URL on this payment proof.');

  const blob = await fetchPaymentProofBlob(trimmed, viewer);
  const name = displayName?.trim() || 'payment-proof';

  if (await blobLooksLikePdf(blob)) {
    openPdfBlobInNewTab(
      blob,
      previewWindow ?? undefined,
      name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`,
    );
    return;
  }

  await openBlobInNewTab(blob, previewWindow ?? null, { filename: name });
}

/** Fallback when preview tabs are blocked: download the file instead. */
export async function downloadPaymentProofFile(
  url: string,
  viewer: PaymentProofViewer,
  displayName?: string,
): Promise<void> {
  const blob = await fetchPaymentProofBlob(url.trim(), viewer);
  const name = displayName?.trim() || 'payment-proof';
  const filename =
    (await blobLooksLikePdf(blob)) && !name.toLowerCase().endsWith('.pdf')
      ? `${name}.pdf`
      : name;
  triggerBlobDownload(blob, filename);
}

export { openBlankPreviewTab };

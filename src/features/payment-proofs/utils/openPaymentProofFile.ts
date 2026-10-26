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
import { isUuid } from '@/lib/isUuid';
import { isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { PAYMENT_PROOF_API } from '../api/paymentProof.api';
import { PORTAL_INVOICES_API } from '@/features/portal-invoices/api/portalInvoices.api';

export type PaymentProofViewer = 'staff' | 'portal' | 'vendor';

export type FetchPaymentProofBlobOptions = {
  /** Prefer GET /payment-proofs/:id/file (or portal scoped file) over raw file_url. */
  proofId?: string;
  /** Required for portal scoped file path. */
  invoiceId?: string;
};

/**
 * Normalize API file paths for axios clients whose baseURL is `/backend` or absolute API.
 * Absolute URLs pointing at `/files/...` or `/payment-proofs/.../file` are reduced to paths
 * so a Render absolute host still works when the app proxies via `/backend`.
 */
export function paymentProofApiRequestPath(url: string): string {
  let u = url.trim();
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) {
    if (!isSafeHttpUrl(u)) {
      throw new Error('Blocked an unsafe payment proof URL.');
    }
    try {
      const parsed = new URL(u);
      const path = `${parsed.pathname}${parsed.search}`;
      const apiLike =
        path.startsWith('/files/') ||
        path.startsWith('/backend/files/') ||
        /\/payment-proofs\/[^/]+\/file(?:\?|$)/i.test(path) ||
        /\/invoices\/[^/]+\/payment-proofs\/[^/]+\/file(?:\?|$)/i.test(path);
      if (apiLike || isApiOriginUrl(u)) {
        u = path;
      } else {
        // Pre-signed object-storage URL — not an API path (caller may fetch without Bearer).
        throw new Error('EXTERNAL_PAYMENT_PROOF_URL');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'EXTERNAL_PAYMENT_PROOF_URL') throw err;
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

async function getBlobFromClient(client: AxiosInstance, path: string): Promise<Blob> {
  const res = await client.get<Blob>(path, { responseType: 'blob' });
  return interpretProofBlobResponse(res.data);
}

async function interpretProofBlobResponse(blob: Blob): Promise<Blob> {
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
    return new Blob([text], { type: contentType || 'application/octet-stream' });
  }
  return blob;
}

/** Pre-signed S3/GCS URLs — fetch without Bearer so we never leak staff/vendor tokens. */
async function fetchExternalSignedUrlBlob(url: string): Promise<Blob> {
  if (!isSafeHttpUrl(url)) {
    throw new Error('Blocked an unsafe payment proof URL.');
  }
  const res = await fetch(url, { method: 'GET', credentials: 'omit', mode: 'cors' });
  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? `Payment proof storage returned HTTP ${res.status}.`
        : `Could not download payment proof file (HTTP ${res.status}).`,
    );
  }
  return interpretProofBlobResponse(await res.blob());
}

function formatOpenError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (/^request failed with status code\s*500$/i.test(msg) || /internal server error/i.test(msg)) {
      return new Error(
        'Could not open payment proof. The file may be missing in storage — retry or contact support.',
      );
    }
    if (msg === 'EXTERNAL_PAYMENT_PROOF_URL') {
      return new Error(fallback);
    }
    return error;
  }
  return new Error(fallback);
}

export async function fetchPaymentProofBlob(
  url: string,
  viewer: PaymentProofViewer,
  options?: FetchPaymentProofBlobOptions,
): Promise<Blob> {
  const proofId = options?.proofId?.trim();
  const invoiceId = options?.invoiceId?.trim();
  const trimmedUrl = url.trim();
  const client = clientFor(viewer);
  const errors: unknown[] = [];

  // 1) Authenticated download by proof id (avoids unsafe absolute storage hosts).
  if (proofId && isUuid(proofId)) {
    try {
      if (viewer === 'portal' && invoiceId && isUuid(invoiceId)) {
        return await getBlobFromClient(
          portalApiClient,
          PORTAL_INVOICES_API.proofFile(invoiceId, proofId),
        );
      }
      // Staff + vendor: OpenAPI GET /payment-proofs/{id}/file
      return await getBlobFromClient(client, PAYMENT_PROOF_API.file(proofId));
    } catch (err) {
      errors.push(err);
    }
  }

  if (!trimmedUrl) {
    const last = errors[errors.length - 1];
    throw formatOpenError(last, 'No file URL on this payment proof.');
  }

  // 2) Staff /files/{tenant}/{filename} helper
  const parsed = parseFilesApiUrl(trimmedUrl);
  if (viewer === 'staff' && parsed) {
    try {
      return await filesService.downloadBlob({
        tenantId: parsed.tenantId,
        filename: parsed.filename,
      });
    } catch (err) {
      errors.push(err);
    }
  }

  // 3) Relative / API-origin path via viewer axios client
  try {
    const path = paymentProofApiRequestPath(trimmedUrl);
    return await getBlobFromClient(client, path);
  } catch (err) {
    if (err instanceof Error && err.message === 'EXTERNAL_PAYMENT_PROOF_URL') {
      try {
        return await fetchExternalSignedUrlBlob(trimmedUrl);
      } catch (extErr) {
        errors.push(extErr);
      }
    } else {
      errors.push(err);
    }
  }

  // 4) Absolute http(s) that looked like API but failed — last try unsigned fetch
  if (isSafeHttpUrl(trimmedUrl) && !isApiOriginUrl(trimmedUrl) && !parseFilesApiUrl(trimmedUrl)) {
    try {
      return await fetchExternalSignedUrlBlob(trimmedUrl);
    } catch (err) {
      errors.push(err);
    }
  }

  const last = errors[errors.length - 1];
  throw formatOpenError(last, 'Could not open payment proof file.');
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
  options?: FetchPaymentProofBlobOptions,
): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed && !(options?.proofId && isUuid(options.proofId))) {
    throw new Error('No file URL on this payment proof.');
  }

  const blob = await fetchPaymentProofBlob(trimmed || PAYMENT_PROOF_API.file(options!.proofId!), viewer, options);
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
  options?: FetchPaymentProofBlobOptions,
): Promise<void> {
  const blob = await fetchPaymentProofBlob(
    url.trim() || (options?.proofId ? PAYMENT_PROOF_API.file(options.proofId) : ''),
    viewer,
    options,
  );
  const name = displayName?.trim() || 'payment-proof';
  const filename =
    (await blobLooksLikePdf(blob)) && !name.toLowerCase().endsWith('.pdf')
      ? `${name}.pdf`
      : name;
  triggerBlobDownload(blob, filename);
}

export { openBlankPreviewTab };

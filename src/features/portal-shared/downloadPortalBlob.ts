import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import {
  asRecord,
  filenameFromContentDisposition,
  pickString,
  safeDownloadFilename,
  unwrapData,
} from '@/features/portal-shared/normalize';
import { triggerBlobDownload, triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { isPdfBlob, type PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';

function compactParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    next[key] = value;
  }
  return Object.keys(next).length ? next : undefined;
}

function apiOrigin(): string {
  return String(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/backend',
  ).replace(/\/$/, '');
}

/** Make `/files/...` hit the API (via `/backend` proxy or absolute API origin), not the SPA. */
export function resolvePortalDownloadUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/backend/')) return trimmed;
  const base = apiOrigin();
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }
  return `${base}/${trimmed}`;
}

function messageFromJson(parsed: unknown, fallback: string): string {
  const root = asRecord(parsed) ?? {};
  const data = asRecord(unwrapData(parsed)) ?? root;
  const message = data.message ?? root.message;
  if (Array.isArray(message)) return message.map(String).join('; ');
  if (typeof message === 'string' && message.trim()) return message.trim();
  const error = data.error ?? root.error;
  if (typeof error === 'string' && error.trim()) return error.trim();
  return fallback;
}

function fileUrlFromJson(parsed: unknown): string {
  const root = asRecord(parsed) ?? {};
  const data = asRecord(unwrapData(parsed)) ?? root;
  const direct = pickString(
    data.pdf_url,
    data.customer_pdf_url,
    data.customerPdfUrl,
    data.pdfUrl,
    data.download_url,
    data.downloadUrl,
    data.file_url,
    data.fileUrl,
    data.file_path,
    data.filePath,
    data.path,
    data.url,
    root.pdf_url,
    root.customer_pdf_url,
    root.download_url,
    root.file_url,
    root.url,
  );
  if (direct) return direct;

  for (const key of ['file', 'document', 'attachment', 'pdf']) {
    const nested = asRecord(data[key]) ?? asRecord(root[key]);
    if (!nested) continue;
    const url = pickString(
      nested.pdf_url,
      nested.url,
      nested.file_url,
      nested.fileUrl,
      nested.download_url,
      nested.path,
    );
    if (url) return url;
  }
  return '';
}

function base64PdfFromJson(parsed: unknown): Blob | null {
  const root = asRecord(parsed) ?? {};
  const data = asRecord(unwrapData(parsed)) ?? root;
  const raw = pickString(
    data.pdf_base64,
    data.pdfBase64,
    data.base64,
    data.content_base64,
    data.contentBase64,
    root.pdf_base64,
    root.base64,
  );
  if (!raw) return null;
  const normalized = raw.replace(/^data:application\/pdf;base64,/i, '').replace(/\s/g, '');
  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'application/pdf' });
  } catch {
    return null;
  }
}

function resolveDownloadFilename(
  serverOrFallback: string,
  fallbackName: string,
  branding?: PdfBrandingOptions,
): string {
  const serverName = safeDownloadFilename(serverOrFallback, fallbackName);
  const fallbackRef = stripPdfExtension(fallbackName);
  const genericFallback = ['quotation', 'invoice', 'document', 'download'].includes(
    fallbackRef.toLowerCase(),
  );
  if (branding?.documentNumber) {
    return formatPdfFilename(branding.documentNumber, stripPdfExtension(fallbackName) || 'document');
  }
  if (!genericFallback && fallbackRef) {
    return formatPdfFilename(fallbackRef, 'document');
  }
  return serverName;
}

async function savePdfBlob(
  blob: Blob,
  filename: string,
  branding?: PdfBrandingOptions,
): Promise<void> {
  if (!(await blobLooksLikePdf(blob))) {
    throw new PortalApiError(
      'Download was expected to be a PDF but the server returned a non-PDF response.',
      400,
    );
  }
  try {
    await triggerBrandedPdfDownload(blob, filename, {
      filename,
      branding: branding ?? {
        documentNumber: stripPdfExtension(filename),
        title: stripPdfExtension(filename),
      },
    });
  } catch {
    // Branding overlay must never block a valid invoice PDF download.
    triggerBlobDownload(blob, filename);
  }
}

export type DownloadPortalBlobOptions = {
  params?: Record<string, unknown>;
  accept?: string;
  hops?: number;
  branding?: PdfBrandingOptions;
};

/** Authenticated blob download for portal CSV/PDF/attachments. */
export async function downloadPortalBlob(
  url: string,
  fallbackName: string,
  paramsOrOptions?: Record<string, unknown> | DownloadPortalBlobOptions,
): Promise<void> {
  const options: DownloadPortalBlobOptions =
    paramsOrOptions &&
    ('params' in paramsOrOptions ||
      'accept' in paramsOrOptions ||
      'hops' in paramsOrOptions ||
      'branding' in paramsOrOptions)
      ? (paramsOrOptions as DownloadPortalBlobOptions)
      : { params: paramsOrOptions as Record<string, unknown> | undefined };

  const hops = options.hops ?? 0;
  if (hops > 3) {
    throw new PortalApiError('Download failed.', 400);
  }

  const res = await portalApiClient.get(url, {
    params: compactParams(options.params),
    responseType: 'blob',
    headers: options.accept ? { Accept: options.accept } : undefined,
  });
  let blob = res.data as Blob;
  const headerType =
    typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';
  const type = headerType || (blob instanceof Blob ? blob.type : '') || '';
  const shouldInspectJson =
    blob instanceof Blob &&
    blob.size > 0 &&
    blob.size < 65_536 &&
    !(await blobLooksLikePdf(blob)) &&
    (/json/i.test(type) || /octet-stream/i.test(type) || /pdf/i.test(type) || !type);

  if (shouldInspectJson) {
    const text = await blob.text();
    const trimmed = text.trim();
    let parsed: unknown = null;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = null;
      }
    }
    if (parsed) {
      const embedded = base64PdfFromJson(parsed);
      if (embedded && (await blobLooksLikePdf(embedded))) {
        const filename = resolveDownloadFilename(fallbackName, fallbackName, options.branding);
        await savePdfBlob(embedded, filename, options.branding);
        return;
      }
      const fileUrl = fileUrlFromJson(parsed);
      if (fileUrl) {
        await downloadPortalBlob(resolvePortalDownloadUrl(fileUrl), fallbackName, {
          accept: options.accept,
          hops: hops + 1,
          branding: options.branding,
        });
        return;
      }
      throw new PortalApiError(messageFromJson(parsed, 'Download failed.'), res.status || 400);
    }
    // Blob was consumed via .text() — rebuild from the text we already read.
    blob = new Blob([text], { type: type || 'application/octet-stream' });
  }

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new PortalApiError('Download returned an empty file.', res.status || 404);
  }

  const filename = resolveDownloadFilename(
    filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string'
        ? res.headers['content-disposition']
        : undefined,
    ) || fallbackName,
    fallbackName,
    options.branding,
  );

  if (await blobLooksLikePdf(blob)) {
    await savePdfBlob(blob, filename, options.branding);
    return;
  }
  if (isPdfBlob(blob, filename)) {
    throw new PortalApiError(
      'Download was expected to be a PDF but the server returned a non-PDF response.',
      res.status || 400,
    );
  }
  triggerBlobDownload(blob, filename);
}

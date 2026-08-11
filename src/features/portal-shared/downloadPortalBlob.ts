import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import {
  asRecord,
  filenameFromContentDisposition,
  pickString,
  safeDownloadFilename,
  unwrapData,
} from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';

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
  return pickString(
    data.pdf_url,
    data.customer_pdf_url,
    data.download_url,
    data.file_url,
    data.url,
    root.pdf_url,
    root.customer_pdf_url,
    root.download_url,
    root.file_url,
    root.url,
  );
}

export type DownloadPortalBlobOptions = {
  params?: Record<string, unknown>;
  accept?: string;
  hops?: number;
};

/** Authenticated blob download for portal CSV/PDF/attachments. */
export async function downloadPortalBlob(
  url: string,
  fallbackName: string,
  paramsOrOptions?: Record<string, unknown> | DownloadPortalBlobOptions,
): Promise<void> {
  const options: DownloadPortalBlobOptions =
    paramsOrOptions &&
    ('params' in paramsOrOptions || 'accept' in paramsOrOptions || 'hops' in paramsOrOptions)
      ? (paramsOrOptions as DownloadPortalBlobOptions)
      : { params: paramsOrOptions as Record<string, unknown> | undefined };

  const hops = options.hops ?? 0;
  if (hops > 2) {
    throw new PortalApiError('Download failed.', 400);
  }

  const res = await portalApiClient.get(url, {
    params: compactParams(options.params),
    responseType: 'blob',
    headers: options.accept ? { Accept: options.accept } : undefined,
  });
  const blob = res.data as Blob;
  const headerType =
    typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';
  const type = headerType || (blob instanceof Blob ? blob.type : '') || '';
  const shouldInspectJson =
    blob instanceof Blob &&
    blob.size > 0 &&
    blob.size < 8192 &&
    (/json/i.test(type) || /octet-stream/i.test(type) || !type);

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
      const fileUrl = fileUrlFromJson(parsed);
      if (fileUrl) {
        await downloadPortalBlob(resolvePortalDownloadUrl(fileUrl), fallbackName, {
          accept: options.accept,
          hops: hops + 1,
        });
        return;
      }
      throw new PortalApiError(messageFromJson(parsed, 'Download failed.'), res.status || 400);
    }
  }

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new PortalApiError('Download returned an empty file.', res.status || 404);
  }

  const filename = safeDownloadFilename(
    filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string'
        ? res.headers['content-disposition']
        : undefined,
    ) || fallbackName,
    fallbackName,
  );
  triggerBlobDownload(blob, filename);
}

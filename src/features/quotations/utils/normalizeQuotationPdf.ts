import type { QuotationPdfInfo } from '../types/quotation.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

/** Make API-relative PDF paths usable in the browser (via Vite `/backend` proxy). */
export function resolvePdfUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // Keep /files/... paths intact so StoredFileLink can do authenticated GET.
  if (/^\/files\//i.test(url) || /^\/backend\/files\//i.test(url)) {
    return url.startsWith('/backend/') ? url.replace(/^\/backend/, '') : url;
  }
  const base = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

function pickUrlFromBucket(bucket: unknown, ...keys: string[]): string | undefined {
  const record = asRecord(bucket);
  if (!record) {
    return typeof bucket === 'string' ? pickString(bucket) : undefined;
  }
  for (const key of keys) {
    const found = pickString(record[key]);
    if (found) return found;
  }
  return pickString(record.url, record.download_url, record.href, record.path);
}

/**
 * Normalize GET/POST /quotations/{id}/pdf response shapes into stable FE fields.
 */
export function normalizeQuotationPdfInfo(raw: unknown): QuotationPdfInfo {
  const root = asRecord(raw) ?? {};
  const data = asRecord(root.data) ?? root;
  const urls = asRecord(data.urls) ?? asRecord(root.urls);
  const customer = asRecord(data.customer) ?? asRecord(data.customer_pdf);
  const internal = asRecord(data.internal) ?? asRecord(data.internal_pdf);

  const customer_pdf_url = resolvePdfUrl(
    pickString(
      data.customer_pdf_url,
      data.customerPdfUrl,
      data.customer_url,
      data.customerPdf,
      urls?.customer,
      urls?.customer_pdf_url,
      pickUrlFromBucket(customer, 'url', 'pdf_url', 'download_url'),
      // Single-mode responses sometimes return one url + mode
      data.mode === 'CUSTOMER' || data.pdf_mode === 'CUSTOMER'
        ? pickString(data.url, data.pdf_url, data.download_url)
        : undefined,
    ),
  );

  const internal_pdf_url = resolvePdfUrl(
    pickString(
      data.internal_pdf_url,
      data.internalPdfUrl,
      data.internal_url,
      data.internalPdf,
      urls?.internal,
      urls?.internal_pdf_url,
      pickUrlFromBucket(internal, 'url', 'pdf_url', 'download_url'),
      data.mode === 'INTERNAL' || data.pdf_mode === 'INTERNAL'
        ? pickString(data.url, data.pdf_url, data.download_url)
        : undefined,
    ),
  );

  // If only a generic URL is present, map it to customer by default.
  const genericUrl = resolvePdfUrl(
    pickString(data.url, data.pdf_url, data.download_url, data.file_url),
  );

  const tasksRaw = data.tasks ?? data.jobs ?? root.tasks;
  const tasks = Array.isArray(tasksRaw)
    ? tasksRaw.filter((t): t is Record<string, unknown> => Boolean(asRecord(t)))
    : undefined;

  return {
    ...data,
    customer_pdf_url: customer_pdf_url || (!internal_pdf_url ? genericUrl : undefined),
    internal_pdf_url,
    status: pickString(data.status, data.state, root.status),
    mode: pickString(data.mode, data.pdf_mode),
    tasks,
  };
}

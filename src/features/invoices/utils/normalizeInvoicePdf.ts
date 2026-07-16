import type { InvoicePdfInfo } from '../types/invoice.types';

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

export function resolvePdfUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (/^\/files\//i.test(url) || /^\/backend\/files\//i.test(url)) {
    return url.startsWith('/backend/') ? url.replace(/^\/backend/, '') : url;
  }
  const base = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

export function normalizeInvoicePdfInfo(raw: unknown): InvoicePdfInfo {
  const root = asRecord(raw) ?? {};
  const data = asRecord(root.data) ?? root;
  const pdf_url = resolvePdfUrl(
    pickString(
      data.pdf_url,
      data.customer_pdf_url,
      data.url,
      data.download_url,
      data.file_url,
      data.path,
    ),
  );
  return {
    ...data,
    pdf_url,
    customer_pdf_url: pdf_url,
  };
}

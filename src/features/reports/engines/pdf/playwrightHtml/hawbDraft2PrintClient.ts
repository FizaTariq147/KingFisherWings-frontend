import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';

const PRINT_PATH = '/api/reports/hawb-draft2-pdf';

async function inlineLogo(logoUrl: string | undefined): Promise<string | undefined> {
  const url = (logoUrl || '').trim();
  if (!url || /fresa/i.test(url)) return undefined;
  if (url.startsWith('data:image/')) return url;
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) return undefined;
    const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(type)) return undefined;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 1_000_000) return undefined;
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return undefined;
  }
}

/**
 * Ask the local print service for the Draft-2 PDF.
 * Returns null when that service is not running, so the other four HAWB faces stay on their own path.
 */
export async function fetchHawbDraft2PlaywrightPdf(
  data: InvoiceFormatPdfData,
): Promise<Blob | null> {
  if (typeof fetch !== 'function') return null;
  try {
    const logoUrl = await inlineLogo(data.logoUrl);
    const response = await fetch(PRINT_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: 'HAWB_DRAFT_REPORT_FORMAT_2',
        data: { ...data, logoUrl },
      }),
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('pdf')) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

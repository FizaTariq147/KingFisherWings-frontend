import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { isPlaywrightHtmlCode } from './playwrightHtmlCodes';

const PRINT_PATH = '/api/reports/html-pilot-pdf';

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
 * Ask the local Vite print service for an allowlisted HTML pilot PDF.
 * Returns null when the service is not running so catalogue falls through.
 */
export async function fetchHtmlPilotPlaywrightPdf(
  code: string,
  data: InvoiceFormatPdfData,
): Promise<Blob | null> {
  if (typeof fetch !== 'function') return null;
  const key = String(code || '').trim().toUpperCase();
  if (!isPlaywrightHtmlCode(key)) return null;
  try {
    const logoUrl = await inlineLogo(data.logoUrl);
    const response = await fetch(PRINT_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: key,
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

import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { getReportEnrichment } from '@/features/reports/registry';
import { isHtmlCssPilotCode } from './playwrightHtml/playwrightHtmlCodes';
import { fetchHtmlPilotPlaywrightPdf } from './playwrightHtml/htmlPilotPrintClient';

/**
 * Thin adapter: try Hybrid Option C HTML/CSS Playwright path for allowlisted codes.
 * Returns null when the code is not an HTML pilot, enrichment is not playwright_html,
 * or the local print service is unavailable — caller continues the existing generator chain.
 */
export async function tryHtmlCssPilotPdf(
  code: string,
  data: InvoiceFormatPdfData,
): Promise<Blob | null> {
  const key = String(code || '').trim().toUpperCase();
  if (!isHtmlCssPilotCode(key)) return null;
  const enrichment = getReportEnrichment(key);
  if (enrichment?.renderer && enrichment.renderer !== 'playwright_html') return null;
  return fetchHtmlPilotPlaywrightPdf(key, data);
}

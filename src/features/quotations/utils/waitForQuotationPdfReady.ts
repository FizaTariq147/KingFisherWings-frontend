import { quotationService } from '../services/quotation.service';
import type { QuotationPdfInfo } from '../types/quotation.types';

function pickReadyUrl(
  info: QuotationPdfInfo,
  mode: 'CUSTOMER' | 'INTERNAL',
): string | undefined {
  if (mode === 'INTERNAL') {
    return info.internal_pdf_url || info.customer_pdf_url;
  }
  return info.customer_pdf_url || info.internal_pdf_url;
}

/**
 * Poll until the server has a quotation PDF URL for the requested mode.
 * Used before send-email so the attachment is the newly generated KFW layout.
 */
export async function waitForQuotationPdfReady(
  id: string,
  mode: 'CUSTOMER' | 'INTERNAL',
  opts?: { timeoutMs?: number; intervalMs?: number },
): Promise<QuotationPdfInfo> {
  const timeoutMs = opts?.timeoutMs ?? 45_000;
  const intervalMs = opts?.intervalMs ?? 1_500;
  const started = Date.now();
  let last: QuotationPdfInfo = {};

  while (Date.now() - started < timeoutMs) {
    try {
      last = await quotationService.getPdf(id);
      if (pickReadyUrl(last, mode)) return last;
    } catch {
      /* keep polling */
    }
    try {
      const status = await quotationService.getPdfStatus(id);
      if (status && typeof status === 'object') {
        const merged = { ...last, ...(status as QuotationPdfInfo) };
        if (pickReadyUrl(merged, mode)) return merged;
      }
    } catch {
      /* keep polling */
    }
    await new Promise((resolve) => {
      window.setTimeout(resolve, intervalMs);
    });
  }

  // Return last snapshot — send-email may still generate on demand.
  return last;
}

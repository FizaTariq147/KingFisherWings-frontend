import { invoiceService } from '../services/invoice.service';
import type { InvoicePdfInfo } from '../types/invoice.types';

function pickReadyUrl(info: InvoicePdfInfo): string | undefined {
  return info.pdf_url || info.customer_pdf_url;
}

/**
 * Poll until the server has an invoice PDF URL.
 * Used before send-email so the attachment is the newly generated layout.
 */
export async function waitForInvoicePdfReady(
  id: string,
  opts?: { timeoutMs?: number; intervalMs?: number },
): Promise<InvoicePdfInfo> {
  const timeoutMs = opts?.timeoutMs ?? 45_000;
  const intervalMs = opts?.intervalMs ?? 1_500;
  const started = Date.now();
  let last: InvoicePdfInfo = {};

  while (Date.now() - started < timeoutMs) {
    try {
      last = await invoiceService.getPdf(id);
      if (pickReadyUrl(last)) return last;
    } catch {
      /* keep polling */
    }
    await new Promise((resolve) => {
      window.setTimeout(resolve, intervalMs);
    });
  }

  return last;
}

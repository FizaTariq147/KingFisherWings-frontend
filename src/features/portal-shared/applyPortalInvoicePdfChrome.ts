import { stampPdfInvoiceChrome } from '@/features/jobs/utils/stampPdfInvoiceChrome';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';

/**
 * Apply the same invoice header/footer chrome used on admin job-document PDFs.
 * Leaves API body layout unchanged. No-op if stamp fails or input is not a PDF.
 */
export async function applyPortalInvoicePdfChrome(blob: Blob): Promise<Blob> {
  if (!(await blobLooksLikePdf(blob))) return blob;
  try {
    const stamped = await stampPdfInvoiceChrome(blob);
    return (await blobLooksLikePdf(stamped)) ? stamped : blob;
  } catch {
    return blob;
  }
}

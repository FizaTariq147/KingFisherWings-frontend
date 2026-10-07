import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import type { Job } from '@/features/jobs/types/job.types';
import type { Party } from '@/features/parties/types/party.types';
import type { Invoice } from '../types/invoice.types';
import { generateInvoicePdf } from './generateInvoicePdf';
import { invoiceToPdfModel } from './invoiceToPdfModel';
import { invoiceDisplayNumber } from './normalizeInvoice';
import { loadInvoiceJobForPdf } from './loadInvoiceJobForPdf';

export type EnsuredInvoiceEmailPdf = {
  blob: Blob;
  fileName: string;
};

/**
 * Build the KingFisher formatted invoice PDF blob for email.
 * Attached on send via multipart file / pdf_base64 (live OpenAPI).
 */
export async function ensureInvoiceEmailPdf(opts: {
  invoice: Invoice;
  party?: Party | null;
  job?: Job | null;
  companyName?: string;
}): Promise<EnsuredInvoiceEmailPdf> {
  const pdfJob =
    (await loadInvoiceJobForPdf(opts.invoice.job_id)) || opts.job || null;
  const blob = await generateInvoicePdf(
    invoiceToPdfModel(opts.invoice, {
      party: opts.party,
      job: pdfJob,
      company: { name: opts.companyName || 'KINGFISHER WINGS GROUP' },
    }),
  );
  const fileName = formatPdfFilename(invoiceDisplayNumber(opts.invoice), 'invoice');

  return { blob, fileName };
}

import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import type { Job } from '@/features/jobs/types/job.types';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import type { Party } from '@/features/parties/types/party.types';
import type { Invoice } from '../types/invoice.types';
import { generateInvoicePdf } from './generateInvoicePdf';
import { invoiceToPdfModel } from './invoiceToPdfModel';
import { invoiceDisplayNumber } from './normalizeInvoice';
import { loadInvoiceJobForPdf } from './loadInvoiceJobForPdf';
import { resolveInvoicePdfBankAccountsAsync } from './resolveInvoicePdfBankAccounts';
import { resolveInvoicePdfCompanyAsync } from './resolveInvoicePdfCompany';

export type EnsuredInvoiceEmailPdf = {
  blob: Blob;
  fileName: string;
};

/**
 * Build the KingFisher TAX INVOICE / STATEMENT OF CHARGES PDF blob for email.
 * Attached on send via multipart file / pdf_base64 (live OpenAPI).
 */
export async function ensureInvoiceEmailPdf(opts: {
  invoice: Invoice;
  party?: Party | null;
  job?: Job | null;
  companyName?: string;
  orgProfile?: OrganizationProfile | null;
}): Promise<EnsuredInvoiceEmailPdf> {
  const pdfJob =
    (await loadInvoiceJobForPdf(opts.invoice.job_id)) || opts.job || null;

  const [company, bankAccounts] = await Promise.all([
    resolveInvoicePdfCompanyAsync({
      profile: opts.orgProfile,
      companyName: opts.companyName,
    }),
    resolveInvoicePdfBankAccountsAsync(),
  ]);

  const blob = await generateInvoicePdf(
    invoiceToPdfModel(opts.invoice, {
      party: opts.party,
      job: pdfJob,
      company,
      bankAccounts,
    }),
  );
  const fileName = formatPdfFilename(invoiceDisplayNumber(opts.invoice), 'invoice');

  return { blob, fileName };
}

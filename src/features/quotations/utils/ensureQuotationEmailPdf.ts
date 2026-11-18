import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { resolveInvoicePdfCompany } from '@/features/invoices/utils/resolveInvoicePdfCompany';
import { organizationService } from '@/features/organization/services/organization.service';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { partyService } from '@/features/parties/services/party.service';
import { isUuid } from '@/lib/isUuid';
import type { Quotation } from '../types/quotation.types';
import { generateQuotationPdf } from './generateQuotationPdf';
import { quotationDisplayNumber } from './normalizeQuotation';

export type EnsuredQuotationEmailPdf = {
  blob: Blob;
  fileName: string;
  mode: 'CUSTOMER' | 'INTERNAL';
};

/**
 * Build the KingFisher QUOTATION / STATEMENT OF CHARGES PDF blob for email.
 * Attached on send-email via multipart file / pdf_base64 (live OpenAPI).
 */
export async function ensureQuotationEmailPdf(opts: {
  quotation: Quotation;
  mode?: 'CUSTOMER' | 'INTERNAL';
  companyName?: string;
  orgProfile?: OrganizationProfile | null;
}): Promise<EnsuredQuotationEmailPdf> {
  const mode = opts.mode === 'INTERNAL' ? 'INTERNAL' : 'CUSTOMER';
  let quotation = opts.quotation;

  if (!quotation.customer_name?.trim() && quotation.customer_id && isUuid(quotation.customer_id)) {
    try {
      const party = await partyService.getById(quotation.customer_id);
      if (party.name?.trim()) {
        quotation = { ...quotation, customer_name: party.name.trim() };
      }
    } catch {
      /* keep as-is */
    }
  }

  let profile = opts.orgProfile ?? null;
  if (!profile) {
    try {
      profile = await organizationService.getProfile();
    } catch {
      profile = null;
    }
  }

  const blob = await generateQuotationPdf({
    quotation,
    company: resolveInvoicePdfCompany({
      profile,
      companyName: opts.companyName,
    }),
  });
  const fileName = formatPdfFilename(quotationDisplayNumber(quotation), 'quotation');

  return { blob, fileName, mode };
}

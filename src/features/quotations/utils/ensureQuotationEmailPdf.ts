import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
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
 * Build the KingFisher formatted quotation PDF blob for email.
 * Attached on send-email via multipart file / pdf_base64 (live OpenAPI).
 */
export async function ensureQuotationEmailPdf(opts: {
  quotation: Quotation;
  mode?: 'CUSTOMER' | 'INTERNAL';
  companyName?: string;
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

  const blob = await generateQuotationPdf({
    quotation,
    company: opts.companyName ? { name: opts.companyName } : undefined,
  });
  const fileName = formatPdfFilename(quotationDisplayNumber(quotation), 'quotation');

  return { blob, fileName, mode };
}

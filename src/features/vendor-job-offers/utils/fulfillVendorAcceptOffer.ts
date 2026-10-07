import { vendorInvoicesService } from '@/features/vendor-invoices/services/vendorInvoices.service';
import type { VendorInvoiceDetail } from '@/features/vendor-invoices/types/vendorInvoices.types';
import type { VendorPortalJobDetail } from '../types/vendorJobOffers.types';
import { coerceVendorOfferStatus } from './vendorOfferStatus';

/**
 * After vendor accepts a cost offer (APPROVED), auto-create a draft vendor invoice
 * via POST /vendor/invoices/submit. The vendor posts it from Vendor Invoices; finance
 * then processes it under Purchase Invoices (payment proofs on the admin side).
 */
export async function fulfillVendorAcceptOffer(
  detail: VendorPortalJobDetail,
): Promise<{ detail: VendorPortalJobDetail; invoice: VendorInvoiceDetail | null }> {
  const status = coerceVendorOfferStatus(detail.offerStatus || 'SENT');
  if (status !== 'APPROVED') {
    return { detail, invoice: null };
  }

  const total =
    detail.costTotal ??
    detail.totalAmount ??
    detail.negotiationPricing?.customerProposedTotal ??
    detail.negotiationPricing?.tenantProposedTotal ??
    detail.lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);

  if (total == null || !Number.isFinite(total) || total <= 0) {
    return { detail, invoice: null };
  }

  const currency =
    (detail.currencyCode || detail.lines[0]?.currencyCode || 'AED').trim().toUpperCase() ||
    'AED';
  const jobRef = detail.jobNumber || detail.id.slice(0, 8);
  const offerRef = detail.offerId || detail.id;

  try {
    const invoice = await vendorInvoicesService.submit({
      currency_code: currency,
      total_amount: total,
      invoice_date: new Date().toISOString().slice(0, 10),
      reference: `Offer ${String(offerRef).slice(0, 8)}`.slice(0, 100),
      remarks: `Auto-created after accepting vendor cost offer for job ${jobRef} (offer ${offerRef}).`,
    });
    return { detail, invoice };
  } catch {
    // Accept already succeeded — invoice can be submitted manually from /vendor/invoices.
    return { detail, invoice: null };
  }
}

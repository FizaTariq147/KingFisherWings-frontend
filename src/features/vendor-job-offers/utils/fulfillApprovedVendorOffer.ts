import { isUuid } from '@/lib/isUuid';
import { purchaseInvoiceService } from '@/features/purchaseInvoices/services/purchaseInvoice.service';
import type { VendorJobOffer } from '../types/vendorJobOffers.types';
import { coerceVendorOfferStatus } from './vendorOfferStatus';

/**
 * After a vendor cost offer reaches APPROVED, ensure a draft purchase invoice
 * exists (POST /purchase-invoices). Skips if the offer already references an
 * invoice or required fields are missing. Failures are ignored so an
 * auto-creating backend does not break the negotiation UI.
 */
export async function fulfillApprovedVendorOffer(
  offer: VendorJobOffer | null | undefined,
): Promise<VendorJobOffer | null> {
  if (!offer) return null;
  if (coerceVendorOfferStatus(offer.status) !== 'APPROVED') return offer;
  if (offer.purchaseInvoiceId || offer.invoiceId) return offer;
  if (!offer.vendorPartyId || !isUuid(offer.vendorPartyId)) return offer;
  if (!offer.jobId || !isUuid(offer.jobId)) return offer;

  const currency = (offer.currencyCode || 'AED').trim().toUpperCase() || 'AED';
  const total = offer.costTotal ?? offer.totalAmount;
  const lines =
    offer.lines.length > 0
      ? offer.lines
          .map((line) => {
            const unitPrice = line.unitPrice ?? line.amount ?? 0;
            if (!line.description?.trim() || !Number.isFinite(unitPrice)) return null;
            return {
              description: line.description.trim().slice(0, 300),
              quantity: line.quantity != null && line.quantity > 0 ? line.quantity : 1,
              unit_price: unitPrice,
            };
          })
          .filter((line): line is NonNullable<typeof line> => Boolean(line))
      : total != null && Number.isFinite(total) && total >= 0
        ? [
            {
              description: `Vendor cost — offer ${offer.id.slice(0, 8)}`,
              quantity: 1,
              unit_price: total,
            },
          ]
        : [];

  if (!lines.length) return offer;

  try {
    const invoice = await purchaseInvoiceService.create({
      party_id: offer.vendorPartyId,
      job_id: offer.jobId,
      currency_code: currency,
      invoice_date: new Date().toISOString().slice(0, 10),
      remarks: `Auto-created from approved vendor job offer ${offer.id}`,
      lines,
    });
    return {
      ...offer,
      purchaseInvoiceId: invoice.id,
      invoiceId: offer.invoiceId || invoice.id,
    };
  } catch {
    return offer;
  }
}

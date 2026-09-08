import type { JobType } from '@/features/quotations/constants/quotation.constants';
import { JOB_TYPES } from '@/features/quotations/constants/quotation.constants';
import type { Quotation, QuotationLine } from '@/features/quotations/types/quotation.types';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';

function asJobType(value?: string): JobType {
  const upper = (value || '').trim().toUpperCase();
  if ((JOB_TYPES as readonly string[]).includes(upper)) return upper as JobType;
  return 'SEA_FCL_EXPORT';
}

/**
 * Map portal quotation detail into the shared FRESA quotation PDF model.
 * Does not invent API fields — only remaps what the portal detail already exposes.
 */
export function portalDetailToQuotationPdfModel(
  detail: PortalQuotationDetail,
  opts?: { customerName?: string; contactName?: string; contactEmail?: string; contactPhone?: string },
): Quotation {
  const currency = detail.currencyCode || 'AED';
  const lines: QuotationLine[] = (detail.lines ?? []).map((line, index) => {
    const qty = line.quantity != null && line.quantity > 0 ? line.quantity : 1;
    const unitPrice =
      line.unitPrice != null
        ? line.unitPrice
        : line.amount != null
          ? line.amount / qty
          : 0;
    return {
      id: line.id || `line-${index}`,
      charge_code_id: '',
      charge_code: line.chargeCode,
      description: line.description || line.chargeCode || 'Charge',
      unit: line.unit,
      quantity: qty,
      unit_price: unitPrice,
      currency_code: line.currencyCode || currency,
      line_total: line.amount ?? unitPrice * qty,
      tax_percent: line.taxPercent,
      tax_amount: line.taxAmount,
      exchange_rate: line.exchangeRate ?? 1,
    };
  });

  const total =
    lines.reduce((sum, line) => sum + (line.line_total ?? 0), 0) ||
    detail.negotiationPricing?.revenueTotal ||
    detail.negotiationPricing?.tenantProposedTotal;

  return {
    id: detail.id,
    quotation_number: detail.number,
    quote_no: detail.number,
    status: (detail.status as Quotation['status']) || 'SENT',
    job_type: asJobType(detail.jobType),
    customer_id: '',
    customer_name: opts?.customerName,
    contact_name: opts?.contactName,
    contact_email: opts?.contactEmail,
    contact_phone: opts?.contactPhone,
    currency_code: currency,
    origin_port_name: detail.origin,
    dest_port_name: detail.destination,
    commodity: detail.commodity,
    pieces: detail.pieces,
    gross_weight: detail.grossWeight,
    chargeable_weight: detail.chargeableWeight,
    volume_cbm: detail.volumeCbm,
    special_requirements: detail.specialRequirements,
    valid_until: detail.validUntil,
    quotation_date: detail.createdAt,
    created_at: detail.createdAt,
    lines,
    total_amount: typeof total === 'number' ? total : undefined,
    subtotal: typeof total === 'number' ? total : undefined,
  };
}

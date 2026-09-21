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
 * Map portal quotation detail into the shared KingFisher quotation PDF model
 * (same layout as invoice / staff quotation PDFs).
 */
export function portalDetailToQuotationPdfModel(
  detail: PortalQuotationDetail,
  opts?: { customerName?: string; contactName?: string; contactEmail?: string; contactPhone?: string },
): Quotation {
  const currency =
    detail.currencyCode ||
    detail.negotiationPricing?.currencyCode ||
    detail.portalEstimateSnapshot?.currencyCode ||
    'AED';

  let lines: QuotationLine[] = (detail.lines ?? []).map((line, index) => {
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

  // Negotiation snapshot lines when charge lines are empty
  if (!lines.length && detail.negotiationPricing?.lines?.length) {
    lines = detail.negotiationPricing.lines.map((line, index) => {
      const qty = line.quantity != null && line.quantity > 0 ? line.quantity : 1;
      const unitPrice =
        line.unitPrice != null
          ? line.unitPrice
          : line.amount != null
            ? line.amount / qty
            : 0;
      return {
        id: `neg-line-${index}`,
        charge_code_id: '',
        description: line.description || 'Charge',
        quantity: qty,
        unit_price: unitPrice,
        currency_code: currency,
        line_total: line.amount ?? unitPrice * qty,
      };
    });
  }

  if (!lines.length && detail.negotiationPricing?.customerProposedLines?.length) {
    lines = detail.negotiationPricing.customerProposedLines.map((line, index) => {
      const qty = line.quantity != null && line.quantity > 0 ? line.quantity : 1;
      const unitPrice =
        line.unitPrice != null
          ? line.unitPrice
          : line.amount != null
            ? line.amount / qty
            : 0;
      return {
        id: `cust-line-${index}`,
        charge_code_id: '',
        description: line.description || 'Charge',
        quantity: qty,
        unit_price: unitPrice,
        currency_code: currency,
        line_total: line.amount ?? unitPrice * qty,
      };
    });
  }

  const linesTotal = lines.reduce((sum, line) => sum + (line.line_total ?? 0), 0);
  const total =
    linesTotal ||
    detail.negotiationPricing?.revenueTotal ||
    detail.negotiationPricing?.tenantProposedTotal ||
    detail.portalEstimateSnapshot?.estimatedTotal;

  // Single summary line so the invoice-style charge table is never empty
  if (!lines.length && typeof total === 'number' && total > 0) {
    lines = [
      {
        id: 'summary-total',
        charge_code_id: '',
        description: 'Freight / logistics charges (as quoted)',
        quantity: 1,
        unit_price: total,
        currency_code: currency,
        line_total: total,
        unit: 'Lot',
      },
    ];
  }

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
    job_id: detail.jobId || detail.convertedJobNumber,
    lines,
    total_amount: typeof total === 'number' ? total : undefined,
    subtotal: typeof total === 'number' ? total : undefined,
    revenue_total: typeof total === 'number' ? total : undefined,
  };
}

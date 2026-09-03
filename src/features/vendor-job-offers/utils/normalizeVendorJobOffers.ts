import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import { normalizeNegotiationPricing } from '@/features/quotations/utils/normalizeQuotationExtended';
import type {
  VendorJobOffer,
  VendorJobOfferPricingLine,
  VendorJobPricingResult,
  VendorPortalJobDetail,
  VendorPortalJobListItem,
  VendorPortalJobListResult,
} from '../types/vendorJobOffers.types';
import { coerceVendorOfferStatus } from './vendorOfferStatus';

function normalizeOfferStatus(...values: unknown[]): string {
  const raw = pickString(...values);
  return coerceVendorOfferStatus(raw || 'SENT');
}

function optionalOfferStatus(...values: unknown[]): string | undefined {
  const raw = pickString(...values);
  if (!raw) return undefined;
  return coerceVendorOfferStatus(raw);
}

export function normalizePricingLine(raw: unknown): VendorJobOfferPricingLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const description = pickString(r.description, r.desc, r.charge_description, r.chargeDescription);
  if (!description) return null;
  const quantity = pickNumber(r.quantity, r.qty);
  const unitPrice = pickNumber(r.unit_price, r.unitPrice, r.price, r.cost_price, r.costPrice);
  const amount =
    pickNumber(r.amount, r.line_total, r.lineTotal, r.total, r.line_amount, r.lineAmount) ??
    (quantity != null && unitPrice != null ? quantity * unitPrice : undefined);
  return {
    id: pickString(r.id, r.line_id, r.lineId) || undefined,
    description,
    quantity,
    unitPrice,
    amount,
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
  };
}

function normalizeLines(raw: unknown): VendorJobOfferPricingLine[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw)?.lines)
      ? (asRecord(raw)!.lines as unknown[])
      : [];
  return list.map(normalizePricingLine).filter((l): l is VendorJobOfferPricingLine => Boolean(l));
}

function pickCostTotal(
  data: Record<string, unknown>,
  pricing?: ReturnType<typeof normalizeNegotiationPricing>,
  lines: VendorJobOfferPricingLine[] = [],
): number | undefined {
  return (
    pickNumber(
      data.cost_total,
      data.costTotal,
      data.total_amount,
      data.totalAmount,
      data.proposed_total,
      data.proposedTotal,
      pricing?.customerProposedTotal,
      pricing?.tenantProposedTotal,
      pricing?.revenueTotal,
    ) ??
    (lines.length ? lines.reduce((sum, line) => sum + (line.amount ?? 0), 0) || undefined : undefined)
  );
}

/**
 * Vendor cost negotiation_pricing uses the same shape as quotations, but
 * tenantProposedTotal = tenant cost offer and customerProposedTotal = vendor counter.
 */
function normalizeVendorNegotiationPricing(raw: unknown) {
  const pricing = normalizeNegotiationPricing(raw);
  if (!pricing) return undefined;
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const costTotal = pickNumber(record.cost_total, record.costTotal);
  return {
    ...pricing,
    revenueTotal: pricing.revenueTotal ?? pricing.tenantProposedTotal ?? costTotal,
    tenantProposedTotal: pricing.tenantProposedTotal ?? pricing.revenueTotal ?? costTotal,
  };
}

export function normalizeVendorJobOffer(raw: unknown): VendorJobOffer | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const id = pickString(data.id, data.offer_id, data.offerId);
  if (!id) return null;
  const vendor = asRecord(data.vendor) ?? asRecord(data.vendor_party) ?? asRecord(data.vendorParty);
  const lines = normalizeLines(
    data.lines ?? data.pricing_lines ?? data.pricingLines ?? data.items ?? data.charges,
  );
  const negotiationPricing = normalizeVendorNegotiationPricing(
    data.negotiation_pricing ?? data.negotiationPricing ?? data,
  );
  const costTotal = pickCostTotal(data, negotiationPricing, lines);

  return {
    id,
    jobId: pickString(data.job_id, data.jobId, asRecord(data.job)?.id) || '',
    vendorPartyId:
      pickString(
        data.vendor_party_id,
        data.vendorPartyId,
        data.party_id,
        data.partyId,
        vendor?.id,
      ) || undefined,
    vendorPartyName:
      pickString(
        data.vendor_party_name,
        data.vendorPartyName,
        data.vendor_name,
        data.vendorName,
        vendor?.name,
        vendor?.code,
      ) || undefined,
    status: normalizeOfferStatus(data.status, data.offer_status, data.offerStatus),
    notes:
      pickString(data.notes, data.pass_notes, data.passNotes, data.staff_notes, data.staffNotes) ||
      undefined,
    reviewNotes: pickString(data.review_notes, data.reviewNotes) || undefined,
    lines,
    currencyCode:
      pickString(data.currency_code, data.currencyCode, data.currency, lines[0]?.currencyCode) ||
      undefined,
    totalAmount: costTotal,
    costTotal,
    negotiationPricing,
    createdAt: pickString(data.created_at, data.createdAt) || undefined,
    updatedAt: pickString(data.updated_at, data.updatedAt) || undefined,
    pricedAt: pickString(data.priced_at, data.pricedAt) || undefined,
    reviewedAt: pickString(data.reviewed_at, data.reviewedAt) || undefined,
  };
}

export function normalizeVendorJobOfferList(raw: unknown): VendorJobOffer[] {
  const { items } = unwrapList(raw, [
    'items',
    'results',
    'offers',
    'vendor_offers',
    'vendorOffers',
    'job_offers',
    'jobOffers',
    'quotes',
    'vendor_quotes',
    'vendorQuotes',
    'data',
  ]);
  return items.map(normalizeVendorJobOffer).filter((o): o is VendorJobOffer => Boolean(o));
}

const CUSTOMER_REVENUE_KEYS = new Set([
  'revenue',
  'customer_revenue',
  'customerRevenue',
  'sell_price',
  'sellPrice',
  'selling_price',
  'sellingPrice',
  'customer_rate',
  'customerRate',
  'customer_amount',
  'customerAmount',
  'sell_amount',
  'sellAmount',
  'margin',
  'gross_margin',
  'grossMargin',
  'pnl',
  'profit',
]);

function stripCustomerRevenue(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (CUSTOMER_REVENUE_KEYS.has(key)) continue;
    if (/revenue|sell_?price|customer_?(rate|amount|price)|margin|gross_?profit/i.test(key)) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function normalizeVendorPortalJobListItem(raw: unknown): VendorPortalJobListItem | null {
  const base = asRecord(raw);
  if (!base) return null;
  const r = stripCustomerRevenue(base);
  const job = asRecord(r.job) ?? asRecord(r.shipment);
  const offerId =
    pickString(r.id, r.offer_id, r.offerId, r.quote_id, r.quoteId) || undefined;
  const jobId = pickString(r.job_id, r.jobId, job?.id) || undefined;
  const id = offerId || jobId;
  if (!id) return null;
  return {
    id,
    jobNumber:
      pickString(
        r.job_number,
        r.jobNumber,
        job?.job_number,
        job?.jobNumber,
        job?.number,
        r.number,
        r.ref,
        r.reference,
      ) || undefined,
    status: pickString(job?.status, r.job_status, r.jobStatus) || undefined,
    jobType: pickString(r.job_type, r.jobType, job?.job_type, job?.jobType) || undefined,
    offerStatus: optionalOfferStatus(
      r.status,
      r.offer_status,
      r.offerStatus,
      r.vendor_offer_status,
      r.vendorOfferStatus,
      r.quote_status,
      r.quoteStatus,
    ),
    origin:
      pickString(
        r.origin,
        r.origin_port,
        r.originPort,
        r.pol,
        job?.origin,
        asRecord(job?.origin_port)?.code,
        asRecord(job?.origin_port)?.name,
      ) || undefined,
    destination:
      pickString(
        r.destination,
        r.dest_port,
        r.destPort,
        r.pod,
        job?.destination,
        asRecord(job?.dest_port)?.code,
        asRecord(job?.dest_port)?.name,
      ) || undefined,
    etd: pickString(r.etd, r.etd_date, r.etdDate, job?.etd) || undefined,
    eta: pickString(r.eta, r.eta_date, r.etaDate, job?.eta) || undefined,
    notes:
      pickString(
        r.notes,
        r.pass_notes,
        r.passNotes,
        r.staff_notes,
        r.staffNotes,
        r.instructions,
        r.message,
      ) || undefined,
    costTotal: pickNumber(r.cost_total, r.costTotal, r.total_amount, r.totalAmount),
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    updatedAt: pickString(r.updated_at, r.updatedAt) || undefined,
  };
}

export function normalizeVendorPortalJobList(
  raw: unknown,
  params: { page?: number; limit?: number },
): VendorPortalJobListResult {
  const { items, meta } = unwrapList(raw, [
    'items',
    'results',
    'jobs',
    'offers',
    'job_offers',
    'jobOffers',
    'quotes',
    'vendor_quotes',
    'vendorQuotes',
    'data',
  ]);
  const normalized = items
    .map(normalizeVendorPortalJobListItem)
    .filter((x): x is VendorPortalJobListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeVendorPortalJobDetail(raw: unknown): VendorPortalJobDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const safe = stripCustomerRevenue(data);
  const base = normalizeVendorPortalJobListItem(safe);
  if (!base) return null;
  const offer =
    asRecord(data.offer) ??
    asRecord(data.vendor_offer) ??
    asRecord(data.vendorOffer) ??
    asRecord(data.pricing);
  const lines = normalizeLines(
    data.lines ??
      data.pricing_lines ??
      data.pricingLines ??
      offer?.lines ??
      offer?.pricing_lines ??
      offer?.pricingLines,
  );
  const negotiationPricing = normalizeVendorNegotiationPricing(
    data.negotiation_pricing ?? data.negotiationPricing ?? offer ?? data,
  );
  const costTotal = pickCostTotal(safe, negotiationPricing, lines);

  return {
    ...base,
    offerId: pickString(data.offer_id, data.offerId, offer?.id, data.id) || base.id,
    offerStatus: optionalOfferStatus(
      data.status,
      data.offer_status,
      data.offerStatus,
      offer?.status,
      base.offerStatus,
    ),
    pricingNotes:
      pickString(
        data.pricing_notes,
        data.pricingNotes,
        data.vendor_notes,
        data.vendorNotes,
        data.notes,
        offer?.notes,
      ) || undefined,
    lines,
    currencyCode:
      pickString(
        data.currency_code,
        data.currencyCode,
        offer?.currency_code,
        offer?.currencyCode,
        lines[0]?.currencyCode,
        base.currencyCode,
      ) || undefined,
    totalAmount: costTotal,
    costTotal,
    negotiationPricing,
  };
}

export function normalizeVendorJobPricing(raw: unknown, jobId: string): VendorJobPricingResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const safe = stripCustomerRevenue(data);
  const lines = normalizeLines(
    safe.lines ?? safe.pricing_lines ?? safe.pricingLines ?? safe.items,
  );
  const negotiationPricing = normalizeVendorNegotiationPricing(
    safe.negotiation_pricing ?? safe.negotiationPricing ?? safe,
  );
  const costTotal = pickCostTotal(safe, negotiationPricing, lines);
  return {
    jobId: pickString(safe.job_id, safe.jobId) || jobId,
    offerId: pickString(safe.offer_id, safe.offerId, safe.id) || undefined,
    status: optionalOfferStatus(safe.status, safe.offer_status, safe.offerStatus),
    notes: pickString(safe.notes, safe.pricing_notes, safe.pricingNotes, safe.vendor_notes) || undefined,
    lines,
    currencyCode:
      pickString(safe.currency_code, safe.currencyCode, lines[0]?.currencyCode) || undefined,
    totalAmount: costTotal,
    costTotal,
    negotiationPricing,
    updatedAt: pickString(safe.updated_at, safe.updatedAt) || undefined,
  };
}

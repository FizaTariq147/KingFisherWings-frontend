import {
  asRecord,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  NegotiationEvent,
  NegotiationPricing,
  NegotiationProposedLine,
  NegotiationTimeline,
  ServiceCatalogItem,
} from '../types/quotationExtended.types';

export function normalizeServiceCatalogItem(raw: unknown): ServiceCatalogItem | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id);
  const code = pickString(record.code);
  const name = pickString(record.name);
  if (!id || !code || !name) return null;
  return {
    id,
    code,
    name,
    jobType: pickString(record.job_type, record.jobType) || '',
    chargeCodeId: pickString(record.charge_code_id, record.chargeCodeId) || undefined,
    pricingBasis: pickString(record.pricing_basis, record.pricingBasis) || 'FLAT',
    unitPrice: pickNumber(record.unit_price, record.unitPrice) ?? 0,
    currencyCode: pickString(record.currency_code, record.currencyCode) || 'AED',
    minCharge: pickNumber(record.min_charge, record.minCharge),
    isPortalVisible: pickBoolean(record.is_portal_visible, record.isPortalVisible) ?? true,
    isActive: pickBoolean(record.is_active, record.isActive) ?? true,
    sortOrder: pickNumber(record.sort_order, record.sortOrder),
    raw: record,
  };
}

export function normalizeServiceCatalogList(raw: unknown): ServiceCatalogItem[] {
  const { items } = unwrapList(raw, ['items', 'results', 'service_catalog', 'catalog']);
  return items
    .map(normalizeServiceCatalogItem)
    .filter((item): item is ServiceCatalogItem => Boolean(item));
}

export function normalizeNegotiationProposedLine(raw: unknown): NegotiationProposedLine | null {
  const record = asRecord(raw);
  if (!record) return null;
  const description = pickString(record.description, record.name, record.charge_name);
  const amount = pickNumber(record.amount, record.line_total, record.lineTotal, record.total);
  const unitPrice = pickNumber(record.unit_price, record.unitPrice);
  const quantity = pickNumber(record.quantity, record.qty);
  if (!description && amount == null && unitPrice == null) return null;
  return {
    lineId: pickString(record.line_id, record.lineId, record.id) || undefined,
    description: description || undefined,
    quantity,
    unitPrice,
    amount,
  };
}

export function normalizeNegotiationPricing(raw: unknown): NegotiationPricing | undefined {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return undefined;

  const nested =
    asRecord(record.negotiation_pricing) ?? asRecord(record.negotiationPricing) ?? null;

  // Merge nested negotiation_pricing with top-level quotation fields so we still
  // show a tenant offer when the API only returns total_amount / revenue_total / lines.
  const source: Record<string, unknown> = { ...record, ...(nested ?? {}) };

  const customerLinesRaw =
    source.customer_proposed_lines ??
    source.customerProposedLines ??
    (nested
      ? nested.proposed_lines ?? nested.proposedLines
      : undefined);
  const tenantLinesRaw =
    (nested && (nested.lines ?? nested.tenant_lines ?? nested.tenantLines ?? nested.revenue_lines)) ||
    undefined;

  const customerProposedLines = Array.isArray(customerLinesRaw)
    ? customerLinesRaw
        .map(normalizeNegotiationProposedLine)
        .filter((l): l is NegotiationProposedLine => Boolean(l))
    : undefined;
  const lines = Array.isArray(tenantLinesRaw)
    ? tenantLinesRaw
        .map(normalizeNegotiationProposedLine)
        .filter((l): l is NegotiationProposedLine => Boolean(l))
    : undefined;

  // Prefer explicit negotiation totals; fall back to quotation revenue / grand total.
  const tenantProposedTotal = pickNumber(
    source.tenant_proposed_total,
    source.tenantProposedTotal,
    nested?.proposed_total,
    nested?.proposedTotal,
    source.revenue_total,
    source.revenueTotal,
    source.total_amount,
    source.totalAmount,
    source.grand_total,
    source.grandTotal,
    source.sale_total,
    source.saleTotal,
  );

  const pricing: NegotiationPricing = {
    revenueTotal: pickNumber(
      source.revenue_total,
      source.revenueTotal,
      source.official_total,
      tenantProposedTotal,
    ),
    tenantProposedTotal,
    customerProposedTotal: pickNumber(
      source.customer_proposed_total,
      source.customerProposedTotal,
      source.counter_offer_total,
      source.counterOfferTotal,
    ),
    customerProposedAt:
      pickString(
        source.customer_proposed_at,
        source.customerProposedAt,
        source.counter_offered_at,
      ) || undefined,
    customerProposedLines: customerProposedLines?.length ? customerProposedLines : undefined,
    lines: lines?.length ? lines : undefined,
    currencyCode:
      pickString(source.currency_code, source.currencyCode, source.currency) || undefined,
    raw: nested ?? record,
  };

  if (
    pricing.revenueTotal == null &&
    pricing.tenantProposedTotal == null &&
    pricing.customerProposedTotal == null &&
    !pricing.customerProposedLines &&
    !pricing.lines
  ) {
    return undefined;
  }
  return pricing;
}

/** Build a display pricing object from known quote totals/lines when API omits negotiation_pricing. */
export function fallbackNegotiationPricing(opts: {
  currencyCode?: string;
  revenueTotal?: number | null;
  totalAmount?: number | null;
  customerProposedTotal?: number | null;
  lines?: Array<{ description?: string; amount?: number; quantity?: number; unit_price?: number; unitPrice?: number; line_total?: number; is_cost?: boolean }>;
}): NegotiationPricing | undefined {
  const revenueLines = (opts.lines ?? []).filter((l) => !l.is_cost);
  const linesSum = revenueLines.reduce((sum, line) => {
    const amount =
      line.amount ??
      line.line_total ??
      (line.quantity != null && (line.unit_price ?? line.unitPrice) != null
        ? line.quantity * (line.unit_price ?? line.unitPrice ?? 0)
        : undefined);
    return sum + (typeof amount === 'number' && Number.isFinite(amount) ? amount : 0);
  }, 0);

  const tenantProposedTotal =
    (opts.revenueTotal != null && Number.isFinite(opts.revenueTotal) ? opts.revenueTotal : undefined) ??
    (opts.totalAmount != null && Number.isFinite(opts.totalAmount) ? opts.totalAmount : undefined) ??
    (linesSum > 0 ? linesSum : undefined);

  const customerProposedTotal =
    opts.customerProposedTotal != null && Number.isFinite(opts.customerProposedTotal)
      ? opts.customerProposedTotal
      : undefined;

  if (tenantProposedTotal == null && customerProposedTotal == null) return undefined;

  return {
    revenueTotal: tenantProposedTotal,
    tenantProposedTotal,
    customerProposedTotal,
    currencyCode: opts.currencyCode,
    lines: revenueLines.length
      ? revenueLines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unit_price ?? line.unitPrice,
          amount:
            line.amount ??
            line.line_total ??
            (line.quantity != null && (line.unit_price ?? line.unitPrice) != null
              ? line.quantity * (line.unit_price ?? line.unitPrice ?? 0)
              : undefined),
        }))
      : undefined,
  };
}

export function normalizeNegotiationEvent(raw: unknown): NegotiationEvent | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id =
    pickString(record.id) ||
    pickString(record.created_at, record.createdAt) ||
    Math.random().toString(36).slice(2);
  return {
    id,
    eventType:
      pickString(record.event_type, record.eventType, record.type, record.action) || undefined,
    actor: pickString(record.actor, record.actor_name, record.by, record.user_name) || undefined,
    message: pickString(record.message, record.comments, record.notes) || undefined,
    proposedTotal: pickNumber(record.proposed_total, record.proposedTotal, record.amount),
    status: pickString(record.status) || undefined,
    createdAt: pickString(record.created_at, record.createdAt, record.at) || undefined,
    raw: record,
  };
}

export function normalizeNegotiationTimeline(raw: unknown): NegotiationTimeline {
  const unwrapped = unwrapData(raw);
  // Some backends return a bare event array; others nest under events/timeline/items.
  if (Array.isArray(unwrapped) || Array.isArray(raw)) {
    const list = (Array.isArray(unwrapped) ? unwrapped : raw) as unknown[];
    return {
      events: list
        .map(normalizeNegotiationEvent)
        .filter((e): e is NegotiationEvent => Boolean(e)),
      raw: asRecord(raw) ?? undefined,
    };
  }

  const data = asRecord(unwrapped) ?? asRecord(raw) ?? {};
  const nestedList = unwrapList(raw, ['events', 'timeline', 'items', 'history', 'negotiation']);
  const eventsRaw =
    Array.isArray(nestedList.items) && nestedList.items.length
      ? nestedList.items
      : data.events ?? data.timeline ?? data.items ?? data.history;
  const events = Array.isArray(eventsRaw)
    ? eventsRaw
        .map(normalizeNegotiationEvent)
        .filter((e): e is NegotiationEvent => Boolean(e))
    : [];

  const pricing =
    normalizeNegotiationPricing(data.negotiation_pricing ?? data.negotiationPricing ?? data) ??
    normalizeNegotiationPricing({
      revenue_total: data.revenue_total,
      customer_proposed_total: data.customer_proposed_total,
      customer_proposed_lines: data.customer_proposed_lines,
      customer_proposed_at: data.customer_proposed_at,
      lines: data.lines,
      currency_code: data.currency_code,
    });

  return {
    events,
    round: pickNumber(
      data.negotiation_round,
      data.round,
      data.current_round,
      asRecord(data.negotiation)?.round,
    ),
    pricing,
    raw: data,
  };
}

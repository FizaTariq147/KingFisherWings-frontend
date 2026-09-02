import {
  asRecord,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type { NegotiationEvent, NegotiationTimeline } from '../types/quotationExtended.types';
import type { ServiceCatalogItem } from '../types/quotationExtended.types';

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

export function normalizeNegotiationEvent(raw: unknown): NegotiationEvent | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id =
    pickString(record.id) ||
    pickString(record.created_at, record.createdAt) ||
    Math.random().toString(36).slice(2);
  return {
    id,
    eventType: pickString(record.event_type, record.eventType, record.type, record.action) || undefined,
    actor: pickString(record.actor, record.actor_name, record.by, record.user_name) || undefined,
    message: pickString(record.message, record.comments, record.notes) || undefined,
    proposedTotal: pickNumber(record.proposed_total, record.proposedTotal, record.amount),
    status: pickString(record.status) || undefined,
    createdAt: pickString(record.created_at, record.createdAt, record.at) || undefined,
    raw: record,
  };
}

export function normalizeNegotiationTimeline(raw: unknown): NegotiationTimeline {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const eventsRaw = data.events ?? data.timeline ?? data.items ?? data.history;
  const events = Array.isArray(eventsRaw)
    ? eventsRaw
        .map(normalizeNegotiationEvent)
        .filter((e): e is NegotiationEvent => Boolean(e))
    : [];
  return {
    events,
    round: pickNumber(data.negotiation_round, data.round, data.current_round),
    raw: data,
  };
}

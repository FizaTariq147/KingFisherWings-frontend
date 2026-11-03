import type {
  ExternalQuoteRequest,
  QuoteRequestSource,
} from '../types/adminQuoteRequests.types';

const SOURCE_LABELS: Record<string, string> = {
  gq: 'Get a Quote',
  pq: 'Product quote',
  tl: 'General Trading popup',
  si: 'Service inquiry',
};

export function sourceBadgeLabel(
  source: QuoteRequestSource | null | undefined,
  sourceLabel?: string | null,
): string {
  const explicit = String(sourceLabel ?? '').trim();
  if (explicit) return explicit;
  const key = String(source ?? '').trim().toLowerCase();
  if (key && SOURCE_LABELS[key]) return SOURCE_LABELS[key];
  return key || '—';
}

/** Prefer KFQA-style UI when connection is KFQA or the row carries enriched fields. */
export function isKfqaStyleQuote(
  item: Pick<
    ExternalQuoteRequest,
    'items' | 'reference' | 'source' | 'source_label'
  > | null | undefined,
  provider?: string | null,
): boolean {
  if (provider === 'KFQA_WP') return true;
  if (!item) return false;
  if ((item.items?.length ?? 0) > 0) return true;
  if (item.reference || item.source || item.source_label) return true;
  return false;
}

export function displayReference(item: ExternalQuoteRequest): string {
  return item.reference?.trim() || item.external_id || item.id;
}

export function displayCustomerName(item: ExternalQuoteRequest): string {
  return (
    item.customer?.name?.trim() ||
    item.contact_name?.trim() ||
    '—'
  );
}

export function displayCustomerCompany(item: ExternalQuoteRequest): string | null {
  return (
    item.customer?.company?.trim() ||
    item.company_name?.trim() ||
    null
  );
}

export function displayCustomerContact(item: ExternalQuoteRequest): string {
  const email = item.customer?.email?.trim() || item.contact_email?.trim() || '';
  const phone = item.customer?.phone?.trim() || item.contact_phone?.trim() || '';
  return [email, phone].filter(Boolean).join(' · ') || '—';
}

export function itemsSummary(item: ExternalQuoteRequest): string {
  const items = item.items ?? [];
  if (items.length === 0) {
    return item.commodity?.trim() || '—';
  }
  const first = items[0]?.name?.trim() || 'Item';
  if (items.length === 1) return first;
  return `${first} +${items.length - 1}`;
}

import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { normalizeProvider } from '../constants/quoteRequestProviders';
import type {
  ExternalQuoteRequest,
  QuoteLineItem,
  QuoteRequestConnection,
  QuoteRequestCustomer,
  QuoteRequestHealthResult,
  QuoteRequestListResult,
  QuoteRequestSyncResult,
  QuoteRequestSyncRun,
  QuoteRequestSyncRunListResult,
} from '../types/adminQuoteRequests.types';

function pickNullableString(...values: unknown[]): string | null {
  const value = pickString(...values);
  return value || null;
}

function asStatusMap(value: unknown): Record<string, string> | null {
  const record = asRecord(value);
  if (!record) return null;
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry === 'string' && entry.trim()) out[key] = entry.trim();
  }
  return Object.keys(out).length ? out : null;
}

function asRawJson(value: unknown): Record<string, unknown> | null {
  const record = asRecord(value);
  if (record) return record;
  if (typeof value === 'string' && value.trim()) {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return { value };
    }
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()))
    .filter(Boolean);
}

function normalizeCustomer(raw: unknown, fallback: Record<string, unknown>): QuoteRequestCustomer {
  const record = asRecord(raw) ?? {};
  return {
    type: pickNullableString(record.type, record.customer_type, record.customerType),
    name: pickNullableString(
      record.name,
      record.contact_name,
      record.contactName,
      fallback.contact_name,
      fallback.contactName,
      fallback.name,
    ),
    company: pickNullableString(
      record.company,
      record.company_name,
      record.companyName,
      fallback.company_name,
      fallback.companyName,
    ),
    email: pickNullableString(
      record.email,
      record.contact_email,
      record.contactEmail,
      fallback.contact_email,
      fallback.contactEmail,
      fallback.email,
    ),
    phone: pickNullableString(
      record.phone,
      record.contact_phone,
      record.contactPhone,
      record.mobile,
      fallback.contact_phone,
      fallback.contactPhone,
      fallback.phone,
    ),
  };
}

function normalizeLineItem(raw: unknown): QuoteLineItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const name = pickNullableString(record.name, record.product_name, record.productName, record.title);
  const sku = pickNullableString(record.sku, record.product_sku, record.productSku);
  const productId = pickNumber(record.product_id, record.productId, record.id);
  if (!name && !sku && productId == null) return null;
  return {
    product_id: productId,
    name,
    sku,
    variation: pickNullableString(record.variation, record.variant),
    quantity: pickNumber(record.quantity, record.qty),
    unit: pickNullableString(record.unit, record.uom),
    pcs_per_carton: pickNumber(
      record.pcs_per_carton,
      record.pcsPerCarton,
      record.pieces_per_carton,
    ),
    total_pieces: pickNumber(record.total_pieces, record.totalPieces, record.pcs),
    price: pickNumber(record.price, record.unit_price, record.unitPrice),
    currency: pickNullableString(record.currency, record.currency_code, record.currencyCode),
    url: pickNullableString(record.url, record.product_url, record.productUrl, record.link),
    image: pickNullableString(
      record.image,
      record.image_url,
      record.imageUrl,
      record.thumbnail,
      record.thumb,
    ),
    categories: asStringArray(record.categories ?? record.category),
  };
}

function normalizeLineItems(raw: unknown): QuoteLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeLineItem(item))
    .filter((item): item is QuoteLineItem => Boolean(item));
}

export function normalizeQuoteRequestConnection(raw: unknown): QuoteRequestConnection | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;

  const baseUrl = pickString(record.base_url, record.baseUrl);
  const prefix = pickString(
    record.api_key_prefix,
    record.apiKeyPrefix,
    record.key_prefix,
    record.keyPrefix,
  );
  const id = pickString(record.id, record.connection_id, record.connectionId);
  const configured =
    pickBoolean(record.configured, record.is_configured, record.isConfigured) ??
    Boolean(baseUrl || prefix || id);
  const provider = normalizeProvider(pickString(record.provider, 'KFPP_WP'));

  return {
    id: id || 'connection',
    tenant_id: pickNullableString(record.tenant_id, record.tenantId) ?? undefined,
    provider,
    base_url: baseUrl,
    api_key_prefix: prefix,
    auth_header_name:
      pickString(record.auth_header_name, record.authHeaderName) ||
      (provider === 'KFQA_WP' ? 'X-API-Key' : 'X-KFPP-Api-Key'),
    is_active: pickBoolean(record.is_active, record.isActive) ?? true,
    last_health_at: pickNullableString(record.last_health_at, record.lastHealthAt),
    last_health_ok: pickBoolean(record.last_health_ok, record.lastHealthOk) ?? null,
    last_health_error: pickNullableString(record.last_health_error, record.lastHealthError),
    last_sync_at: pickNullableString(record.last_sync_at, record.lastSyncAt),
    last_external_id: pickNullableString(
      record.last_external_id,
      record.lastExternalId,
      record.sync_cursor,
      record.syncCursor,
    ),
    sync_cursor: pickNullableString(record.sync_cursor, record.syncCursor),
    status_map: asStatusMap(record.status_map ?? record.statusMap),
    configured,
    raw: record,
  };
}

export function normalizeExternalQuoteRequest(raw: unknown): ExternalQuoteRequest | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;

  const id = pickString(record.id);
  const externalId = pickString(record.external_id, record.externalId, record.remote_id);
  if (!id && !externalId) return null;

  const message = pickNullableString(
    record.message,
    record.remarks,
    record.notes,
    record.body,
    record.inquiry,
  );
  const commodity = pickNullableString(
    record.commodity,
    record.cargo,
    record.product,
    record.goods,
  );

  const customer = normalizeCustomer(record.customer, record);
  const items = normalizeLineItems(record.items ?? record.line_items ?? record.lineItems);
  const remote =
    asRawJson(record.remote) ??
    asRawJson(record.raw_json ?? record.rawJson ?? record.payload);

  return {
    id: id || externalId,
    tenant_id: pickNullableString(record.tenant_id, record.tenantId),
    external_id: externalId || id,
    contact_name: pickNullableString(
      record.contact_name,
      record.contactName,
      record.name,
      record.customer_name,
      customer.name,
    ),
    contact_email: pickNullableString(
      record.contact_email,
      record.contactEmail,
      record.email,
      customer.email,
    ),
    contact_phone: pickNullableString(
      record.contact_phone,
      record.contactPhone,
      record.phone,
      record.mobile,
      customer.phone,
    ),
    company_name: pickNullableString(
      record.company_name,
      record.companyName,
      customer.company,
    ),
    message,
    commodity,
    status: pickNullableString(record.status, record.state),
    submitted_at: pickNullableString(
      record.submitted_at,
      record.submittedAt,
      record.created_at,
      record.createdAt,
    ),
    company_id: pickNullableString(record.company_id, record.companyId),
    lead_id: pickNullableString(record.lead_id, record.leadId),
    enquiry_id: pickNullableString(record.enquiry_id, record.enquiryId),
    party_id: pickNullableString(record.party_id, record.partyId),
    last_synced_at: pickNullableString(record.last_synced_at, record.lastSyncedAt),
    status_pushed_at: pickNullableString(record.status_pushed_at, record.statusPushedAt),
    sync_error: pickNullableString(record.sync_error, record.syncError),
    status_push_pending:
      pickBoolean(
        record.pending_status_push,
        record.pendingStatusPush,
        record.status_push_pending,
        record.statusPushPending,
        record.push_pending,
        record.pushPending,
      ) ?? false,
    remote_status_at_pull: pickNullableString(
      record.remote_status_at_pull,
      record.remoteStatusAtPull,
    ),
    created_at: pickNullableString(record.created_at, record.createdAt),
    updated_at: pickNullableString(record.updated_at, record.updatedAt),
    deleted_at: pickNullableString(record.deleted_at, record.deletedAt),
    raw_json: asRawJson(record.raw_json ?? record.rawJson ?? record.payload) ?? remote,
    reference: pickNullableString(record.reference, record.ref, record.quote_ref),
    source: pickNullableString(record.source, record.source_code, record.sourceCode),
    source_label: pickNullableString(
      record.source_label,
      record.sourceLabel,
      record.source_name,
      record.sourceName,
    ),
    software_ref: pickNullableString(
      record.software_ref,
      record.softwareRef,
      record.so_number,
      record.soNumber,
    ),
    synced: pickBoolean(record.synced, record.is_synced, record.isSynced) ?? null,
    page_url: pickNullableString(record.page_url, record.pageUrl, record.storefront_url),
    admin_url: pickNullableString(record.admin_url, record.adminUrl, record.wp_admin_url),
    customer,
    items,
    service: record.service ?? record.service_inquiry ?? record.serviceInquiry ?? null,
    remote,
    raw: record,
  };
}

export function normalizeQuoteRequestList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): QuoteRequestListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'data', 'quote_requests']);
  const normalized = items
    .map((item) => normalizeExternalQuoteRequest(item))
    .filter((item): item is ExternalQuoteRequest => Boolean(item));
  const pagination = normalizeMeta(meta ?? asRecord(unwrapData(raw)), normalized.length, params);
  return {
    items: normalized,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export function normalizeQuoteRequestSyncRun(raw: unknown): QuoteRequestSyncRun | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.run_id, record.runId);
  if (!id) return null;
  return {
    id,
    started_at: pickNullableString(record.started_at, record.startedAt),
    finished_at: pickNullableString(record.finished_at, record.finishedAt),
    fetched: pickNumber(record.fetched, record.fetch_count, record.fetchCount) ?? 0,
    upserted: pickNumber(record.upserted, record.upsert_count, record.upsertCount) ?? 0,
    failed: pickNumber(record.failed, record.fail_count, record.failCount) ?? 0,
    error_summary: pickNullableString(
      record.error_summary,
      record.errorSummary,
      record.error,
      record.message,
    ),
    raw: record,
  };
}

export function normalizeQuoteRequestSyncRunList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): QuoteRequestSyncRunListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'data', 'sync_runs', 'runs']);
  const normalized = items
    .map((item) => normalizeQuoteRequestSyncRun(item))
    .filter((item): item is QuoteRequestSyncRun => Boolean(item));
  const pagination = normalizeMeta(meta ?? asRecord(unwrapData(raw)), normalized.length, params);
  return {
    items: normalized,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export function normalizeQuoteRequestHealth(raw: unknown): QuoteRequestHealthResult {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const nested = asRecord(record.health) ?? asRecord(record.result) ?? record;
  const ok =
    pickBoolean(nested.ok, nested.healthy, nested.success, record.ok, record.healthy) ?? false;
  return {
    ok,
    message: pickNullableString(
      nested.message,
      nested.error,
      nested.detail,
      record.message,
      record.error,
    ),
    raw: record,
  };
}

export function normalizeQuoteRequestSyncResult(raw: unknown): QuoteRequestSyncResult {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    fetched: pickNumber(record.fetched, record.fetch_count),
    upserted: pickNumber(record.upserted, record.upsert_count),
    failed: pickNumber(record.failed, record.fail_count),
    run_id: pickNullableString(record.run_id, record.runId, record.id) ?? undefined,
    message: pickNullableString(record.message, record.summary, record.error),
    raw: record,
  };
}

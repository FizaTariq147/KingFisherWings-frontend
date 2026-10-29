import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  ExternalQuoteRequest,
  QuoteRequestConnection,
  QuoteRequestHealthResult,
  QuoteRequestListResult,
  QuoteRequestProvider,
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

  return {
    id: id || 'connection',
    tenant_id: pickNullableString(record.tenant_id, record.tenantId) ?? undefined,
    provider: (pickString(record.provider, 'KFPP_WP') || 'KFPP_WP') as QuoteRequestProvider,
    base_url: baseUrl,
    api_key_prefix: prefix,
    auth_header_name:
      pickString(record.auth_header_name, record.authHeaderName) || 'X-KFPP-Api-Key',
    is_active: pickBoolean(record.is_active, record.isActive) ?? true,
    last_health_at: pickNullableString(record.last_health_at, record.lastHealthAt),
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

  return {
    id: id || externalId,
    external_id: externalId || id,
    contact_name: pickNullableString(
      record.contact_name,
      record.contactName,
      record.name,
      record.customer_name,
    ),
    contact_email: pickNullableString(
      record.contact_email,
      record.contactEmail,
      record.email,
    ),
    contact_phone: pickNullableString(
      record.contact_phone,
      record.contactPhone,
      record.phone,
      record.mobile,
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
        record.status_push_pending,
        record.statusPushPending,
        record.push_pending,
        record.pushPending,
      ) ?? false,
    raw_json: asRawJson(record.raw_json ?? record.rawJson ?? record.payload),
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

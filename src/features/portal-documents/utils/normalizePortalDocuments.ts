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
  PortalDocumentItem,
  PortalDocumentListResult,
  PortalDocumentPermission,
  PortalDocumentSummary,
} from '../types/portalDocuments.types';

export function normalizeDocumentSummary(raw: unknown): PortalDocumentSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byTypeRaw = asRecord(data.by_type) ?? asRecord(data.byType) ?? {};
  const byType: Record<string, number> = {};
  for (const [k, v] of Object.entries(byTypeRaw)) {
    const n = pickNumber(v);
    if (n !== undefined) byType[k] = n;
  }
  const byTypeTotal = Object.values(byType).reduce((sum, n) => sum + n, 0);
  return {
    total: pickNumber(data.total, data.count) ?? byTypeTotal,
    byType,
    raw: data,
  };
}

export function normalizeDocumentPermission(raw: unknown): PortalDocumentPermission | null {
  const record = asRecord(raw);
  if (!record) return null;
  const documentType = pickString(record.document_type, record.documentType, record.type);
  if (!documentType) return null;
  return {
    documentType,
    canView: pickBoolean(record.can_view, record.canView) ?? true,
    canDownload: pickBoolean(record.can_download, record.canDownload) ?? false,
  };
}

export function normalizeDocumentPermissions(raw: unknown): PortalDocumentPermission[] {
  const data = unwrapData(raw);
  const list = Array.isArray(data)
    ? data
    : (asRecord(data)?.permissions as unknown[]) ||
      (asRecord(data)?.items as unknown[]) ||
      [];
  return (Array.isArray(list) ? list : [])
    .map(normalizeDocumentPermission)
    .filter((p): p is PortalDocumentPermission => Boolean(p));
}

export function normalizeDocumentItem(raw: unknown): PortalDocumentItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.document_id, record.doc_id, record.invoice_id);
  if (!id) return null;
  return {
    id,
    name:
      pickString(
        record.name,
        record.file_name,
        record.filename,
        record.title,
        record.invoice_number,
        record.document_type,
      ) || 'Document',
    source: pickString(record.source, record.document_source) || undefined,
    documentType: pickString(record.portal_document_type, record.document_type, record.documentType) || undefined,
    jobId: pickString(record.job_id, record.jobId) || undefined,
    invoiceId: pickString(record.invoice_id, record.invoiceId) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    canDownload: pickBoolean(record.can_download, record.canDownload) ?? true,
    raw: record,
  };
}

export function normalizeDocumentList(
  raw: unknown,
  params: { page?: number; limit?: number },
): PortalDocumentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'documents', 'data']);
  const normalized = items
    .map(normalizeDocumentItem)
    .filter((d): d is PortalDocumentItem => Boolean(d));
  return {
    items: normalized,
    meta: normalizeMeta(meta, normalized.length, params),
  };
}

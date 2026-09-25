import { portalApiClient } from '@/lib/portalApiClient';
import { unwrapData } from '@/features/portal-shared/normalize';
import { PORTAL_CC_API } from '../api/portalCc.api';
import type {
  PortalCcChecklistItem,
  PortalCcDocument,
  PortalCcDocumentDto,
  PortalCcJobDetail,
  PortalCcJobListItem,
} from '../types/portalCc.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const env = asRecord(raw);
  if (!env) return [];
  if (Array.isArray(env.data)) return env.data;
  const nested = asRecord(env.data) ?? env;
  for (const key of ['items', 'jobs', 'results', 'checklist', 'documents']) {
    if (Array.isArray(nested[key])) return nested[key] as unknown[];
  }
  return [];
}

function normalizeItem(raw: unknown): PortalCcJobListItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id) ?? str(r.job_id);
  if (!id) return null;
  return {
    id,
    job_number: str(r.job_number ?? r.jobNumber),
    status: str(r.status),
    stage: str(r.stage ?? r.cc_stage),
    customer_name: str(r.customer_name ?? r.party_name),
    updated_at: str(r.updated_at ?? r.updatedAt),
  };
}

export const portalCcService = {
  async list(): Promise<PortalCcJobListItem[]> {
    const res = await portalApiClient.get(PORTAL_CC_API.list);
    return unwrapList(res.data)
      .map(normalizeItem)
      .filter((x): x is PortalCcJobListItem => Boolean(x));
  },

  async getById(id: string): Promise<PortalCcJobDetail> {
    const res = await portalApiClient.get(PORTAL_CC_API.byId(id));
    const raw = unwrapData(res.data) ?? res.data;
    const item = normalizeItem(raw);
    if (!item) throw new Error('CC job not found.');
    const r = asRecord(raw) ?? {};
    return { ...item, notes: str(r.notes), raw: r };
  },

  async checklist(id: string): Promise<PortalCcChecklistItem[]> {
    const res = await portalApiClient.get(PORTAL_CC_API.checklist(id));
    const out: PortalCcChecklistItem[] = [];
    for (const row of unwrapList(res.data)) {
      const r = asRecord(row);
      if (!r) continue;
      const itemId = str(r.id);
      if (!itemId) continue;
      out.push({
        id: itemId,
        label: str(r.label ?? r.name ?? r.description),
        code: str(r.code ?? r.doc_code),
        required: r.required === true,
        completed:
          r.completed === true ||
          r.is_complete === true ||
          r.verified === true ||
          r.received === true,
        received: r.received === true,
        verified: r.verified === true,
        status: str(r.status),
      });
    }
    return out;
  },

  async attachDocument(id: string, dto: PortalCcDocumentDto): Promise<PortalCcDocument> {
    const res = await portalApiClient.post(PORTAL_CC_API.documents(id), {
      doc_code: dto.doc_code,
      ...(dto.job_document_id ? { job_document_id: dto.job_document_id } : {}),
    });
    const raw = asRecord(unwrapData(res.data) ?? res.data) ?? {};
    return {
      id: str(raw.id) ?? '',
      doc_code: str(raw.doc_code ?? raw.docCode) ?? dto.doc_code,
      job_document_id: str(raw.job_document_id ?? raw.jobDocumentId) ?? dto.job_document_id,
      file_name: str(raw.file_name ?? raw.fileName),
      document_type: str(raw.document_type ?? raw.documentType ?? raw.doc_code),
      status: str(raw.status),
    };
  },
};

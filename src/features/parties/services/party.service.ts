import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { clampApiListLimit } from '@/lib/apiListLimit';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { postShareEmail, type ShareEmailDto, type ShareEmailResult } from '@/features/shared/share-email';
import { PARTY_API } from '../api/party.api';
import { PARTY_TYPES as PARTY_TYPES_FALLBACK } from '../constants/party.constants';
import { normalizeParties, normalizeParty, normalizePartyAddress, normalizePartyContact } from '../utils/normalizeParty';
import {
  prepareAddressPayload,
  prepareContactPayload,
  preparePartyPayload,
} from '../utils/preparePartyPayload';
import { downloadPartyCsvExport } from '../utils/downloadPartyCsv';
import { preparePartyImportCsvFile } from '../utils/normalizePartyImportCsv';
import { normalizePartyHistory } from '../utils/normalizePartyHistory';
import type {
  CreatePartyAddressDto,
  CreatePartyContactDto,
  CreatePartyDto,
  CreatePartyTypeDto,
  PaginationMeta,
  Party,
  PartyAddress,
  PartyContact,
  PartyHistoryEntry,
  PartyImportResult,
  PartyListParams,
  PartyListResult,
  PartyTypeCatalogItem,
  UpdateCreditStatusDto,
  UpdatePartyAddressDto,
  UpdatePartyContactDto,
  UpdatePartyDto,
} from '../types/party.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(raw: unknown, fallbackTotal: number, params: PartyListParams): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.parties) && nested.parties) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

function normalizeImportResult(raw: unknown): PartyImportResult {
  const unwrapped = unwrapEntity(raw);
  const record = asRecord(unwrapped) ?? asRecord(raw) ?? {};
  const errorsRaw = Array.isArray(record.errors) ? record.errors : [];
  const createdRaw =
    (Array.isArray(record.createdIds) && record.createdIds) ||
    (Array.isArray(record.created_ids) && record.created_ids) ||
    [];
  return {
    total: Number(record.total ?? 0) || 0,
    imported: Number(record.imported ?? record.success ?? 0) || 0,
    failed: Number(record.failed ?? record.failures ?? 0) || 0,
    createdIds: createdRaw.map(String),
    errors: errorsRaw.map((err) => {
      const row = asRecord(err) ?? {};
      return {
        row: Number(row.row ?? 0) || 0,
        message: String(row.message ?? 'Import row failed'),
        code: typeof row.code === 'string' ? row.code : undefined,
      };
    }),
  };
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertPartyId(id?: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid party id.');
}

function buildListQuery(params: PartyListParams): Record<string, string | number> {
  const limit = clampApiListLimit(params.limit, 20);
  const query: Record<string, string | number> = {
    page: Math.max(Number(params.page ?? 1) || 1, 1),
    limit,
    order: params.order ?? 'asc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.party_type) query.party_type = params.party_type;
  if (params.credit_status) query.credit_status = params.credit_status;
  if (params.company_id && isUuid(params.company_id)) query.company_id = params.company_id;
  return query;
}

function extractPartyTypeRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['types', 'items', 'data', 'results', 'party_types']) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
    const nested = asRecord(rec[key]);
    if (nested) {
      for (const nk of ['types', 'items', 'data', 'results']) {
        if (Array.isArray(nested[nk])) return nested[nk] as unknown[];
      }
    }
  }
  return [];
}

function normalizePartyTypeCode(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function normalizePartyTypeList(raw: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const row of extractPartyTypeRows(raw)) {
    const code =
      typeof row === 'string'
        ? normalizePartyTypeCode(row)
        : normalizePartyTypeCode(
            asRecord(row)?.code ??
              asRecord(row)?.value ??
              asRecord(row)?.type ??
              asRecord(row)?.party_type ??
              asRecord(row)?.name ??
              '',
          );
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

function normalizePartyTypeCatalogItem(raw: unknown): PartyTypeCatalogItem | null {
  if (typeof raw === 'string' && raw.trim()) {
    const code = normalizePartyTypeCode(raw);
    if (!code) return null;
    return { code, label: code.replaceAll('_', ' '), is_active: true };
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  const code = normalizePartyTypeCode(
    rec.code ?? rec.value ?? rec.type ?? rec.party_type ?? rec.name,
  );
  if (!code) return null;
  const idRaw = rec.id ?? rec.catalog_id ?? rec.catalogId;
  const id = typeof idRaw === 'string' && idRaw.trim() ? idRaw.trim() : undefined;
  const labelRaw = rec.label ?? rec.name ?? rec.title;
  const label =
    typeof labelRaw === 'string' && labelRaw.trim()
      ? labelRaw.trim()
      : code.replaceAll('_', ' ');
  const is_system =
    typeof rec.is_system === 'boolean'
      ? rec.is_system
      : typeof rec.isSystem === 'boolean'
        ? rec.isSystem
        : undefined;
  const is_active =
    typeof rec.is_active === 'boolean'
      ? rec.is_active
      : typeof rec.isActive === 'boolean'
        ? rec.isActive
        : true;
  return { id, code, label, is_system, is_active };
}

function normalizePartyTypeCatalog(raw: unknown): PartyTypeCatalogItem[] {
  const seen = new Set<string>();
  const out: PartyTypeCatalogItem[] = [];
  for (const item of extractPartyTypeRows(raw)) {
    const row = normalizePartyTypeCatalogItem(item);
    if (!row || seen.has(row.code)) continue;
    if (row.is_active === false) continue;
    seen.add(row.code);
    out.push(row);
  }
  return out;
}

export const partyService = {
  /** GET /parties/types — create/select catalogs (includes Vendor). */
  async listTypes(): Promise<string[]> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(PARTY_API.types));
      const types = normalizePartyTypeList(res.data);
      // Always ensure VENDOR is present even if an older API omits it.
      if (!types.includes('VENDOR')) types.push('VENDOR');
      return types.length ? types : [...PARTY_TYPES_FALLBACK];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /parties/types — richer catalog (id/code/label/is_system/is_active). */
  async listTypeCatalog(): Promise<PartyTypeCatalogItem[]> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(PARTY_API.types));
      const catalog = normalizePartyTypeCatalog(res.data);
      if (!catalog.some((t) => t.code === 'VENDOR')) {
        catalog.push({ code: 'VENDOR', label: 'Vendor', is_system: true, is_active: true });
      }
      if (catalog.length) return catalog;
      return PARTY_TYPES_FALLBACK.map((code) => ({
        code,
        label: code.replaceAll('_', ' '),
        is_system: true,
        is_active: true,
      }));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /parties/types — CreatePartyTypeDto. */
  async createType(dto: CreatePartyTypeDto): Promise<PartyTypeCatalogItem> {
    try {
      const body = {
        code: normalizePartyTypeCode(dto.code),
        label: String(dto.label ?? '').trim() || normalizePartyTypeCode(dto.code).replaceAll('_', ' '),
      };
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(PARTY_API.types, body),
      );
      const row = normalizePartyTypeCatalogItem(unwrapEntity(res.data));
      if (!row) {
        return { code: body.code, label: body.label, is_system: false, is_active: true };
      }
      return row;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** DELETE /parties/types/{id} — soft-deactivate custom type. */
  async deactivateType(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Invalid party type id.');
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(PARTY_API.typeById(id.trim()), {
          validateStatus: (status: number) => status === 204 || (status >= 200 && status < 300),
        }),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async list(params: PartyListParams = {}): Promise<PartyListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(PARTY_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const parties = normalizeParties(items);
      return {
        parties,
        meta: normalizeMeta(meta, parties.length, params),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Party> {
    assertPartyId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<Party> | Party>(PARTY_API.byId(id)),
      );
      const party = normalizeParty(unwrapEntity(res.data));
      if (!party) throw new Error('Party not found.');
      return party;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreatePartyDto): Promise<Party> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          PARTY_API.list,
          preparePartyPayload(dto as Record<string, unknown>),
        ),
      );
      const party = normalizeParty(unwrapEntity(res.data));
      if (!party) throw new Error('Create succeeded but no party was returned.');
      return party;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdatePartyDto): Promise<Party> {
    assertPartyId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          PARTY_API.byId(id),
          preparePartyPayload(dto as Record<string, unknown>),
        ),
      );
      const party = normalizeParty(unwrapEntity(res.data));
      if (!party) throw new Error('Update succeeded but no party was returned.');
      return party;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertPartyId(id);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(PARTY_API.byId(id), {
          validateStatus: (status: number) => status === 204 || (status >= 200 && status < 300),
        }),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async setActive(id: string, is_active: boolean): Promise<Party> {
    return this.update(id, { is_active });
  },

  async updateCreditStatus(id: string, dto: UpdateCreditStatusDto): Promise<Party> {
    assertPartyId(id);
    try {
      const body: Record<string, unknown> = {
        credit_status: dto.credit_status,
      };
      if (dto.reason?.trim()) body.reason = dto.reason.trim();
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(PARTY_API.creditStatus(id), body),
      );
      const party = normalizeParty(unwrapEntity(res.data));
      if (!party) {
        // Some APIs return 200 with empty body — refetch
        return this.getById(id);
      }
      return party;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addContact(partyId: string, dto: CreatePartyContactDto): Promise<PartyContact | null> {
    assertPartyId(partyId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          PARTY_API.contacts(partyId),
          prepareContactPayload(dto as Record<string, unknown>),
        ),
      );
      return normalizePartyContact(unwrapEntity(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateContact(
    partyId: string,
    contactId: string,
    dto: UpdatePartyContactDto,
  ): Promise<PartyContact | null> {
    assertPartyId(partyId);
    assertPartyId(contactId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          PARTY_API.contactById(partyId, contactId),
          prepareContactPayload(dto as Record<string, unknown>),
        ),
      );
      return normalizePartyContact(unwrapEntity(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeContact(partyId: string, contactId: string): Promise<void> {
    assertPartyId(partyId);
    assertPartyId(contactId);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(PARTY_API.contactById(partyId, contactId), {
          validateStatus: (status: number) => status === 204 || (status >= 200 && status < 300),
        }),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addAddress(partyId: string, dto: CreatePartyAddressDto): Promise<PartyAddress | null> {
    assertPartyId(partyId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          PARTY_API.addresses(partyId),
          prepareAddressPayload(dto as Record<string, unknown>),
        ),
      );
      return normalizePartyAddress(unwrapEntity(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateAddress(
    partyId: string,
    addressId: string,
    dto: UpdatePartyAddressDto,
  ): Promise<PartyAddress | null> {
    assertPartyId(partyId);
    assertPartyId(addressId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          PARTY_API.addressById(partyId, addressId),
          prepareAddressPayload(dto as Record<string, unknown>),
        ),
      );
      return normalizePartyAddress(unwrapEntity(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeAddress(partyId: string, addressId: string): Promise<void> {
    assertPartyId(partyId);
    assertPartyId(addressId);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(PARTY_API.addressById(partyId, addressId), {
          validateStatus: (status: number) => status === 204 || (status >= 200 && status < 300),
        }),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async importCsv(file: File): Promise<PartyImportResult> {
    try {
      const prepared = await preparePartyImportCsvFile(file);
      const form = new FormData();
      // Nest FileInterceptor('file') — field name must be exactly `file`.
      form.append('file', prepared, prepared.name || 'parties.csv');
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(PARTY_API.import, form, {
          // Let the browser set multipart boundary; a bare multipart/form-data or
          // application/json Content-Type makes Multer report "No file uploaded".
          transformRequest: [
            (data, headers) => {
              if (headers && typeof headers === 'object' && data instanceof FormData) {
                const h = headers as Record<string, unknown> & {
                  delete?: (key: string) => void;
                };
                delete h['Content-Type'];
                delete h['content-type'];
                h.delete?.('Content-Type');
                h.delete?.('content-type');
              }
              return data;
            },
          ],
          validateStatus: (status) => status === 201 || (status >= 200 && status < 300),
        }),
      );
      return normalizeImportResult(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /parties/export — JSON `{ csv, filename }` (or raw CSV). Uses list filters, not list page. */
  async exportCsv(params: PartyListParams = {}): Promise<void> {
    try {
      await downloadPartyCsvExport(
        PARTY_API.export,
        buildListQuery({
          search: params.search,
          party_type: params.party_type,
          credit_status: params.credit_status,
          company_id: params.company_id,
          order: params.order,
          page: 1,
          limit: 100,
        }),
        'parties.csv',
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /parties/{id}/history */
  async getHistory(id: string): Promise<PartyHistoryEntry[]> {
    assertPartyId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(PARTY_API.history(id)),
      );
      return normalizePartyHistory(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /parties/{id}/credit/summary/send-email */
  async sendCreditSummaryEmail(
    id: string,
    dto: ShareEmailDto = {},
  ): Promise<ShareEmailResult> {
    assertPartyId(id);
    return postShareEmail(axiosInstance, PARTY_API.creditSummarySendEmail(id), dto);
  },
};

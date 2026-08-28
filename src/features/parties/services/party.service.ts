import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { PARTY_API } from '../api/party.api';
import { normalizeParties, normalizeParty, normalizePartyAddress, normalizePartyContact } from '../utils/normalizeParty';
import {
  prepareAddressPayload,
  prepareContactPayload,
  preparePartyPayload,
} from '../utils/preparePartyPayload';
import { downloadPartyCsvExport } from '../utils/downloadPartyCsv';
import { normalizePartyHistory } from '../utils/normalizePartyHistory';
import type {
  CreatePartyAddressDto,
  CreatePartyContactDto,
  CreatePartyDto,
  PaginationMeta,
  Party,
  PartyAddress,
  PartyContact,
  PartyHistoryEntry,
  PartyImportResult,
  PartyListParams,
  PartyListResult,
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
  const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), 100);
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

export const partyService = {
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
      const form = new FormData();
      form.append('file', file);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(PARTY_API.import, form),
      );
      const raw = unwrapEntity(res.data);
      const record = asRecord(raw) ?? {};
      const errorsRaw = Array.isArray(record.errors) ? record.errors : [];
      return {
        total: Number(record.total ?? 0) || 0,
        imported: Number(record.imported ?? 0) || 0,
        failed: Number(record.failed ?? 0) || 0,
        createdIds: Array.isArray(record.createdIds)
          ? record.createdIds.map(String)
          : Array.isArray(record.created_ids)
            ? (record.created_ids as unknown[]).map(String)
            : [],
        errors: errorsRaw.map((err) => {
          const row = asRecord(err) ?? {};
          return {
            row: Number(row.row ?? 0) || 0,
            message: String(row.message ?? 'Import row failed'),
            code: typeof row.code === 'string' ? row.code : undefined,
          };
        }),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /parties/export — CSV with same filters as list. */
  async exportCsv(params: PartyListParams = {}): Promise<void> {
    try {
      await downloadPartyCsvExport(
        PARTY_API.export,
        buildListQuery(params),
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
};

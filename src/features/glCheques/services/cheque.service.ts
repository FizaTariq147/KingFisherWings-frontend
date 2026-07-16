import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CHEQUE_API } from '../api/cheque.api';
import { normalizeCheque, normalizeCheques } from '../utils/normalizeCheque';
import {
  prepareBounceChequePayload,
  prepareCreateChequePayload,
  prepareUpdateChequePayload,
} from '../utils/prepareChequePayload';
import type {
  BounceChequeDto,
  ChequeListParams,
  ChequeListResult,
  CreateChequeDto,
  GlCheque,
  PdcDueReportParams,
  PdcDueReportResult,
  UpdateChequeDto,
} from '../types/cheque.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickArray(...candidates: unknown[]): unknown[] | null {
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named = pickArray(
    envelope.items,
    envelope.results,
    envelope.cheques,
    envelope.data,
    envelope.rows,
  );
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      pickArray(nested.items, nested.results, nested.cheques, nested.rows, nested.data) ?? []
    );
  }
  return [];
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  if ('data' in envelope) {
    const data = envelope.data;
    const nested = asRecord(data);
    if (nested && (nested.id || nested.cheque_id)) return data;
    if (nested?.cheque) return nested.cheque;
    return data;
  }
  if (envelope.cheque) return envelope.cheque;
  return raw;
}

function extractId(raw: unknown): string | null {
  const stack: unknown[] = [raw, unwrapEntity(raw)];
  const seen = new Set<unknown>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const key of ['id', 'cheque_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.cheque, rec.result]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  const raw =
    (Array.isArray(message) ? message.map(String).join('; ') : undefined) ||
    (typeof message === 'string' ? message : undefined) ||
    (typeof data?.error === 'string' ? data.error : undefined) ||
    axiosErr.message ||
    'Request failed';

  if (/only pending|must be pending/i.test(raw)) {
    return new Error(`${raw} Only pending cheques can be edited.`);
  }
  return new Error(raw);
}

function assertId(id: string, label = 'cheque'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: ChequeListParams): Record<string, string | boolean> {
  const query: Record<string, string | boolean> = {};
  if (params.cheque_type) query.cheque_type = params.cheque_type;
  if (params.status) query.status = params.status;
  if (params.party_id && isUuid(params.party_id)) query.party_id = params.party_id;
  if (params.is_pdc != null) query.is_pdc = params.is_pdc;
  if (params.due_before?.trim()) query.due_before = params.due_before.trim();
  return query;
}

export const chequeService = {
  async list(params: ChequeListParams = {}): Promise<ChequeListResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHEQUE_API.list, {
          params: buildListQuery(params),
        }),
      );
      return { cheques: normalizeCheques(unwrapList(data)) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getPdcDue(params: PdcDueReportParams = {}): Promise<PdcDueReportResult> {
    try {
      const query: Record<string, number> = {};
      if (params.within_days != null && Number.isFinite(params.within_days)) {
        query.within_days = params.within_days;
      }
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHEQUE_API.pdcDue, { params: query }),
      );
      return { cheques: normalizeCheques(unwrapList(data)) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<GlCheque> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHEQUE_API.byId(id)),
      );
      const cheque = normalizeCheque(unwrapEntity(data));
      if (!cheque) throw new Error('Cheque not found.');
      return cheque;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateChequeDto): Promise<GlCheque> {
    const payload = prepareCreateChequePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHEQUE_API.create, payload),
      );
      const created = normalizeCheque(unwrapEntity(data));
      if (created) return created;
      const id = extractId(data);
      if (id) return chequeService.getById(id);
      throw new Error('Create succeeded but cheque could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateChequeDto): Promise<GlCheque> {
    assertId(id);
    const payload = prepareUpdateChequePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<unknown> | unknown>(CHEQUE_API.byId(id), payload),
      );
      const updated = normalizeCheque(unwrapEntity(data));
      if (updated) return updated;
      return chequeService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deposit(id: string): Promise<GlCheque> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHEQUE_API.deposit(id)),
      );
      const result = normalizeCheque(unwrapEntity(data));
      if (result) return result;
      return chequeService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async clear(id: string): Promise<GlCheque> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHEQUE_API.clear(id)),
      );
      const result = normalizeCheque(unwrapEntity(data));
      if (result) return result;
      return chequeService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async bounce(id: string, dto: BounceChequeDto = {}): Promise<GlCheque> {
    assertId(id);
    const payload = prepareBounceChequePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHEQUE_API.bounce(id), payload),
      );
      const result = normalizeCheque(unwrapEntity(data));
      if (result) return result;
      return chequeService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async cancel(id: string): Promise<GlCheque> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHEQUE_API.cancel(id)),
      );
      const result = normalizeCheque(unwrapEntity(data));
      if (result) return result;
      return chequeService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { VOUCHER_API } from '../api/voucher.api';
import {
  normalizeVoucher,
  normalizeVoucherLine,
  normalizeVouchers,
} from '../utils/normalizeVoucher';
import {
  prepareVoucherLinePayload,
  prepareVoucherLineUpdatePayload,
  prepareVoucherPayload,
  prepareVoucherUpdatePayload,
} from '../utils/prepareVoucherPayload';
import type {
  CreateVoucherDto,
  CreateVoucherLineDto,
  UpdateVoucherDto,
  UpdateVoucherLineDto,
  Voucher,
  VoucherLine,
  VoucherListParams,
  VoucherListResult,
} from '../types/voucher.types';

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
    envelope.vouchers,
    envelope.data,
    envelope.rows,
  );
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      pickArray(
        nested.items,
        nested.results,
        nested.vouchers,
        nested.rows,
        nested.data,
      ) ?? []
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
    if (nested && (nested.id || nested.voucher_id)) return data;
    if (nested?.voucher) return nested.voucher;
    return data;
  }
  if (envelope.voucher) return envelope.voucher;
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
    for (const key of ['id', 'voucher_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.voucher, rec.result]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: {
      status?: number;
      data?: { message?: string | string[]; error?: string };
    };
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

  if (/no active number format.*voucher/i.test(raw)) {
    return new Error(
      `${raw} Go to Organization → Number Formats and create an active format for document type VOUCHER, then retry.`,
    );
  }
  if (/not balanced|unbalanced|debits?.*(must|equal).*credits?/i.test(raw)) {
    return new Error(`${raw} Ensure total debit equals total credit before posting.`);
  }
  if (/only draft|must be draft/i.test(raw)) {
    return new Error(`${raw} Only draft vouchers can be edited or deleted.`);
  }
  return new Error(raw);
}

function assertId(id: string, label = 'voucher'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: VoucherListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.voucher_type) query.voucher_type = params.voucher_type;
  if (params.status) query.status = params.status;
  if (params.party_id && isUuid(params.party_id)) query.party_id = params.party_id;
  if (params.job_id && isUuid(params.job_id)) query.job_id = params.job_id;
  if (params.from_date?.trim()) query.from_date = params.from_date.trim();
  if (params.to_date?.trim()) query.to_date = params.to_date.trim();
  if (params.search?.trim()) query.search = params.search.trim();
  return query;
}

export const voucherService = {
  async list(params: VoucherListParams = {}): Promise<VoucherListResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(VOUCHER_API.list, {
          params: buildListQuery(params),
        }),
      );
      return { vouchers: normalizeVouchers(unwrapList(data)) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Voucher> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(VOUCHER_API.byId(id)),
      );
      const voucher = normalizeVoucher(unwrapEntity(data));
      if (!voucher) throw new Error('Voucher not found.');
      return voucher;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const payload = prepareVoucherPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(VOUCHER_API.create, payload),
      );
      const created = normalizeVoucher(unwrapEntity(data));
      if (created) return created;
      const id = extractId(data);
      if (id) return voucherService.getById(id);
      throw new Error('Create succeeded but voucher could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateVoucherDto): Promise<Voucher> {
    assertId(id);
    const payload = prepareVoucherUpdatePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<unknown> | unknown>(VOUCHER_API.byId(id), payload),
      );
      const updated = normalizeVoucher(unwrapEntity(data));
      if (updated) return updated;
      return voucherService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(VOUCHER_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addLine(id: string, dto: CreateVoucherLineDto): Promise<VoucherLine> {
    assertId(id);
    const payload = prepareVoucherLinePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(VOUCHER_API.lines(id), payload),
      );
      const line = normalizeVoucherLine(unwrapEntity(data));
      if (line) return line;
      throw new Error('Line created but could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateLine(
    id: string,
    lineId: string,
    dto: UpdateVoucherLineDto,
  ): Promise<VoucherLine> {
    assertId(id);
    assertId(lineId, 'line');
    const payload = prepareVoucherLineUpdatePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<unknown> | unknown>(
          VOUCHER_API.lineById(id, lineId),
          payload,
        ),
      );
      const line = normalizeVoucherLine(unwrapEntity(data));
      if (line) return line;
      throw new Error('Line updated but could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeLine(id: string, lineId: string): Promise<void> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(VOUCHER_API.lineById(id, lineId)),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<Voucher> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(VOUCHER_API.post(id)),
      );
      const posted = normalizeVoucher(unwrapEntity(data));
      if (posted) return posted;
      return voucherService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reverse(id: string): Promise<Voucher> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(VOUCHER_API.reverse(id)),
      );
      const reversed = normalizeVoucher(unwrapEntity(data));
      if (reversed) return reversed;
      const newId = extractId(data);
      if (newId) return voucherService.getById(newId);
      return voucherService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

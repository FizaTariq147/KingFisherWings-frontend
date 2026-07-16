import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { isUuid } from '@/lib/isUuid';
import { BANK_RECON_API } from '../api/bankReconciliation.api';
import type {
  BankReconciliation,
  BankReconciliationLine,
  BankReconciliationListParams,
  BankTransferDto,
  CreateBankReconciliationDto,
  CreateBankReconciliationLineDto,
  UpdateBankReconciliationDto,
  UpdateBankReconciliationLineDto,
} from '../types/bankReconciliation.types';
import {
  normalizeBankReconciliation,
  normalizeBankReconciliationLine,
  normalizeBankReconciliations,
} from '../utils/normalizeBankReconciliation';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const r = asRecord(raw);
  if (!r) return [];
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.data)) return r.data;
  const d = asRecord(r.data);
  if (d && Array.isArray(d.items)) return d.items;
  return [];
}

function unwrapEntity(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r) return raw;
  if (r.data) return r.data;
  return raw;
}

function assertId(id: string, label: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function formatAxiosError(error: unknown): Error {
  const e = error as { response?: { data?: { message?: string | string[]; error?: string } }; message?: string };
  const msg = e.response?.data?.message;
  const parsed =
    (Array.isArray(msg) ? msg.map(String).join('; ') : undefined) ||
    (typeof msg === 'string' ? msg : undefined) ||
    e.response?.data?.error ||
    e.message ||
    'Request failed';
  return new Error(parsed);
}

export const bankReconciliationService = {
  async createTransfer(dto: BankTransferDto): Promise<Record<string, unknown>> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(BANK_RECON_API.transfers, dto),
      );
      return (asRecord(unwrapEntity(data)) ?? {}) as Record<string, unknown>;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async list(params: BankReconciliationListParams = {}): Promise<BankReconciliation[]> {
    try {
      const query: Record<string, string> = {};
      if (params.status) query.status = params.status;
      if (params.gl_account_id && isUuid(params.gl_account_id)) {
        query.gl_account_id = params.gl_account_id;
      }
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get(BANK_RECON_API.list, { params: query }),
      );
      return normalizeBankReconciliations(unwrapList(data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateBankReconciliationDto): Promise<BankReconciliation> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(BANK_RECON_API.create, dto),
      );
      const entity = normalizeBankReconciliation(unwrapEntity(data));
      if (!entity) throw new Error('Failed to parse bank reconciliation.');
      return entity;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<BankReconciliation> {
    assertId(id, 'reconciliation');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get(BANK_RECON_API.byId(id)),
      );
      const entity = normalizeBankReconciliation(unwrapEntity(data));
      if (!entity) throw new Error('Bank reconciliation not found.');
      return entity;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateBankReconciliationDto): Promise<BankReconciliation> {
    assertId(id, 'reconciliation');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch(BANK_RECON_API.byId(id), dto),
      );
      const entity = normalizeBankReconciliation(unwrapEntity(data));
      if (!entity) return this.getById(id);
      return entity;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async cancel(id: string): Promise<void> {
    assertId(id, 'reconciliation');
    try {
      await withGatewayRetry(() => axiosInstance.delete(BANK_RECON_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listUnmatched(id: string): Promise<BankReconciliationLine[]> {
    assertId(id, 'reconciliation');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get(BANK_RECON_API.unmatched(id)),
      );
      return unwrapList(data)
        .map(normalizeBankReconciliationLine)
        .filter((x): x is BankReconciliationLine => Boolean(x));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addLine(id: string, dto: CreateBankReconciliationLineDto): Promise<BankReconciliationLine> {
    assertId(id, 'reconciliation');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(BANK_RECON_API.lines(id), dto),
      );
      const line = normalizeBankReconciliationLine(unwrapEntity(data));
      if (!line) throw new Error('Failed to parse reconciliation line.');
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateLine(
    id: string,
    lineId: string,
    dto: UpdateBankReconciliationLineDto,
  ): Promise<BankReconciliationLine> {
    assertId(id, 'reconciliation');
    assertId(lineId, 'line');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch(BANK_RECON_API.lineById(id, lineId), dto),
      );
      const line = normalizeBankReconciliationLine(unwrapEntity(data));
      if (!line) throw new Error('Failed to parse reconciliation line.');
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeLine(id: string, lineId: string): Promise<void> {
    assertId(id, 'reconciliation');
    assertId(lineId, 'line');
    try {
      await withGatewayRetry(() => axiosInstance.delete(BANK_RECON_API.lineById(id, lineId)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async complete(id: string): Promise<BankReconciliation> {
    assertId(id, 'reconciliation');
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(BANK_RECON_API.complete(id)),
      );
      const entity = normalizeBankReconciliation(unwrapEntity(data));
      if (!entity) return this.getById(id);
      return entity;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

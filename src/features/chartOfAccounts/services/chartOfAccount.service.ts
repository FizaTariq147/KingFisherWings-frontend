import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CHART_OF_ACCOUNT_API } from '../api/chartOfAccount.api';
import {
  normalizeChartOfAccount,
  normalizeChartOfAccounts,
  normalizeChartOfAccountTree,
} from '../utils/normalizeChartOfAccount';
import {
  prepareChartOfAccountPayload,
  prepareChartOfAccountUpdatePayload,
} from '../utils/prepareChartOfAccountPayload';
import type {
  AccountLedgerParams,
  AccountLedgerResult,
  ChartOfAccount,
  ChartOfAccountListParams,
  ChartOfAccountListResult,
  ChartOfAccountTreeNode,
  CreateChartOfAccountDto,
  TrialBalanceParams,
  TrialBalanceResult,
  UpdateChartOfAccountDto,
} from '../types/chartOfAccount.types';

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
    envelope.accounts,
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
        nested.accounts,
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
    if (nested && (nested.id || nested.account_id)) return data;
    if (nested?.account) return nested.account;
    return data;
  }
  if (envelope.account) return envelope.account;
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
    for (const key of ['id', 'account_id', 'gl_account_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.account, rec.result]) {
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

  if (/gl\.manage_coa|missing required permission/i.test(raw)) {
    return new Error(
      /gl\.manage_coa/i.test(raw)
        ? 'Missing required permission: gl.manage_coa. Your login role cannot create or change Chart of Accounts. Ask a Tenant Admin to grant “Manage Chart of Accounts” (gl.manage_coa) on your role, then sign out and sign back in.'
        : `${raw} Ask a Tenant Admin to update your role permissions, then sign out and sign back in.`,
    );
  }
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  const status = axiosErr.response?.status;
  if (status === 409) {
    return new Error('Account code already exists or conflict with existing account.');
  }
  if (status === 403) {
    return new Error(
      raw ||
        'Forbidden. Your role is missing a required GL permission (for example gl.manage_coa).',
    );
  }
  if (status) return new Error(`Request failed (${status})`);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid account id.');
}

function buildListQuery(params: ChartOfAccountListParams): Record<string, string | boolean> {
  const query: Record<string, string | boolean> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.account_group) query.account_group = params.account_group;
  if (params.account_type) query.account_type = params.account_type;
  if (typeof params.is_postable === 'boolean') query.is_postable = params.is_postable;
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

function unwrapLines(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named = pickArray(
    envelope.lines,
    envelope.items,
    envelope.results,
    envelope.data,
    envelope.rows,
    envelope.entries,
    envelope.ledger,
  );
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      pickArray(
        nested.lines,
        nested.items,
        nested.results,
        nested.rows,
        nested.entries,
        nested.ledger,
        nested.data,
      ) ?? []
    );
  }
  return [];
}

export const chartOfAccountService = {
  async list(params: ChartOfAccountListParams = {}): Promise<ChartOfAccountListResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.list, {
          params: buildListQuery(params),
        }),
      );
      const accounts = normalizeChartOfAccounts(unwrapList(data));
      return { accounts };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<ChartOfAccount> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.byId(id)),
      );
      const account = normalizeChartOfAccount(unwrapEntity(data));
      if (!account) throw new Error('Account not found.');
      return account;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateChartOfAccountDto): Promise<ChartOfAccount> {
    const payload = prepareChartOfAccountPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(
          CHART_OF_ACCOUNT_API.create,
          payload,
        ),
      );
      const created = normalizeChartOfAccount(unwrapEntity(data));
      if (created) return created;
      const id = extractId(data);
      if (id) return chartOfAccountService.getById(id);
      throw new Error('Create succeeded but account could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateChartOfAccountDto): Promise<ChartOfAccount> {
    assertId(id);
    const payload = prepareChartOfAccountUpdatePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<unknown> | unknown>(
          CHART_OF_ACCOUNT_API.byId(id),
          payload,
        ),
      );
      const updated = normalizeChartOfAccount(unwrapEntity(data));
      if (updated) return updated;
      return chartOfAccountService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(CHART_OF_ACCOUNT_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getTree(): Promise<ChartOfAccountTreeNode[]> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.tree),
      );
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(asRecord(data)?.data)
          ? (asRecord(data)!.data as unknown[])
          : unwrapList(data);
      return normalizeChartOfAccountTree(raw);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getTrialBalance(params: TrialBalanceParams = {}): Promise<TrialBalanceResult> {
    const query: Record<string, string | boolean> = {};
    if (params.from_date?.trim()) query.from_date = params.from_date.trim();
    if (params.to_date?.trim()) query.to_date = params.to_date.trim();
    if (typeof params.hide_zero === 'boolean') query.hide_zero = params.hide_zero;
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.trialBalance, {
          params: query,
        }),
      );
      const lines = unwrapLines(data).map((row) => {
        const r = asRecord(row) ?? {};
        return {
          ...r,
          account_id: typeof r.account_id === 'string' ? r.account_id : undefined,
          account_code:
            typeof r.account_code === 'string'
              ? r.account_code
              : typeof r.code === 'string'
                ? r.code
                : undefined,
          account_name:
            typeof r.account_name === 'string'
              ? r.account_name
              : typeof r.name === 'string'
                ? r.name
                : undefined,
          account_group: typeof r.account_group === 'string' ? r.account_group : undefined,
          debit: Number(r.debit ?? r.total_debit ?? 0) || 0,
          credit: Number(r.credit ?? r.total_credit ?? 0) || 0,
          balance: Number(r.balance ?? 0) || 0,
        };
      });
      return { lines, raw: data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async seedDefaults(): Promise<ChartOfAccount[]> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.seedDefaults),
      );
      const list = unwrapList(data);
      const accounts = normalizeChartOfAccounts(list);
      if (accounts.length) return accounts;
      const single = normalizeChartOfAccount(unwrapEntity(data));
      return single ? [single] : [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getLedger(id: string, params: AccountLedgerParams = {}): Promise<AccountLedgerResult> {
    assertId(id);
    const query: Record<string, string> = {};
    if (params.from_date?.trim()) query.from_date = params.from_date.trim();
    if (params.to_date?.trim()) query.to_date = params.to_date.trim();
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(CHART_OF_ACCOUNT_API.ledger(id), {
          params: query,
        }),
      );
      const lines = unwrapLines(data).map((row) => {
        const r = asRecord(row) ?? {};
        return {
          ...r,
          id: typeof r.id === 'string' ? r.id : undefined,
          voucher_id: typeof r.voucher_id === 'string' ? r.voucher_id : undefined,
          voucher_number:
            typeof r.voucher_number === 'string'
              ? r.voucher_number
              : typeof r.number === 'string'
                ? r.number
                : undefined,
          voucher_date:
            typeof r.voucher_date === 'string'
              ? r.voucher_date
              : typeof r.date === 'string'
                ? r.date
                : undefined,
          description:
            typeof r.description === 'string'
              ? r.description
              : typeof r.narration === 'string'
                ? r.narration
                : undefined,
          debit: Number(r.debit ?? 0) || 0,
          credit: Number(r.credit ?? 0) || 0,
          balance: Number(r.balance ?? 0) || 0,
        };
      });
      return { lines, raw: data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

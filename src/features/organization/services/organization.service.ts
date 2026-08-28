import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { ORGANIZATION_API } from '../api/organization.api';
import type {
  BankAccountFormValues,
  BankAccountListParams,
  BankAccountListResult,
  CreateNumberFormatDto,
  NumberFormat,
  NumberFormatFormValues,
  NumberFormatPreview,
  OrganizationProfile,
  OrganizationProfileFormValues,
  TenantBankAccount,
  UpdateNumberFormatDto,
} from '../types/organization.types';
import {
  normalizeBankAccount,
  normalizeBankAccounts,
  normalizeNumberFormat,
  normalizeNumberFormatPreview,
  normalizeNumberFormats,
  normalizeOrganizationProfile,
  normalizePaginationMeta,
  synthesizeNumberFormatPreview,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeOrganization';
import {
  prepareBankAccountPayload,
  prepareBankAccountUpdatePayload,
  prepareNumberFormatCreatePayload,
  prepareNumberFormatUpdatePayload,
  prepareProfilePayload,
} from '../utils/prepareOrganizationPayload';

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

function assertId(id?: string, label = 'id'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label}.`);
}

function buildBankListQuery(params: BankAccountListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    order: params.order ?? 'asc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

export const organizationService = {
  async getProfile(): Promise<OrganizationProfile> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.profile),
      );
      return normalizeOrganizationProfile(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateProfile(values: OrganizationProfileFormValues): Promise<OrganizationProfile> {
    try {
      const payload = prepareProfilePayload(values);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(ORGANIZATION_API.profile, payload),
      );
      return normalizeOrganizationProfile(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listBankAccounts(params: BankAccountListParams = {}): Promise<BankAccountListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.bankAccounts, {
          params: buildBankListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const accounts = normalizeBankAccounts(items);
      return {
        accounts,
        meta: normalizePaginationMeta(
          meta,
          accounts.length,
          params.page ?? 1,
          params.limit ?? 20,
        ),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getBankAccount(id: string): Promise<TenantBankAccount> {
    assertId(id, 'bank account id');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.bankAccountById(id)),
      );
      return normalizeBankAccount(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createBankAccount(values: BankAccountFormValues): Promise<TenantBankAccount> {
    try {
      const payload = prepareBankAccountPayload(values);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(ORGANIZATION_API.bankAccounts, payload),
      );
      return normalizeBankAccount(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateBankAccount(
    id: string,
    values: Partial<BankAccountFormValues>,
  ): Promise<TenantBankAccount> {
    assertId(id, 'bank account id');
    try {
      const payload = prepareBankAccountUpdatePayload(values);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(ORGANIZATION_API.bankAccountById(id), payload),
      );
      return normalizeBankAccount(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteBankAccount(id: string): Promise<void> {
    assertId(id, 'bank account id');
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(ORGANIZATION_API.bankAccountById(id)),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async setBankAccountActive(id: string, is_active: boolean): Promise<TenantBankAccount> {
    return this.updateBankAccount(id, { is_active });
  },

  async listNumberFormats(): Promise<NumberFormat[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.numberFormats),
      );
      const { items } = unwrapList(res.data);
      if (items.length) return normalizeNumberFormats(items);
      // Some APIs return a bare array or single object under data
      const entity = unwrapEntity(res.data);
      if (Array.isArray(entity)) return normalizeNumberFormats(entity);
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getNumberFormat(documentType: string): Promise<NumberFormat> {
    if (!documentType?.trim()) throw new Error('Document type is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.numberFormatByType(documentType)),
      );
      return normalizeNumberFormat(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createNumberFormat(values: NumberFormatFormValues): Promise<NumberFormat> {
    try {
      const payload: CreateNumberFormatDto = prepareNumberFormatCreatePayload(values);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(ORGANIZATION_API.numberFormats, payload),
      );
      return normalizeNumberFormat(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateNumberFormat(
    documentType: string,
    values: Partial<NumberFormatFormValues>,
  ): Promise<NumberFormat> {
    if (!documentType?.trim()) throw new Error('Document type is required.');
    try {
      const payload: UpdateNumberFormatDto = prepareNumberFormatUpdatePayload(values);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          ORGANIZATION_API.numberFormatByType(documentType),
          payload,
        ),
      );
      return normalizeNumberFormat(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async previewNumberFormat(documentType: string): Promise<NumberFormatPreview> {
    if (!documentType?.trim()) throw new Error('Document type is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ORGANIZATION_API.numberFormatPreview(documentType)),
      );
      const normalized = normalizeNumberFormatPreview(res.data);
      if (normalized.preview) return normalized;

      // Fallback: API sometimes returns {} / unexpected shape — build from saved format.
      try {
        const format = await this.getNumberFormat(documentType);
        const synthesized = synthesizeNumberFormatPreview(format);
        if (synthesized) {
          return {
            preview: synthesized,
            document_type: format.document_type || documentType,
            next_sequence: Math.max(1, Number(format.current_sequence ?? 0) + 1),
          };
        }
      } catch {
        /* ignore fallback errors */
      }
      return normalized;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

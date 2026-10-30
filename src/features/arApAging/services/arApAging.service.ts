import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { postShareEmail, type ShareEmailDto, type ShareEmailResult } from '@/features/shared/share-email';
import { AR_AP_AGING_API } from '../api/arApAging.api';
import {
  normalizeAgingReport,
  normalizeOpenItemsReport,
  normalizeStatementReport,
} from '../utils/normalizeArApAging';
import type {
  AgingReportParams,
  AgingReportResult,
  OpenItemsParams,
  OpenItemsResult,
  StatementReportParams,
  StatementReportResult,
} from '../types/arApAging.types';

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
  return new Error(raw);
}

function buildQuery(params: AgingReportParams | StatementReportParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.as_of?.trim()) query.as_of = params.as_of.trim();
  if (params.party_id && isUuid(params.party_id)) query.party_id = params.party_id;
  if (params.company_id && isUuid(params.company_id)) query.company_id = params.company_id;
  return query;
}

function assertPartyId(partyId: string): asserts partyId is string {
  if (!partyId || !isUuid(partyId)) throw new Error('Invalid party id.');
}

export const arApAgingService = {
  async getArAging(params: AgingReportParams = {}): Promise<AgingReportResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(AR_AP_AGING_API.arAging, {
          params: buildQuery(params),
        }),
      );
      const normalized = normalizeAgingReport(data);
      return { ...normalized, raw: data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getApAging(params: AgingReportParams = {}): Promise<AgingReportResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(AR_AP_AGING_API.apAging, {
          params: buildQuery(params),
        }),
      );
      const normalized = normalizeAgingReport(data);
      return { ...normalized, raw: data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getArStatement(
    partyId: string,
    params: StatementReportParams = {},
  ): Promise<StatementReportResult> {
    assertPartyId(partyId);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(
          AR_AP_AGING_API.arStatement(partyId),
          { params: buildQuery(params) },
        ),
      );
      return normalizeStatementReport(data, partyId);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getApStatement(
    partyId: string,
    params: StatementReportParams = {},
  ): Promise<StatementReportResult> {
    assertPartyId(partyId);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(
          AR_AP_AGING_API.apStatement(partyId),
          { params: buildQuery(params) },
        ),
      );
      return normalizeStatementReport(data, partyId);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getArOpenItems(params: OpenItemsParams): Promise<OpenItemsResult> {
    if (!isUuid(params.party_id)) throw new Error('party_id must be a valid UUID.');
    try {
      const query: Record<string, string> = { party_id: params.party_id };
      if (params.company_id && isUuid(params.company_id)) {
        query.company_id = params.company_id;
      }
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(AR_AP_AGING_API.arOpenItems, {
          params: query,
        }),
      );
      return normalizeOpenItemsReport(data, params.party_id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getApOpenItems(params: OpenItemsParams): Promise<OpenItemsResult> {
    if (!isUuid(params.party_id)) throw new Error('party_id must be a valid UUID.');
    try {
      const query: Record<string, string> = { party_id: params.party_id };
      if (params.company_id && isUuid(params.company_id)) {
        query.company_id = params.company_id;
      }
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(AR_AP_AGING_API.apOpenItems, {
          params: query,
        }),
      );
      return normalizeOpenItemsReport(data, params.party_id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async sendArStatementEmail(
    partyId: string,
    dto: ShareEmailDto = {},
  ): Promise<ShareEmailResult> {
    assertPartyId(partyId);
    return postShareEmail(axiosInstance, AR_AP_AGING_API.arStatementSendEmail(partyId), dto);
  },

  async sendApStatementEmail(
    partyId: string,
    dto: ShareEmailDto = {},
  ): Promise<ShareEmailResult> {
    assertPartyId(partyId);
    return postShareEmail(axiosInstance, AR_AP_AGING_API.apStatementSendEmail(partyId), dto);
  },

  /** POST /gl/ar/opening-balance */
  async postArOpeningBalance(
    dto: import('../types/openingBalance.types').PostArApOpeningBalanceDto,
  ): Promise<import('../types/openingBalance.types').OpeningBalanceResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(AR_AP_AGING_API.arOpeningBalance, {
          ...dto,
          create_manual_invoice: dto.create_manual_invoice !== false,
        }),
      );
      return normalizeOpeningBalanceResult(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /gl/ap/opening-balance */
  async postApOpeningBalance(
    dto: import('../types/openingBalance.types').PostArApOpeningBalanceDto,
  ): Promise<import('../types/openingBalance.types').OpeningBalanceResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(AR_AP_AGING_API.apOpeningBalance, {
          ...dto,
          create_manual_invoice: dto.create_manual_invoice !== false,
        }),
      );
      return normalizeOpeningBalanceResult(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

function normalizeOpeningBalanceResult(
  raw: unknown,
): import('../types/openingBalance.types').OpeningBalanceResult {
  const rec =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? ((raw as { data?: unknown }).data &&
        typeof (raw as { data?: unknown }).data === 'object'
          ? ((raw as { data: Record<string, unknown> }).data)
          : (raw as Record<string, unknown>))
      : {};
  return {
    invoice_id: String(rec.invoice_id ?? rec.invoiceId ?? '').trim() || undefined,
    invoice_number:
      String(rec.invoice_number ?? rec.invoiceNumber ?? '').trim() || undefined,
    voucher_id: String(rec.voucher_id ?? rec.voucherId ?? '').trim() || undefined,
    voucher_number:
      String(rec.voucher_number ?? rec.voucherNumber ?? '').trim() || undefined,
    message: String(rec.message ?? '').trim() || undefined,
    raw: rec,
  };
}

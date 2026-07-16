import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { AR_AP_AGING_API } from '../api/arApAging.api';
import {
  normalizeAgingReport,
  normalizeStatementReport,
} from '../utils/normalizeArApAging';
import type {
  AgingReportParams,
  AgingReportResult,
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
};

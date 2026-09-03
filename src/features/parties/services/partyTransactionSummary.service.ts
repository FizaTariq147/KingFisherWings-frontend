import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { PARTY_API } from '../api/party.api';
import type {
  PartyTransactionSummary,
  SendPartyTransactionSummaryDto,
  SendPartyTransactionSummaryResult,
} from '../types/partyTransactionSummary.types';
import { isApiUnavailable } from '../utils/isApiUnavailable';
import {
  emptyPartyTransactionSummary,
  normalizePartyTransactionSummary,
  normalizeSendTransactionSummaryResult,
} from '../utils/normalizePartyTransactionSummary';

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
  const status = axiosErr.response?.status;
  if (status === 404 || status === 501) {
    return new Error('Customer transaction summary is not available yet.');
  }
  return new Error(axiosErr.message || 'Request failed');
}

function assertPartyId(id?: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid party id.');
}

function bodyOf<T>(res: { data: unknown }): T {
  const raw = res.data;
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiEnvelope<T>).data;
  }
  return raw as T;
}

export const partyTransactionSummaryService = {
  async getSummary(partyId: string): Promise<PartyTransactionSummary> {
    assertPartyId(partyId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(PARTY_API.transactionSummary(partyId)),
      );
      return normalizePartyTransactionSummary(res.data, true);
    } catch (error) {
      if (isApiUnavailable(error)) {
        return emptyPartyTransactionSummary();
      }
      throw formatAxiosError(error);
    }
  },

  async sendSummary(
    partyId: string,
    dto: SendPartyTransactionSummaryDto,
  ): Promise<SendPartyTransactionSummaryResult> {
    assertPartyId(partyId);
    const emails = (dto.emails ?? [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const message = dto.message?.trim() || undefined;
    try {
      const res = await axiosInstance.post(PARTY_API.sendTransactionSummary(partyId), {
        ...(emails.length ? { emails } : {}),
        ...(message ? { message } : {}),
      });
      return normalizeSendTransactionSummaryResult(bodyOf(res) ?? res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};

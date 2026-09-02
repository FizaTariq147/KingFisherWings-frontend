import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { QUOTATION_API } from '../api/quotation.api';
import type { ApprovalDecisionDto, Quotation } from '../types/quotation.types';
import type {
  NegotiationRejectDto,
  NegotiationTimeline,
  ReviseAndSendDto,
} from '../types/quotationExtended.types';
import { normalizeQuotation } from '../utils/normalizeQuotation';
import { normalizeNegotiationTimeline } from '../utils/normalizeQuotationExtended';

function unwrapEntity(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: unknown }).data;
  }
  return raw;
}

function normalizeQuotationResponse(raw: unknown): Quotation {
  const q = normalizeQuotation(unwrapEntity(raw));
  if (!q) throw new Error('Quotation not found.');
  return q;
}

export const quotationNegotiationService = {
  async getTimeline(quotationId: string): Promise<NegotiationTimeline> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(QUOTATION_API.negotiation(quotationId)),
    );
    return normalizeNegotiationTimeline(res.data);
  },

  async reviseAndSend(quotationId: string, dto: ReviseAndSendDto): Promise<Quotation> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(QUOTATION_API.reviseAndSend(quotationId), dto),
    );
    return normalizeQuotationResponse(res.data);
  },

  async acceptCounterOffer(quotationId: string, dto: ApprovalDecisionDto = {}): Promise<Quotation> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(QUOTATION_API.negotiationAccept(quotationId), dto),
    );
    return normalizeQuotationResponse(res.data);
  },

  async rejectCounterOffer(quotationId: string, dto: NegotiationRejectDto): Promise<Quotation> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(QUOTATION_API.negotiationReject(quotationId), dto),
    );
    return normalizeQuotationResponse(res.data);
  },
};

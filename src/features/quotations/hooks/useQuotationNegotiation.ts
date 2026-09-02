import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { quotationNegotiationService } from '../services/quotationNegotiation.service';
import type { ApprovalDecisionDto } from '../types/quotation.types';
import type { NegotiationRejectDto, ReviseAndSendDto } from '../types/quotationExtended.types';
import { useInvalidateQuotations } from './useQuotations';

export const negotiationKeys = {
  timeline: (quotationId: string) =>
    ['tenant', 'quotations', quotationId, 'negotiation'] as const,
};

export function useQuotationNegotiation(quotationId: string, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: negotiationKeys.timeline(quotationId),
    queryFn: () => quotationNegotiationService.getTimeline(quotationId),
    enabled: Boolean(token) && isUuid(quotationId) && enabled,
  });
}

export function useQuotationNegotiationActions(quotationId: string) {
  const invalidate = useInvalidateQuotations();
  const qc = useQueryClient();
  const onSuccess = () => {
    invalidate(quotationId);
    void qc.invalidateQueries({ queryKey: negotiationKeys.timeline(quotationId) });
  };
  return {
    reviseAndSend: useMutation({
      mutationFn: (dto: ReviseAndSendDto) =>
        quotationNegotiationService.reviseAndSend(quotationId, dto),
      onSuccess,
    }),
    acceptCounterOffer: useMutation({
      mutationFn: (dto: ApprovalDecisionDto = {}) =>
        quotationNegotiationService.acceptCounterOffer(quotationId, dto),
      onSuccess,
    }),
    rejectCounterOffer: useMutation({
      mutationFn: (dto: NegotiationRejectDto) =>
        quotationNegotiationService.rejectCounterOffer(quotationId, dto),
      onSuccess,
    }),
  };
}

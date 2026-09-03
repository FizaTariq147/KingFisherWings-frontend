import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { quotationNegotiationService } from '../services/quotationNegotiation.service';
import type { ApprovalDecisionDto } from '../types/quotation.types';
import type { NegotiationRejectDto, ReviseAndSendDto } from '../types/quotationExtended.types';
import { clearCustomerQuoteDecision } from '../utils/customerQuoteDecision';
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
    staleTime: 3_000,
    refetchInterval: enabled ? 5_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useQuotationNegotiationActions(quotationId: string) {
  const invalidate = useInvalidateQuotations();
  const qc = useQueryClient();
  const onSuccess = () => {
    clearCustomerQuoteDecision(quotationId);
    invalidate(quotationId);
    void qc.invalidateQueries({ queryKey: negotiationKeys.timeline(quotationId) });
  };

  // Call each mutation hook at top level (stable order) — do not construct inside object literals only.
  const reviseAndSend = useMutation({
    mutationFn: (dto: ReviseAndSendDto) =>
      quotationNegotiationService.reviseAndSend(quotationId, dto),
    onSuccess,
  });
  const acceptCounterOffer = useMutation({
    mutationFn: (dto: ApprovalDecisionDto = {}) =>
      quotationNegotiationService.acceptCounterOffer(quotationId, dto),
    onSuccess,
  });
  const rejectCounterOffer = useMutation({
    mutationFn: (dto: NegotiationRejectDto) =>
      quotationNegotiationService.rejectCounterOffer(quotationId, dto),
    onSuccess,
  });

  return { reviseAndSend, acceptCounterOffer, rejectCounterOffer };
}

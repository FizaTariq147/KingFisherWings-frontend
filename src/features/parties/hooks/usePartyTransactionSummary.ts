import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { partyKeys } from './useParties';
import { partyTransactionSummaryService } from '../services/partyTransactionSummary.service';
import type { SendPartyTransactionSummaryDto } from '../types/partyTransactionSummary.types';

export const partyTransactionSummaryKeys = {
  summary: (partyId: string) => [...partyKeys.all, 'transaction-summary', partyId] as const,
};

export function usePartyTransactionSummary(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyTransactionSummaryKeys.summary(partyId),
    queryFn: () => partyTransactionSummaryService.getSummary(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
    staleTime: 30_000,
  });
}

export function useSendPartyTransactionSummary(partyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendPartyTransactionSummaryDto) =>
      partyTransactionSummaryService.sendSummary(partyId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: partyTransactionSummaryKeys.summary(partyId),
      });
    },
  });
}

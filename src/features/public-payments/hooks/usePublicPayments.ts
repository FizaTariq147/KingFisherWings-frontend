import { useMutation, useQuery } from '@tanstack/react-query';
import { publicPaymentsService } from '../services/publicPayments.service';
import type { PublicPayCheckoutDto } from '../types/publicPayments.types';

export const publicPaymentsKeys = {
  all: ['public', 'pay'] as const,
  summary: (token: string) => [...publicPaymentsKeys.all, 'summary', token] as const,
};

export function usePublicPaySummary(token: string) {
  return useQuery({
    queryKey: publicPaymentsKeys.summary(token),
    queryFn: () => publicPaymentsService.getSummary(token),
    enabled: Boolean(token.trim()),
    retry: false,
  });
}

export function usePublicPayCheckout(token: string) {
  return useMutation({
    mutationFn: (dto: PublicPayCheckoutDto = {}) =>
      publicPaymentsService.checkout(token, dto),
  });
}

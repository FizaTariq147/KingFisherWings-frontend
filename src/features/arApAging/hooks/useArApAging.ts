import { useQuery } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { arApAgingService } from '../services/arApAging.service';
import type { AgingReportParams, StatementReportParams } from '../types/arApAging.types';

export const arApAgingKeys = {
  all: ['tenant', 'gl-ar-ap-aging'] as const,
  arAging: (params: AgingReportParams) => [...arApAgingKeys.all, 'ar-aging', params] as const,
  apAging: (params: AgingReportParams) => [...arApAgingKeys.all, 'ap-aging', params] as const,
  arStatement: (partyId: string, params: StatementReportParams) =>
    [...arApAgingKeys.all, 'ar-statement', partyId, params] as const,
  apStatement: (partyId: string, params: StatementReportParams) =>
    [...arApAgingKeys.all, 'ap-statement', partyId, params] as const,
};

export function useArAging(params: AgingReportParams = {}, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: arApAgingKeys.arAging(params),
    queryFn: () => arApAgingService.getArAging(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useApAging(params: AgingReportParams = {}, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: arApAgingKeys.apAging(params),
    queryFn: () => arApAgingService.getApAging(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useArStatement(
  partyId: string,
  params: StatementReportParams = {},
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: arApAgingKeys.arStatement(partyId, params),
    queryFn: () => arApAgingService.getArStatement(partyId, params),
    enabled: Boolean(accessToken) && isUuid(partyId) && enabled,
  });
}

export function useApStatement(
  partyId: string,
  params: StatementReportParams = {},
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: arApAgingKeys.apStatement(partyId, params),
    queryFn: () => arApAgingService.getApStatement(partyId, params),
    enabled: Boolean(accessToken) && isUuid(partyId) && enabled,
  });
}

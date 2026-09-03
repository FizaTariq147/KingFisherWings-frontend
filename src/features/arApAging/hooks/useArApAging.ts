import { useQuery } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { arApAgingService } from '../services/arApAging.service';
import type {
  AgingReportParams,
  OpenItemsParams,
  StatementReportParams,
} from '../types/arApAging.types';

export const arApAgingKeys = {
  all: ['tenant', 'gl-ar-ap-aging'] as const,
  arAging: (params: AgingReportParams) => [...arApAgingKeys.all, 'ar-aging', params] as const,
  apAging: (params: AgingReportParams) => [...arApAgingKeys.all, 'ap-aging', params] as const,
  arOpenItems: (params: OpenItemsParams) =>
    [...arApAgingKeys.all, 'ar-open-items', params] as const,
  apOpenItems: (params: OpenItemsParams) =>
    [...arApAgingKeys.all, 'ap-open-items', params] as const,
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

export function useArOpenItems(params: OpenItemsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const ready = isUuid(params.party_id) && isUuid(params.company_id);
  return useQuery({
    queryKey: arApAgingKeys.arOpenItems(params),
    queryFn: () => arApAgingService.getArOpenItems(params),
    enabled: Boolean(accessToken) && ready && enabled,
    staleTime: 30_000,
  });
}

export function useApOpenItems(params: OpenItemsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const ready = isUuid(params.party_id) && isUuid(params.company_id);
  return useQuery({
    queryKey: arApAgingKeys.apOpenItems(params),
    queryFn: () => arApAgingService.getApOpenItems(params),
    enabled: Boolean(accessToken) && ready && enabled,
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

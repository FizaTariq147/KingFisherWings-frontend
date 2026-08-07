import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portalAdminInboxService } from '../services/portalAdminInbox.service';
import type {
  AdminPortalMessageListParams, ReviewCreditLimitDto, ReviewDisputeDto,
} from '../types/portalAdminInbox.types';

export const portalAdminInboxKeys = {
  all: ['portal-admin-inbox'] as const,
  messages: (params: AdminPortalMessageListParams) => [...portalAdminInboxKeys.all, 'messages', params] as const,
  disputes: () => [...portalAdminInboxKeys.all, 'disputes'] as const,
  creditRequests: () => [...portalAdminInboxKeys.all, 'credit-requests'] as const,
};

export function useAdminPortalMessages(params: AdminPortalMessageListParams) {
  return useQuery({
    queryKey: portalAdminInboxKeys.messages(params),
    queryFn: () => portalAdminInboxService.listMessages(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useMarkAdminPortalMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalAdminInboxService.markMessageRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.all }); },
  });
}

export function useAdminPortalDisputes(enabled = true) {
  return useQuery({
    queryKey: portalAdminInboxKeys.disputes(),
    queryFn: () => portalAdminInboxService.listDisputes(),
    staleTime: 0,
    enabled,
  });
}

export function useReviewAdminPortalDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewDisputeDto }) =>
      portalAdminInboxService.reviewDispute(id, dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.disputes() }); },
  });
}

export function useAdminCreditLimitRequests() {
  return useQuery({
    queryKey: portalAdminInboxKeys.creditRequests(),
    queryFn: () => portalAdminInboxService.listCreditRequests(),
    staleTime: 0,
  });
}

export function useReviewAdminCreditLimitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewCreditLimitDto }) =>
      portalAdminInboxService.reviewCreditRequest(id, dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.creditRequests() }); },
  });
}

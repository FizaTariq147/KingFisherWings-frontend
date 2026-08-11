import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portalAdminInboxService } from '../services/portalAdminInbox.service';
import type {
  AdminPortalMessageListParams, AdminPortalMessageReplyDto, ReviewCreditLimitDto, ReviewDisputeDto,
} from '../types/portalAdminInbox.types';

export const portalAdminInboxKeys = {
  all: ['portal-admin-inbox'] as const,
  messages: (params: AdminPortalMessageListParams) => [...portalAdminInboxKeys.all, 'messages', params] as const,
  messageDetail: (id: string) => [...portalAdminInboxKeys.all, 'message', id] as const,
  disputes: () => [...portalAdminInboxKeys.all, 'disputes'] as const,
  disputeDetail: (id: string) => [...portalAdminInboxKeys.all, 'dispute', id] as const,
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

export function useAdminPortalMessage(id: string, enabled = true) {
  return useQuery({
    queryKey: portalAdminInboxKeys.messageDetail(id),
    queryFn: () => portalAdminInboxService.getMessage(id),
    enabled: Boolean(id) && enabled,
    staleTime: 0,
  });
}

export function useDownloadAdminPortalMessageAttachment() {
  return useMutation({
    mutationFn: (id: string) => portalAdminInboxService.downloadMessageAttachment(id),
  });
}

export function useReplyAdminPortalMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminPortalMessageReplyDto }) =>
      portalAdminInboxService.replyToMessage(id, dto),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.all });
      void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.messageDetail(vars.id) });
    },
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

export function useAdminPortalDispute(id: string, enabled = true) {
  return useQuery({
    queryKey: portalAdminInboxKeys.disputeDetail(id),
    queryFn: () => portalAdminInboxService.getDispute(id),
    enabled: Boolean(id) && enabled,
    staleTime: 0,
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

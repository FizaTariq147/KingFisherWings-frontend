import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminQuoteRequestsService } from '../services/adminQuoteRequests.service';
import type {
  PatchQuoteRequestStatusDto,
  QuoteRequestListParams,
  QuoteRequestSyncRunListParams,
  UpsertQuoteRequestConnectionDto,
} from '../types/adminQuoteRequests.types';

export const adminQuoteRequestsKeys = {
  all: ['admin-quote-requests'] as const,
  connection: () => [...adminQuoteRequestsKeys.all, 'connection'] as const,
  list: (params?: QuoteRequestListParams) =>
    [...adminQuoteRequestsKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...adminQuoteRequestsKeys.all, 'detail', id] as const,
  syncRuns: (params?: QuoteRequestSyncRunListParams) =>
    [...adminQuoteRequestsKeys.all, 'sync-runs', params ?? {}] as const,
};

export function useQuoteRequestConnection(enabled = true) {
  return useQuery({
    queryKey: adminQuoteRequestsKeys.connection(),
    queryFn: () => adminQuoteRequestsService.getConnection(),
    enabled,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useQuoteRequestsList(params?: QuoteRequestListParams, enabled = true) {
  return useQuery({
    queryKey: adminQuoteRequestsKeys.list(params),
    queryFn: () => adminQuoteRequestsService.list(params),
    enabled,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useQuoteRequestDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: adminQuoteRequestsKeys.detail(id),
    queryFn: () => adminQuoteRequestsService.getById(id),
    enabled: Boolean(id) && enabled,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useQuoteRequestSyncRuns(
  params?: QuoteRequestSyncRunListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: adminQuoteRequestsKeys.syncRuns(params),
    queryFn: () => adminQuoteRequestsService.listSyncRuns(params),
    enabled,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

function useInvalidateQuoteRequests() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: adminQuoteRequestsKeys.all });
  };
}

export function useUpsertQuoteRequestConnection() {
  const invalidate = useInvalidateQuoteRequests();
  return useMutation({
    mutationFn: (body: UpsertQuoteRequestConnectionDto) =>
      adminQuoteRequestsService.upsertConnection(body),
    onSuccess: invalidate,
  });
}

export function useTestQuoteRequestConnection() {
  const invalidate = useInvalidateQuoteRequests();
  return useMutation({
    mutationFn: () => adminQuoteRequestsService.testConnection(),
    onSuccess: invalidate,
  });
}

export function useSyncQuoteRequests() {
  const invalidate = useInvalidateQuoteRequests();
  return useMutation({
    mutationFn: () => adminQuoteRequestsService.sync(),
    onSuccess: invalidate,
  });
}

export function usePatchQuoteRequestStatus(id: string) {
  const invalidate = useInvalidateQuoteRequests();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchQuoteRequestStatusDto) =>
      adminQuoteRequestsService.updateStatus(id, body),
    onSuccess: (data) => {
      invalidate();
      void qc.setQueryData(adminQuoteRequestsKeys.detail(id), data);
    },
  });
}

export function useLinkQuoteRequestCrm(id: string) {
  const invalidate = useInvalidateQuoteRequests();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminQuoteRequestsService.linkCrm(id),
    onSuccess: (data) => {
      invalidate();
      void qc.setQueryData(adminQuoteRequestsKeys.detail(id), data);
    },
  });
}

export function useConvertQuoteRequestToQuote(id: string) {
  const invalidate = useInvalidateQuoteRequests();
  return useMutation({
    mutationFn: () => adminQuoteRequestsService.convertToQuote(id),
    onSuccess: invalidate,
  });
}

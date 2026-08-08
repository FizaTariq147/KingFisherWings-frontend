import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalMessagesService } from '../services/portalMessages.service';
import type {
  PortalMessageCreateDto,
  PortalMessageListParams,
  PortalMessageReplyDto,
} from '../types/portalMessages.types';

export const portalMessageKeys = {
  all: (scope: string) => ['portal', scope, 'messages'] as const,
  list: (scope: string, params: PortalMessageListParams) =>
    [...portalMessageKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalMessageKeys.all(scope), 'detail', id] as const,
};

export function usePortalMessages(params: PortalMessageListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalMessageKeys.list(scope, params),
    queryFn: () => portalMessagesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalMessage(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalMessageKeys.detail(scope, id),
    queryFn: () => portalMessagesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useCreatePortalMessage() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalMessageCreateDto) => portalMessagesService.create(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalMessageKeys.all(scope) });
    },
  });
}

export function useReplyPortalMessage() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PortalMessageReplyDto }) =>
      portalMessagesService.reply(id, dto),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: portalMessageKeys.all(scope) });
      void qc.invalidateQueries({ queryKey: portalMessageKeys.detail(scope, vars.id) });
    },
  });
}

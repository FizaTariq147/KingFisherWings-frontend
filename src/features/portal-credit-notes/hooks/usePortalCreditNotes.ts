import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditNotesService } from '../services/portalCreditNotes.service';
import type { PortalCreditNoteListParams } from '../types/portalCreditNotes.types';

export const portalCreditNoteKeys = {
  all: (scope: string) => ['portal', scope, 'credit-notes'] as const,
  list: (scope: string, params: PortalCreditNoteListParams) => [...portalCreditNoteKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalCreditNoteKeys.all(scope), 'detail', id] as const,
};

export function usePortalCreditNotes(params: PortalCreditNoteListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.list(scope, params),
    queryFn: () => portalCreditNotesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalCreditNote(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.detail(scope, id),
    queryFn: () => portalCreditNotesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}


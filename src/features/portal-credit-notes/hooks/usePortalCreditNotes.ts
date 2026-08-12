import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import {
  portalCreditNotesService,
  type PortalNoteKind,
} from '../services/portalCreditNotes.service';
import type { PortalCreditNoteListParams } from '../types/portalCreditNotes.types';

export const portalCreditNoteKeys = {
  all: (scope: string, kind: PortalNoteKind = 'credit') =>
    ['portal', scope, kind === 'debit' ? 'debit-notes' : 'credit-notes'] as const,
  list: (scope: string, kind: PortalNoteKind, params: PortalCreditNoteListParams) =>
    [...portalCreditNoteKeys.all(scope, kind), 'list', params] as const,
  detail: (scope: string, kind: PortalNoteKind, id: string) =>
    [...portalCreditNoteKeys.all(scope, kind), 'detail', id] as const,
};

export function usePortalCreditNotes(
  params: PortalCreditNoteListParams,
  kind: PortalNoteKind = 'credit',
) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.list(scope, kind, params),
    queryFn: () => portalCreditNotesService.list(params, kind),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalCreditNote(id: string, kind: PortalNoteKind = 'credit') {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.detail(scope, kind, id),
    queryFn: () => portalCreditNotesService.getById(id, kind),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadPortalCreditNotePdf() {
  return useMutation({
    mutationFn: ({
      id,
      kind,
      name,
    }: {
      id: string;
      kind?: PortalNoteKind;
      name?: string;
    }) => portalCreditNotesService.downloadPdf(id, kind ?? 'credit', name),
  });
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import {
  portalCreditNotesService,
  type PortalNoteKind,
} from '../services/portalCreditNotes.service';
import type {
  PortalCreateDebitNoteDto,
  PortalCreditNoteListParams,
} from '../types/portalCreditNotes.types';

export const portalCreditNoteKeys = {
  all: (scope: string, kind: PortalNoteKind = 'credit') =>
    ['portal', scope, kind === 'debit' ? 'debit-notes' : 'credit-notes'] as const,
  list: (scope: string, kind: PortalNoteKind, params: PortalCreditNoteListParams) =>
    [...portalCreditNoteKeys.all(scope, kind), 'list', params] as const,
  detail: (scope: string, kind: PortalNoteKind, id: string) =>
    [...portalCreditNoteKeys.all(scope, kind), 'detail', id] as const,
  paymentStatus: (scope: string, id: string) =>
    [...portalCreditNoteKeys.all(scope, 'debit'), 'payment-status', id] as const,
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

export function useCreatePortalDebitNote() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalCreateDebitNoteDto) =>
      portalCreditNotesService.createDebitNote(dto),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: portalCreditNoteKeys.all(scope, 'debit') });
      if (data?.id) {
        qc.setQueryData(portalCreditNoteKeys.detail(scope, 'debit', data.id), data);
      }
    },
  });
}

export function usePayPortalDebitNote(id: string) {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      portalCreditNotesService.payDebitNote(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalCreditNoteKeys.detail(scope, 'debit', id) });
      void qc.invalidateQueries({ queryKey: portalCreditNoteKeys.paymentStatus(scope, id) });
      void qc.invalidateQueries({ queryKey: portalCreditNoteKeys.all(scope, 'debit') });
    },
  });
}

export function usePortalDebitNotePaymentStatus(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.paymentStatus(scope, id),
    queryFn: () => portalCreditNotesService.debitPaymentStatus(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 5_000,
    refetchInterval: (q) => {
      const status = String(q.state.data?.status ?? '').toUpperCase();
      if (!status || /PAID|SUCCESS|COMPLETE|SETTLED|CANCEL/.test(status)) return false;
      return 4_000;
    },
  });
}

export function useDownloadPortalDebitAttachment() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      portalCreditNotesService.downloadDebitAttachment(id, name),
  });
}

export function useUploadPortalDebitAttachment(id: string) {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (file: File) => portalCreditNotesService.uploadDebitAttachment(id, file),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: portalCreditNoteKeys.all(scope, 'debit') });
      if (data?.id) {
        qc.setQueryData(portalCreditNoteKeys.detail(scope, 'debit', data.id), data);
      }
    },
  });
}

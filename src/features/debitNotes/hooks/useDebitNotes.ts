import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { debitNoteService } from '../services/debitNote.service';
import type {
  CreateDebitNoteDto,
  DebitNoteListParams,
} from '../types/debitNote.types';

export const debitNoteKeys = {
  all: ['tenant', 'debit-notes'] as const,
  list: (params: DebitNoteListParams) => [...debitNoteKeys.all, 'list', params] as const,
  detail: (id: string) => [...debitNoteKeys.all, 'detail', id] as const,
};

export function useDebitNotes(params: DebitNoteListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: debitNoteKeys.list(params),
    queryFn: () => debitNoteService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDebitNote(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: debitNoteKeys.detail(id),
    queryFn: () => debitNoteService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useInvalidateDebitNotes() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: debitNoteKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: debitNoteKeys.detail(detailId) });
    }
  };
}

export function useCreateDebitNote() {
  const invalidate = useInvalidateDebitNotes();
  return useMutation({
    mutationFn: (dto: CreateDebitNoteDto) => debitNoteService.create(dto),
    onSuccess: (dn) => invalidate(dn.id),
  });
}

export function usePostDebitNote(id: string) {
  const invalidate = useInvalidateDebitNotes();
  return useMutation({
    mutationFn: () => debitNoteService.post(id),
    onSuccess: () => invalidate(id),
  });
}

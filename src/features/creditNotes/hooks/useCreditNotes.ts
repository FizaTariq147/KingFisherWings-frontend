import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { creditNoteService } from '../services/creditNote.service';
import type {
  CreateCreditNoteDto,
  CreditNoteListParams,
} from '../types/creditNote.types';

export const creditNoteKeys = {
  all: ['tenant', 'credit-notes'] as const,
  list: (params: CreditNoteListParams) => [...creditNoteKeys.all, 'list', params] as const,
  detail: (id: string) => [...creditNoteKeys.all, 'detail', id] as const,
};

export function useCreditNotes(params: CreditNoteListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: creditNoteKeys.list(params),
    queryFn: () => creditNoteService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreditNote(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: creditNoteKeys.detail(id),
    queryFn: () => creditNoteService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useInvalidateCreditNotes() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.detail(detailId) });
    }
  };
}

export function useCreateCreditNote() {
  const invalidate = useInvalidateCreditNotes();
  return useMutation({
    mutationFn: (dto: CreateCreditNoteDto) => creditNoteService.create(dto),
    onSuccess: (cn) => invalidate(cn.id),
  });
}

export function usePostCreditNote(id: string) {
  const invalidate = useInvalidateCreditNotes();
  return useMutation({
    mutationFn: () => creditNoteService.post(id),
    onSuccess: () => invalidate(id),
  });
}

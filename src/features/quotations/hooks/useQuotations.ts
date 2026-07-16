import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { quotationService } from '../services/quotation.service';
import type {
  CreateOnlineQuoteDto,
  CreateQuotationDto,
  QuotationListParams,
  UpdateQuotationDto,
} from '../types/quotation.types';

export const quotationKeys = {
  all: ['tenant', 'quotations'] as const,
  list: (params: QuotationListParams) => [...quotationKeys.all, 'list', params] as const,
  detail: (id: string) => [...quotationKeys.all, 'detail', id] as const,
  revisions: (id: string) => [...quotationKeys.all, 'revisions', id] as const,
  pdf: (id: string) => [...quotationKeys.all, 'pdf', id] as const,
  pdfStatus: (id: string) => [...quotationKeys.all, 'pdf-status', id] as const,
  reports: ['tenant', 'quotations', 'reports'] as const,
};

export function useQuotations(params: QuotationListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => quotationService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useQuotation(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => quotationService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useQuotationRevisions(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: quotationKeys.revisions(id),
    queryFn: () => quotationService.listRevisions(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useInvalidateQuotations() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(detailId) });
    }
  };
}

export function useCreateQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (dto: CreateQuotationDto) => quotationService.create(dto),
    onSuccess: (q) => invalidate(q.id),
  });
}

export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateQuotationDto) => quotationService.update(id, dto),
    onSuccess: (q) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      queryClient.setQueryData(quotationKeys.detail(id), q);
    },
  });
}

export function useDeleteQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (id: string) => quotationService.softDelete(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useCreateOnlineQuote() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (dto: CreateOnlineQuoteDto) => quotationService.createOnlineQuote(dto),
    onSuccess: () => invalidate(),
  });
}

export function useExpireDueQuotations() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: () => quotationService.expireDue(),
    onSuccess: () => invalidate(),
  });
}

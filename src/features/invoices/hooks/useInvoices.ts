import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { invoiceService } from '../services/invoice.service';
import type {
  CreateInvoiceDto,
  InvoiceListParams,
  UpdateInvoiceDto,
} from '../types/invoice.types';

export const invoiceKeys = {
  all: ['tenant', 'invoices'] as const,
  list: (params: InvoiceListParams) => [...invoiceKeys.all, 'list', params] as const,
  overdue: () => [...invoiceKeys.all, 'overdue'] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
  pdf: (id: string) => [...invoiceKeys.all, 'pdf', id] as const,
};

export function useInvoices(params: InvoiceListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoiceService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useOverdueInvoices() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: invoiceKeys.overdue(),
    queryFn: () => invoiceService.listOverdue(),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(detailId) });
    }
  };
}

export function useCreateInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoiceService.create(dto),
    onSuccess: (inv) => invalidate(inv.id),
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateInvoiceDto) => invoiceService.update(id, dto),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(id), inv);
    },
  });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: string) => invoiceService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

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
  history: (id: string) => [...invoiceKeys.all, 'history', id] as const,
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
    // Keep seeded create/list cache if a refetch 404s (backend read lag / scope issues).
    retry: (count, err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (/not found|404/i.test(msg)) return false;
      return count < 2;
    },
  });
}

export function useInvoiceHistory(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: invoiceKeys.history(id),
    queryFn: () => invoiceService.getHistory(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
    staleTime: 30_000,
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
    // Invalidate list/overdue only by default — broad `invoiceKeys.all` also matches
    // detail queries and can wipe a just-seeded create result with a failed refetch.
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key[0] !== 'tenant' || key[1] !== 'invoices') return false;
        if (key[2] === 'detail') {
          return Boolean(detailId && key[3] === detailId);
        }
        return true;
      },
    });
  };
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoiceService.create(dto),
    onSuccess: (inv) => {
      // Seed detail and refresh lists — do not invalidate this detail (avoids race).
      queryClient.setQueryData(invoiceKeys.detail(inv.id), inv);
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === 'tenant' &&
            key[1] === 'invoices' &&
            key[2] !== 'detail'
          );
        },
      });
    },
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

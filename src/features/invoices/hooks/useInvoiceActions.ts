import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { invoiceService } from '../services/invoice.service';
import type {
  CreateInvoiceLineDto,
  SendInvoiceEmailDto,
  UpdateInvoiceLineDto,
} from '../types/invoice.types';
import { invoiceKeys, useInvalidateInvoices } from './useInvoices';

export function useInvoiceActions(invoiceId: string) {
  const invalidate = useInvalidateInvoices();
  const queryClient = useQueryClient();
  const id = invoiceId;

  const post = useMutation({
    mutationFn: () => invoiceService.post(id),
    onSuccess: () => invalidate(id),
  });
  const send = useMutation({
    mutationFn: (dto: SendInvoiceEmailDto) => invoiceService.send(id, dto),
    onSuccess: () => invalidate(id),
  });
  const cancel = useMutation({
    mutationFn: () => invoiceService.cancel(id),
    onSuccess: () => invalidate(id),
  });
  const generatePdf = useMutation({
    mutationFn: () => invoiceService.generatePdf(id),
    onSuccess: (info) => {
      queryClient.setQueryData(invoiceKeys.pdf(id), info);
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.pdf(id) });
    },
  });
  const createFromJob = useMutation({
    mutationFn: (jobId: string) => invoiceService.createFromJob(jobId),
    onSuccess: (inv) => invalidate(inv.id),
  });
  const addLine = useMutation({
    mutationFn: (dto: CreateInvoiceLineDto) => invoiceService.addLine(id, dto),
    onSuccess: () => invalidate(id),
  });
  const updateLine = useMutation({
    mutationFn: ({ lineId, dto }: { lineId: string; dto: UpdateInvoiceLineDto }) =>
      invoiceService.updateLine(id, lineId, dto),
    onSuccess: () => invalidate(id),
  });
  const removeLine = useMutation({
    mutationFn: (lineId: string) => invoiceService.removeLine(id, lineId),
    onSuccess: () => invalidate(id),
  });

  return {
    post,
    send,
    cancel,
    generatePdf,
    createFromJob,
    addLine,
    updateLine,
    removeLine,
  };
}

export function useInvoicePdf(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: invoiceKeys.pdf(id),
    queryFn: () => invoiceService.getPdf(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useCreateInvoiceFromJob() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (jobId: string) => invoiceService.createFromJob(jobId),
    onSuccess: (inv) => invalidate(inv.id),
  });
}

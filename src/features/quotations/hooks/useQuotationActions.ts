import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { quotationService } from '../services/quotation.service';
import type {
  ApprovalDecisionDto,
  GenerateQuotationPdfDto,
  MarkLostDto,
  SendQuotationEmailDto,
} from '../types/quotation.types';
import { clearCustomerQuoteDecision } from '../utils/customerQuoteDecision';
import { quotationKeys, useInvalidateQuotations } from './useQuotations';

/** Detail-page actions bound to a single quotation id. */
export function useQuotationActions(quotationId: string) {
  const invalidate = useInvalidateQuotations();
  const queryClient = useQueryClient();
  const id = quotationId;

  const afterStatusChange = () => {
    clearCustomerQuoteDecision(id);
    invalidate(id);
  };

  const submit = useMutation({
    mutationFn: () => quotationService.submit(id),
    onSuccess: afterStatusChange,
  });
  const approve = useMutation({
    mutationFn: (dto: ApprovalDecisionDto = {}) => quotationService.approve(id, dto),
    onSuccess: afterStatusChange,
  });
  const reject = useMutation({
    mutationFn: (dto: ApprovalDecisionDto = {}) => quotationService.reject(id, dto),
    onSuccess: afterStatusChange,
  });
  const send = useMutation({
    mutationFn: () => quotationService.send(id),
    onSuccess: afterStatusChange,
  });
  const markWon = useMutation({
    mutationFn: () => quotationService.markWon(id),
    onSuccess: afterStatusChange,
  });
  const markLost = useMutation({
    mutationFn: (dto: MarkLostDto) => quotationService.markLost(id, dto),
    onSuccess: afterStatusChange,
  });
  const duplicate = useMutation({
    mutationFn: () => quotationService.duplicate(id),
    onSuccess: () => invalidate(id),
  });
  const convertToJob = useMutation({
    mutationFn: () => quotationService.convertToJob(id),
    onSuccess: afterStatusChange,
  });
  const fulfillApproved = useMutation({
    mutationFn: () => quotationService.fulfillApprovedQuotation(id),
    onSuccess: afterStatusChange,
  });
  const archive = useMutation({
    mutationFn: () => quotationService.archive(id),
    onSuccess: afterStatusChange,
  });
  const expire = useMutation({
    mutationFn: () => quotationService.expire(id),
    onSuccess: afterStatusChange,
  });
  const sendEmail = useMutation({
    mutationFn: (dto: SendQuotationEmailDto) => quotationService.sendEmail(id, dto),
  });
  const generatePdf = useMutation({
    mutationFn: (dto: GenerateQuotationPdfDto) => quotationService.generatePdf(id, dto),
    onSuccess: (info) => {
      queryClient.setQueryData(quotationKeys.pdf(id), info);
      void queryClient.invalidateQueries({ queryKey: quotationKeys.pdf(id) });
      void queryClient.invalidateQueries({ queryKey: quotationKeys.pdfStatus(id) });
    },
  });

  return {
    submit,
    approve,
    reject,
    send,
    markWon,
    markLost,
    duplicate,
    convertToJob,
    fulfillApproved,
    archive,
    expire,
    sendEmail,
    generatePdf,
  };
}

/** List action-menu mutations (id passed per call). */
export function useQuotationLifecycleMutations() {
  const invalidate = useInvalidateQuotations();

  return {
    submit: useMutation({
      mutationFn: (id: string) => quotationService.submit(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    approve: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: ApprovalDecisionDto }) =>
        quotationService.approve(id, dto ?? {}),
      onSuccess: (_d, { id }) => {
        clearCustomerQuoteDecision(id);
        invalidate(id);
      },
    }),
    reject: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: ApprovalDecisionDto }) =>
        quotationService.reject(id, dto ?? {}),
      onSuccess: (_d, { id }) => {
        clearCustomerQuoteDecision(id);
        invalidate(id);
      },
    }),
    send: useMutation({
      mutationFn: (id: string) => quotationService.send(id),
      onSuccess: (_d, id) => {
        clearCustomerQuoteDecision(id);
        invalidate(id);
      },
    }),
    markWon: useMutation({
      mutationFn: (id: string) => quotationService.markWon(id),
      onSuccess: (_d, id) => {
        clearCustomerQuoteDecision(id);
        invalidate(id);
      },
    }),
    markLost: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: MarkLostDto }) =>
        quotationService.markLost(id, dto),
      onSuccess: (_d, { id }) => {
        clearCustomerQuoteDecision(id);
        invalidate(id);
      },
    }),
    duplicate: useMutation({
      mutationFn: (id: string) => quotationService.duplicate(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    convertToJob: useMutation({
      mutationFn: (id: string) => quotationService.convertToJob(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    archive: useMutation({
      mutationFn: (id: string) => quotationService.archive(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    expire: useMutation({
      mutationFn: (id: string) => quotationService.expire(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    remove: useMutation({
      mutationFn: (id: string) => quotationService.softDelete(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
  };
}

export function useQuotationPdf(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: quotationKeys.pdf(id),
    queryFn: () => quotationService.getPdf(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useQuotationPdfStatus(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: quotationKeys.pdfStatus(id),
    queryFn: () => quotationService.getPdfStatus(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
    refetchInterval: enabled ? 3000 : false,
  });
}

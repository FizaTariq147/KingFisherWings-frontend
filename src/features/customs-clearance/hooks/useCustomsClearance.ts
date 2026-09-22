import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useInvalidateJobs } from '@/features/jobs/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';
import { customsClearanceService } from '../services/customsClearance.service';
import type {
  CcStageActionDto,
  ClassifyCcLineDto,
  CreateCcLineDto,
  CreateCcQueryDto,
  DutyPaymentRequestDto,
  HsValidateDto,
  LinkFreightDto,
  UpdateCcChecklistItemDto,
  UpdateCcDetailsDto,
  UpdateCcFilingDto,
  UpdateCcLineDto,
  UpdateCcQueryDto,
  UpsertCcDeclarationDto,
} from '../types/customsClearance.types';

export const ccKeys = {
  all: ['tenant', 'customs-clearance'] as const,
  dashboard: (params: Record<string, unknown>) =>
    [...ccKeys.all, 'dashboard', params] as const,
  queue: (params: Record<string, unknown>) => [...ccKeys.all, 'queue', params] as const,
  details: (jobId: string) => [...ccKeys.all, jobId, 'details'] as const,
  status: (jobId: string) => [...ccKeys.all, jobId, 'status'] as const,
  lines: (jobId: string) => [...ccKeys.all, jobId, 'lines'] as const,
  checklist: (jobId: string) => [...ccKeys.all, jobId, 'checklist'] as const,
  queries: (jobId: string) => [...ccKeys.all, jobId, 'queries'] as const,
  financial: (jobId: string) => [...ccKeys.all, jobId, 'financial'] as const,
  linkFreight: (jobId: string) => [...ccKeys.all, jobId, 'link-freight'] as const,
  declaration: (jobId: string) => [...ccKeys.all, jobId, 'declaration'] as const,
};

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

function useInvalidateCc(jobId?: string) {
  const queryClient = useQueryClient();
  const invalidateJobs = useInvalidateJobs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ccKeys.all });
    if (jobId && isUuid(jobId)) invalidateJobs(jobId);
  };
}

export function useCcDashboard(params: Record<string, unknown> = {}, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.dashboard(params),
    queryFn: () => customsClearanceService.dashboard(params),
    enabled: Boolean(token) && enabled,
  });
}

export function useCcQueue(params: Record<string, unknown> = {}, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.queue(params),
    queryFn: () => customsClearanceService.queue(params),
    enabled: Boolean(token) && enabled,
  });
}

export function useCcDetails(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.details(jobId),
    queryFn: () => customsClearanceService.getDetails(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcStatus(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.status(jobId),
    queryFn: () => customsClearanceService.getStatus(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcLines(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.lines(jobId),
    queryFn: () => customsClearanceService.listLines(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcChecklist(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.checklist(jobId),
    queryFn: () => customsClearanceService.getChecklist(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcQueries(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.queries(jobId),
    queryFn: () => customsClearanceService.listQueries(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcFinancialSummary(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.financial(jobId),
    queryFn: () => customsClearanceService.financialSummary(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcLinkFreight(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.linkFreight(jobId),
    queryFn: () => customsClearanceService.getLinkFreight(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useCcDeclaration(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ccKeys.declaration(jobId),
    queryFn: () => customsClearanceService.getDeclaration(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

/** Mutations for a CC job — stages, CRUD, declaration, freight link. */
export function useCcJobActions(jobId: string) {
  const invalidate = useInvalidateCc(jobId);
  const queryClient = useQueryClient();

  const onSuccess = () => {
    invalidate();
    void queryClient.invalidateQueries({ queryKey: ccKeys.status(jobId) });
  };

  return {
    open: useMutation({
      mutationFn: (dto?: CcStageActionDto) => customsClearanceService.open(jobId, dto),
      onSuccess,
    }),
    updateDetails: useMutation({
      mutationFn: (dto: UpdateCcDetailsDto) =>
        customsClearanceService.updateDetails(jobId, dto),
      onSuccess,
    }),
    createLine: useMutation({
      mutationFn: (dto: CreateCcLineDto) => customsClearanceService.createLine(jobId, dto),
      onSuccess,
    }),
    updateLine: useMutation({
      mutationFn: ({ lineId, dto }: { lineId: string; dto: UpdateCcLineDto }) =>
        customsClearanceService.updateLine(jobId, lineId, dto),
      onSuccess,
    }),
    deleteLine: useMutation({
      mutationFn: (lineId: string) => customsClearanceService.deleteLine(jobId, lineId),
      onSuccess,
    }),
    classifyLine: useMutation({
      mutationFn: ({ lineId, dto }: { lineId: string; dto?: ClassifyCcLineDto }) =>
        customsClearanceService.classifyLine(jobId, lineId, dto),
      onSuccess,
    }),
    updateChecklistItem: useMutation({
      mutationFn: ({
        itemId,
        dto,
      }: {
        itemId: string;
        dto: UpdateCcChecklistItemDto;
      }) => customsClearanceService.updateChecklistItem(jobId, itemId, dto),
      onSuccess,
    }),
    seedChecklist: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.seedChecklist(jobId, dto),
      onSuccess,
    }),
    stageDocsComplete: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageDocsComplete(jobId, dto),
      onSuccess,
    }),
    stageClassify: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageClassify(jobId, dto),
      onSuccess,
    }),
    stageFile: useMutation({
      mutationFn: (dto?: CcStageActionDto) => customsClearanceService.stageFile(jobId, dto),
      onSuccess,
    }),
    updateFiling: useMutation({
      mutationFn: (dto: UpdateCcFilingDto) =>
        customsClearanceService.updateFiling(jobId, dto),
      onSuccess,
    }),
    stageAssess: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageAssess(jobId, dto),
      onSuccess,
    }),
    createQuery: useMutation({
      mutationFn: (dto: CreateCcQueryDto) => customsClearanceService.createQuery(jobId, dto),
      onSuccess,
    }),
    updateQuery: useMutation({
      mutationFn: ({ queryId, dto }: { queryId: string; dto: UpdateCcQueryDto }) =>
        customsClearanceService.updateQuery(jobId, queryId, dto),
      onSuccess,
    }),
    closeQuery: useMutation({
      mutationFn: ({
        queryId,
        dto,
      }: {
        queryId: string;
        dto?: CcStageActionDto;
      }) => customsClearanceService.closeQuery(jobId, queryId, dto),
      onSuccess,
    }),
    dutyPaymentRequest: useMutation({
      mutationFn: (dto?: DutyPaymentRequestDto) =>
        customsClearanceService.dutyPaymentRequest(jobId, dto),
      onSuccess,
    }),
    stageDutyPaid: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageDutyPaid(jobId, dto),
      onSuccess,
    }),
    stageClear: useMutation({
      mutationFn: (dto?: CcStageActionDto) => customsClearanceService.stageClear(jobId, dto),
      onSuccess,
    }),
    stageRelease: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageRelease(jobId, dto),
      onSuccess,
    }),
    stageInvoiceReady: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.stageInvoiceReady(jobId, dto),
      onSuccess,
    }),
    stageClose: useMutation({
      mutationFn: (dto?: CcStageActionDto) => customsClearanceService.stageClose(jobId, dto),
      onSuccess,
    }),
    linkFreight: useMutation({
      mutationFn: (dto: LinkFreightDto) => customsClearanceService.linkFreight(jobId, dto),
      onSuccess,
    }),
    unlinkFreight: useMutation({
      mutationFn: () => customsClearanceService.unlinkFreight(jobId),
      onSuccess,
    }),
    putDeclaration: useMutation({
      mutationFn: (dto: UpsertCcDeclarationDto) =>
        customsClearanceService.putDeclaration(jobId, dto),
      onSuccess,
    }),
    validateDeclaration: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.validateDeclaration(jobId, dto),
      onSuccess,
    }),
    submitDeclarationLocal: useMutation({
      mutationFn: (dto?: CcStageActionDto) =>
        customsClearanceService.submitDeclarationLocal(jobId, dto),
      onSuccess,
    }),
    entryPack: useMutation({
      mutationFn: (dto?: CcStageActionDto) => customsClearanceService.entryPack(jobId, dto),
      onSuccess,
    }),
    validateHs: useMutation({
      mutationFn: (dto: HsValidateDto) => customsClearanceService.validateHsCode(dto),
    }),
  };
}

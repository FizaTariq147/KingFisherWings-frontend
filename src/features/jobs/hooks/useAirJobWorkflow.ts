import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type {
  AirWorkflowActionDto,
  CreateAirUldRequestDto,
  GenerateJobDocumentDto,
} from '../types/job.types';
import { jobKeys, useInvalidateJobs } from './useJobs';

export const airJobKeys = {
  uldRequests: (jobId: string) => [...jobKeys.all, 'air-uld-requests', jobId] as const,
};

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useAirUldRequests(jobId: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: airJobKeys.uldRequests(jobId),
    queryFn: () => jobService.listAirUldRequests(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

/** Air freight commercial + ULD + stage + gated document actions. */
export function useAirJobWorkflow(jobId: string) {
  const invalidateJobs = useInvalidateJobs();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    invalidateJobs(jobId);
    void queryClient.invalidateQueries({ queryKey: airJobKeys.uldRequests(jobId) });
    void queryClient.invalidateQueries({ queryKey: jobKeys.airBookingForm(jobId) });
    void queryClient.invalidateQueries({ queryKey: jobKeys.documents(jobId) });
    void queryClient.invalidateQueries({ queryKey: jobKeys.docStatus(jobId) });
  };

  return {
    csTriage: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airCsTriage(jobId, dto),
      onSuccess,
    }),
    markQuoteSent: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airMarkQuoteSent(jobId, dto),
      onSuccess,
    }),
    sendInvoice: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airSendInvoice(jobId, dto),
      onSuccess,
    }),
    createUldRequest: useMutation({
      mutationFn: (dto: CreateAirUldRequestDto = {}) => jobService.createAirUldRequest(jobId, dto),
      onSuccess,
    }),
    issueUldRequest: useMutation({
      mutationFn: ({
        requestId,
        dto = {},
      }: {
        requestId: string;
        dto?: AirWorkflowActionDto;
      }) => jobService.issueAirUldRequest(jobId, requestId, dto),
      onSuccess,
    }),
    allocateUldRequest: useMutation({
      mutationFn: ({
        requestId,
        dto = {},
      }: {
        requestId: string;
        dto?: AirWorkflowActionDto;
      }) => jobService.allocateAirUldRequest(jobId, requestId, dto),
      onSuccess,
    }),
    stageBuildUp: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airStageBuildUp(jobId, dto),
      onSuccess,
    }),
    stageMawbReceived: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airStageMawbReceived(jobId, dto),
      onSuccess,
    }),
    stageMawbIssued: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airStageMawbIssued(jobId, dto),
      onSuccess,
    }),
    stagePod: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airStagePod(jobId, dto),
      onSuccess,
    }),
    confirmPayment: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airConfirmPayment(jobId, dto),
      onSuccess,
    }),
    closeReport: useMutation({
      mutationFn: (dto: AirWorkflowActionDto = {}) => jobService.airCloseReport(jobId, dto),
      onSuccess,
    }),
    hawbDraftGated: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawbDraftGated(jobId, dto),
      onSuccess,
    }),
    hawbFinalGated: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawbFinalGated(jobId, dto),
      onSuccess,
    }),
    preCanGated: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generatePreCanGated(jobId, dto),
      onSuccess,
    }),
    canGated: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateCanGated(jobId, dto),
      onSuccess,
    }),
    deliveryOrderGated: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) =>
        jobService.generateDeliveryOrderGated(jobId, dto),
      onSuccess,
    }),
  };
}

export function isAirJobType(jobType?: string): boolean {
  return jobType === 'AIR_EXPORT' || jobType === 'AIR_IMPORT';
}

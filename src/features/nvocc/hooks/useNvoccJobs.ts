import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import type { GenerateJobDocumentDto, SendPreAlertDto } from '@/features/jobs/types/job.types';
import { useAuthStore } from '@/store/authStore';
import { nvoccJobService } from '../services/nvocc.service';
import type { RecordNvoccMblReceivedDto } from '../types/nvocc.types';
import { useInvalidateJobs } from '@/features/jobs/hooks/useJobs';

export const nvoccJobKeys = {
  all: ['tenant', 'nvocc', 'jobs'] as const,
  generationStatus: (jobId: string) => [...nvoccJobKeys.all, jobId, 'generation-status'] as const,
};

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useNvoccJobGenerationStatus(jobId: string, enabled = false) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccJobKeys.generationStatus(jobId),
    queryFn: () => nvoccJobService.generationStatus(jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
    refetchInterval: enabled ? 5_000 : false,
  });
}

/** NVOCC job document + milestone actions (POST /nvocc/jobs/{id}/*). */
export function useNvoccJobActions(jobId: string) {
  const invalidateJobs = useInvalidateJobs();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    invalidateJobs(jobId);
    void queryClient.invalidateQueries({ queryKey: nvoccJobKeys.generationStatus(jobId) });
  };

  return {
    hblDraft: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.hblDraft(jobId, dto),
      onSuccess,
    }),
    hblOriginal: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.hblOriginal(jobId, dto),
      onSuccess,
    }),
    hblExpressRelease: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.hblExpressRelease(jobId, dto),
      onSuccess,
    }),
    surrenderNotice: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.surrenderNotice(jobId, dto),
      onSuccess,
    }),
    mbl: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.mbl(jobId, dto),
      onSuccess,
    }),
    preCan: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.preCan(jobId, dto),
      onSuccess,
    }),
    can: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.can(jobId, dto),
      onSuccess,
    }),
    deliveryOrder: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.deliveryOrder(jobId, dto),
      onSuccess,
    }),
    preAlertPdf: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.preAlertPdf(jobId, dto),
      onSuccess,
    }),
    bookingConfirmation: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.bookingConfirmation(jobId, dto),
      onSuccess,
    }),
    stuffingReport: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.stuffingReport(jobId, dto),
      onSuccess,
    }),
    cargoManifest: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.cargoManifest(jobId, dto),
      onSuccess,
    }),
    jobCard: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.jobCard(jobId, dto),
      onSuccess,
    }),
    jobPnl: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.jobPnl(jobId, dto),
      onSuccess,
    }),
    proformaInvoice: useMutation({
      mutationFn: (dto?: GenerateJobDocumentDto) => nvoccJobService.proformaInvoice(jobId, dto),
      onSuccess,
    }),
    mblReceived: useMutation({
      mutationFn: (dto?: RecordNvoccMblReceivedDto) => nvoccJobService.mblReceived(jobId, dto),
      onSuccess,
    }),
    sendPreAlert: useMutation({
      mutationFn: (dto: SendPreAlertDto) => nvoccJobService.sendPreAlert(jobId, dto),
      onSuccess,
    }),
    submitSi: useMutation({
      mutationFn: () => nvoccJobService.submitSi(jobId),
      onSuccess,
    }),
    submitVgm: useMutation({
      mutationFn: () => nvoccJobService.submitVgm(jobId),
      onSuccess,
    }),
    podReceived: useMutation({
      mutationFn: () => nvoccJobService.podReceived(jobId),
      onSuccess,
    }),
  };
}

export function isNvoccJobType(jobType?: string): boolean {
  return jobType === 'NVOCC_EXPORT' || jobType === 'NVOCC_IMPORT';
}

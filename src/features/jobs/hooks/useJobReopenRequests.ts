import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type {
  CreateJobReopenRequestDto,
  JobReopenRequestListParams,
  ReviewJobReopenRequestDto,
} from '../types/job.types';
import { jobKeys, useInvalidateJobs } from './useJobs';

export function useJobReopenRequests(
  params: JobReopenRequestListParams = {},
  options?: { enabled?: boolean },
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.reopenRequests(params),
    queryFn: () => jobService.listReopenRequests(params),
    enabled: Boolean(accessToken) && options?.enabled !== false,
  });
}

export function useCreateJobReopenRequest(jobId: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateJobReopenRequestDto) =>
      jobService.createReopenRequest(jobId, dto),
    onSuccess: () => {
      invalidate(jobId);
      void queryClient.invalidateQueries({ queryKey: jobKeys.reopenRequestsRoot });
    },
  });
}

export function useApproveJobReopenRequest() {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      dto,
      jobId,
    }: {
      requestId: string;
      dto?: ReviewJobReopenRequestDto;
      jobId?: string;
    }) => jobService.approveReopenRequest(requestId, dto ?? {}),
    onSuccess: (_data, vars) => {
      if (vars.jobId) invalidate(vars.jobId);
      else invalidate();
      void queryClient.invalidateQueries({ queryKey: jobKeys.reopenRequestsRoot });
    },
  });
}

export function useRejectJobReopenRequest() {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      dto,
      jobId,
    }: {
      requestId: string;
      dto: ReviewJobReopenRequestDto;
      jobId?: string;
    }) => jobService.rejectReopenRequest(requestId, dto),
    onSuccess: (_data, vars) => {
      if (vars.jobId) invalidate(vars.jobId);
      else invalidate();
      void queryClient.invalidateQueries({ queryKey: jobKeys.reopenRequestsRoot });
    },
  });
}

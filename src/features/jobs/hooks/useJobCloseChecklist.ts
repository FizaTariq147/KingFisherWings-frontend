import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import { jobKeys } from './useJobs';

export function useJobCloseChecklist(jobId: string, enabled = true) {
  const id = jobId?.trim() ?? '';
  return useQuery({
    queryKey: [...jobKeys.detail(id), 'close-checklist'] as const,
    queryFn: () => jobService.closeChecklist(id),
    enabled: Boolean(id) && enabled,
    staleTime: 15_000,
  });
}

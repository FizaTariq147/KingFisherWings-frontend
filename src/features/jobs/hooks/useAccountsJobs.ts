import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type { AccountsJobListParams } from '../types/job.types';
import { jobKeys } from './useJobs';

export function useAccountsJobs(
  params: AccountsJobListParams = {},
  options?: { enabled?: boolean },
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...jobKeys.all, 'accounts', params] as const,
    queryFn: () => jobService.listAccountsJobs(params),
    enabled: Boolean(accessToken) && options?.enabled !== false,
  });
}

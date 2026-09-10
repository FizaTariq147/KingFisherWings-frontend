import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { reportCatalogService } from '../services/reportCatalog.service';
import type { ReportGenerateRequest } from '../types/reportCatalog.types';

export const reportCatalogKeys = {
  all: ['tenant', 'report-catalog'] as const,
  list: (params: Record<string, unknown>) => [...reportCatalogKeys.all, 'list', params] as const,
  detail: (id: string) => [...reportCatalogKeys.all, 'detail', id] as const,
  job: (id: string) => [...reportCatalogKeys.all, 'job', id] as const,
};

export function useReportTemplates(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    family?: string;
    context?: string;
    rolloutPhase?: number;
  } = {},
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.list(params),
    queryFn: () => reportCatalogService.listTemplates(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useReportTemplate(idOrCode: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.detail(idOrCode),
    queryFn: () => reportCatalogService.getTemplate(idOrCode),
    enabled: Boolean(accessToken) && Boolean(idOrCode) && enabled,
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (dto: ReportGenerateRequest) => reportCatalogService.generate(dto),
  });
}

export function useReportJob(jobId: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.job(jobId),
    queryFn: () => reportCatalogService.getJob(jobId),
    enabled: Boolean(accessToken) && Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'running') return 2000;
      return false;
    },
  });
}

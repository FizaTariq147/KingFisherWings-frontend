import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { savedReportService } from '../services/savedReport.service';
import type {
  CreateSavedReportDto,
  SavedReportListParams,
  UpdateSavedReportDto,
} from '../types/savedReport.types';

export const savedReportKeys = {
  all: ['tenant', 'gl-saved-reports'] as const,
  list: (params: SavedReportListParams) => [...savedReportKeys.all, 'list', params] as const,
  detail: (id: string) => [...savedReportKeys.all, 'detail', id] as const,
};

export function useSavedReports(params: SavedReportListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: savedReportKeys.list(params),
    queryFn: () => savedReportService.list(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useSavedReport(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: savedReportKeys.detail(id),
    queryFn: () => savedReportService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateSavedReports() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: savedReportKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: savedReportKeys.detail(detailId) });
    }
  };
}

export function useCreateSavedReport() {
  const invalidate = useInvalidateSavedReports();
  return useMutation({
    mutationFn: (dto: CreateSavedReportDto) => savedReportService.create(dto),
    onSuccess: (r) => invalidate(r.id),
  });
}

export function useUpdateSavedReport(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSavedReportDto) => savedReportService.update(id, dto),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: savedReportKeys.all });
      queryClient.setQueryData(savedReportKeys.detail(id), r);
    },
  });
}

export function useDeleteSavedReport() {
  const invalidate = useInvalidateSavedReports();
  return useMutation({
    mutationFn: (id: string) => savedReportService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

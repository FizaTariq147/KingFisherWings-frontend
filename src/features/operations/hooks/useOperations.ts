import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { operationsService } from '../services/operations.service';
import type {
  OperationsDashboardQueryDto,
  OperationsListParams,
  PatchImportCargoDeliveryDto,
} from '../types/operations.types';

export const operationsKeys = {
  all: ['operations'] as const,
  importCargo: (params: OperationsListParams) =>
    [...operationsKeys.all, 'import-cargo-delivery', params] as const,
  dashboard: (params: OperationsListParams) =>
    [...operationsKeys.all, 'dashboard', params] as const,
  closedReport: (params: OperationsListParams) =>
    [...operationsKeys.all, 'closed-job-report', params] as const,
};

export function useImportCargoDelivery(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.importCargo(params),
    queryFn: () => operationsService.listImportCargoDelivery(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useOperationsDashboard(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.dashboard(params),
    queryFn: () => operationsService.getDashboard(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useClosedJobReport(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.closedReport(params),
    queryFn: () => operationsService.getClosedJobReport(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useOperationsMutations() {
  const queryClient = useQueryClient();
  return {
    patchImportCargoDelivery: useMutation({
      mutationFn: ({
        jobId,
        dto,
      }: {
        jobId: string;
        dto: PatchImportCargoDeliveryDto;
      }) => operationsService.patchImportCargoDelivery(jobId, dto),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: operationsKeys.all });
      },
    }),
    downloadClosedJobReport: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto) =>
        operationsService.downloadClosedJobReport(dto),
    }),
  };
}

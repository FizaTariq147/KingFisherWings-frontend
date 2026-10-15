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
  jobNotInvoicedDo: (params: OperationsListParams) =>
    [...operationsKeys.all, 'job-not-invoiced-do', params] as const,
  jobFinanceReport: (params: OperationsListParams) =>
    [...operationsKeys.all, 'job-finance-report', params] as const,
  exceptions: (params: OperationsListParams) =>
    [...operationsKeys.all, 'exceptions', params] as const,
  kpiStatus: (params: OperationsListParams) =>
    [...operationsKeys.all, 'kpi-status', params] as const,
  jobListSummary: (params: OperationsListParams) =>
    [...operationsKeys.all, 'job-list-summary', params] as const,
  voyageJobsShipments: (params: OperationsListParams) =>
    [...operationsKeys.all, 'voyage-jobs-shipments', params] as const,
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

export function useJobNotInvoicedDo(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.jobNotInvoicedDo(params),
    queryFn: () => operationsService.listJobNotInvoicedDo(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useJobFinanceReport(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.jobFinanceReport(params),
    queryFn: () => operationsService.listJobFinanceReport(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useOperationsExceptions(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.exceptions(params),
    queryFn: () => operationsService.listExceptions(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useOperationsKpiStatus(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.kpiStatus(params),
    queryFn: () => operationsService.listKpiStatus(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useJobListSummary(params: OperationsListParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.jobListSummary(params),
    queryFn: () => operationsService.listJobListSummary(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useVoyageJobsShipments(
  params: OperationsListParams & { voyage_number?: string; vessel_name?: string },
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: operationsKeys.voyageJobsShipments(params),
    queryFn: () => operationsService.listVoyageJobsShipments(params),
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
    downloadJobNotInvoicedDo: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto = {}) =>
        operationsService.downloadJobNotInvoicedDo(dto),
    }),
    downloadJobFinanceReport: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto = {}) =>
        operationsService.downloadJobFinanceReport(dto),
    }),
    downloadExceptions: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto = {}) =>
        operationsService.downloadExceptions(dto),
    }),
    downloadKpiStatus: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto = {}) =>
        operationsService.downloadKpiStatus(dto),
    }),
    downloadJobListSummary: useMutation({
      mutationFn: (dto: OperationsDashboardQueryDto = {}) =>
        operationsService.downloadJobListSummary(dto),
    }),
  };
}

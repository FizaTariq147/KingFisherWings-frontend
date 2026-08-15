import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { ManagementDateParams, ManagementReportParams } from '../types/management.types';
import type { ManagementReportId } from '../api/management.api';
import { managementService } from '../services/management.service';

const keys = {
  all: ['management'] as const,
  complaints: (status?: string) => [...keys.all, 'complaints', status ?? 'all'] as const,
  users: (search?: string) => [...keys.all, 'users', search ?? ''] as const,
  subscription: () => [...keys.all, 'subscription'] as const,
  backupHistory: () => [...keys.all, 'backup-history'] as const,
  dashboard: (params: ManagementDateParams) => [...keys.all, 'dashboard', params] as const,
  performance: (params: ManagementDateParams) => [...keys.all, 'performance', params] as const,
  profitability: (params: ManagementDateParams, groupBy: string) =>
    [...keys.all, 'profitability', params, groupBy] as const,
};

function enabled() {
  return Boolean(useAuthStore.getState().accessToken);
}

export function useManagementComplaints(status?: string) {
  return useQuery({
    queryKey: keys.complaints(status),
    queryFn: () => managementService.listComplaints(status),
    enabled: enabled(),
  });
}

export function useManagementUsers(search?: string) {
  return useQuery({
    queryKey: keys.users(search),
    queryFn: () => managementService.listUsers(search),
    enabled: enabled(),
  });
}

export function useManagementSubscriptionKey() {
  return useQuery({
    queryKey: keys.subscription(),
    queryFn: () => managementService.getSubscriptionKey(),
    enabled: enabled(),
  });
}

export function useManagementBackupHistory() {
  return useQuery({
    queryKey: keys.backupHistory(),
    queryFn: () => managementService.listBackupHistory(),
    enabled: enabled(),
  });
}

export function useManagementDashboard(params: ManagementDateParams, active = true) {
  return useQuery({
    queryKey: keys.dashboard(params),
    queryFn: () => managementService.loadDashboardCharts(params),
    enabled: enabled() && active,
  });
}

export function useManagementPerformance(params: ManagementDateParams, active = false) {
  return useQuery({
    queryKey: keys.performance(params),
    queryFn: () => managementService.loadUserPerformance(params),
    enabled: enabled() && active,
    staleTime: 30_000,
  });
}

export function useManagementProfitability(
  params: ManagementDateParams,
  groupBy: 'customer' | 'job_type' | 'branch' | 'salesperson' = 'customer',
  active = true,
) {
  return useQuery({
    queryKey: keys.profitability(params, groupBy),
    queryFn: () => managementService.loadProfitabilityReport(params, groupBy),
    enabled: enabled() && active,
  });
}

export function useManagementBackupRequest() {
  return useMutation({
    mutationFn: (labels: string[]) => managementService.requestBackup(labels),
  });
}

export function useManagementReport() {
  return useMutation({
    mutationFn: ({ id, params }: { id: ManagementReportId; params: ManagementReportParams }) =>
      managementService.runReport(id, params),
  });
}

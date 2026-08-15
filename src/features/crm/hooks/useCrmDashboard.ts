import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmDashboardService } from '../services/crmDashboard.service';
import type { CreateBudgetDto, DashboardParams, ReportParams } from '../types/crm.types';
const keys = { all: ['tenant', 'crm', 'dashboard'] as const, overview: (p: DashboardParams) => ['tenant', 'crm', 'dashboard', p] as const, budgets: (id?: string) => ['tenant', 'crm', 'budgets', id] as const };
export const useCrmDashboard = (params: DashboardParams) => { const t = useAuthStore(s => s.accessToken); return useQuery({ queryKey: keys.overview(params), queryFn: () => crmDashboardService.overview(params), enabled: Boolean(t) }); };
export const useCrmBudgets = (salespersonId?: string) => {
  const t = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: keys.budgets(salespersonId),
    queryFn: () => crmDashboardService.budgets(salespersonId!),
    enabled: Boolean(t && salespersonId),
  });
};
export const useCreateCrmBudget = () => { const c = useQueryClient(); return useMutation({ mutationFn: (dto: CreateBudgetDto) => crmDashboardService.createBudget(dto), onSuccess: () => c.invalidateQueries({ queryKey: ['tenant', 'crm', 'budgets'] }) }); };
export const useCrmReport = () => useMutation({ mutationFn: (params: ReportParams) => crmDashboardService.report(params) });

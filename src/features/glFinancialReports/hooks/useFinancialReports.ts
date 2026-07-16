import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { ReportCommonParams, VatReturnParams } from '../types/financialReports.types';
import { financialReportsService } from '../services/financialReports.service';

export const glFinancialReportsKeys = {
  all: ['tenant', 'gl-financial-reports'] as const,
  trialBalance: (params: ReportCommonParams) => [...glFinancialReportsKeys.all, 'trial-balance', params] as const,
  balanceSheet: (params: ReportCommonParams) => [...glFinancialReportsKeys.all, 'balance-sheet', params] as const,
  profitAndLoss: (params: ReportCommonParams) => [...glFinancialReportsKeys.all, 'profit-loss', params] as const,
  cashFlow: (params: ReportCommonParams) => [...glFinancialReportsKeys.all, 'cash-flow', params] as const,
  vatReturn: (params: VatReturnParams) => [...glFinancialReportsKeys.all, 'vat-return', params] as const,
};

function useEnabled() {
  return Boolean(useAuthStore((s) => s.accessToken));
}

export function useTrialBalanceReport(params: ReportCommonParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: glFinancialReportsKeys.trialBalance(params),
    queryFn: () => financialReportsService.trialBalance(params),
    enabled,
  });
}

export function useBalanceSheetReport(params: ReportCommonParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: glFinancialReportsKeys.balanceSheet(params),
    queryFn: () => financialReportsService.balanceSheet(params),
    enabled,
  });
}

export function useProfitAndLossReport(params: ReportCommonParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: glFinancialReportsKeys.profitAndLoss(params),
    queryFn: () => financialReportsService.profitAndLoss(params),
    enabled,
  });
}

export function useCashFlowReport(params: ReportCommonParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: glFinancialReportsKeys.cashFlow(params),
    queryFn: () => financialReportsService.cashFlow(params),
    enabled,
  });
}

export function useVatReturnReport(params: VatReturnParams, enabledWhenValid = true) {
  const enabled = useEnabled() && Boolean(params.from_date) && Boolean(params.to_date) && enabledWhenValid;
  return useQuery({
    queryKey: glFinancialReportsKeys.vatReturn(params),
    queryFn: () => financialReportsService.vatReturn(params),
    enabled,
  });
}

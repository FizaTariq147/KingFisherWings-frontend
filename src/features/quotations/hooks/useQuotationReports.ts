import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { quotationService } from '../services/quotation.service';
import type {
  QuotationAnalyticsParams,
  QuotationReportParams,
} from '../types/quotation.types';
import { quotationKeys } from './useQuotations';

export function useQuotationChargewiseReport(params: QuotationReportParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...quotationKeys.reports, 'chargewise', params] as const,
    queryFn: () => quotationService.reportChargewise(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useQuotationAnalytics(params: QuotationAnalyticsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...quotationKeys.reports, 'analytics', params] as const,
    queryFn: () => quotationService.reportAnalytics(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useQuotationConversion(params: QuotationAnalyticsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...quotationKeys.reports, 'conversion', params] as const,
    queryFn: () => quotationService.reportConversion(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useQuotationLostReasons(params: QuotationAnalyticsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...quotationKeys.reports, 'lost-reasons', params] as const,
    queryFn: () => quotationService.reportLostReasons(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useQuotationResponseTime(params: QuotationAnalyticsParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...quotationKeys.reports, 'response-time', params] as const,
    queryFn: () => quotationService.reportResponseTime(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

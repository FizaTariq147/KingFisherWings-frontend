import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { MisParams, MisProfitabilityParams } from '../types/glMis.types';
import { glMisService } from '../services/glMis.service';

const keys = {
  all: ['tenant', 'gl-mis'] as const,
  dashboard: (params: MisParams) => [...keys.all, 'dashboard', params] as const,
  profitability: (params: MisProfitabilityParams) => [...keys.all, 'profitability', params] as const,
  operational: (params: MisParams) => [...keys.all, 'operational', params] as const,
};

function useEnabled() {
  return Boolean(useAuthStore((s) => s.accessToken));
}

export function useMisDashboard(params: MisParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: keys.dashboard(params),
    queryFn: () => glMisService.dashboard(params),
    enabled,
  });
}

export function useMisProfitability(params: MisProfitabilityParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: keys.profitability(params),
    queryFn: () => glMisService.profitability(params),
    enabled,
  });
}

export function useMisOperational(params: MisParams = {}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: keys.operational(params),
    queryFn: () => glMisService.operational(params),
    enabled,
  });
}

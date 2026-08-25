import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  fetchOpenJobsSummary,
  fetchRecentJobs,
  fetchShipmentsByModeSummary,
  fetchUpcomingEtds,
} from '../services/jobDashboard.service';

export const jobDashboardKeys = {
  all: ['tenant', 'jobs', 'dashboard'] as const,
  open: () => [...jobDashboardKeys.all, 'open'] as const,
  byMode: () => [...jobDashboardKeys.all, 'by-mode'] as const,
  recent: (limit: number) => [...jobDashboardKeys.all, 'recent', limit] as const,
  upcomingEtds: (days: number) => [...jobDashboardKeys.all, 'upcoming-etds', days] as const,
};

export function useOpenJobsSummary() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobDashboardKeys.open(),
    queryFn: fetchOpenJobsSummary,
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useShipmentsByModeSummary() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobDashboardKeys.byMode(),
    queryFn: fetchShipmentsByModeSummary,
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useRecentJobs(limit = 5) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobDashboardKeys.recent(limit),
    queryFn: () => fetchRecentJobs(limit),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useUpcomingEtds(days = 7) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobDashboardKeys.upcomingEtds(days),
    queryFn: () => fetchUpcomingEtds(days),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

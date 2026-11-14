import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '../services/organization.service';
import type { OrganizationProfileFormValues } from '../types/organization.types';

/**
 * Organization React Query keys — scoped by tenantId to prevent cross-tenant
 * branding leakage when soft logout does not full-reload the SPA.
 */
export const organizationKeys = {
  root: ['tenant', 'organization'] as const,
  all: (tenantId?: string | null) =>
    [...organizationKeys.root, tenantId?.trim() || 'unknown'] as const,
  profile: (tenantId?: string | null) =>
    [...organizationKeys.all(tenantId), 'profile'] as const,
  jobCreateSettings: (tenantId?: string | null) =>
    [...organizationKeys.all(tenantId), 'job-create-settings'] as const,
};

export function useOrganizationProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: organizationKeys.profile(tenantId),
    queryFn: () => organizationService.getProfile(),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useUpdateOrganizationProfile() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useMutation({
    mutationFn: (values: OrganizationProfileFormValues) =>
      organizationService.updateProfile(values),
    onSuccess: (profile) => {
      queryClient.setQueryData(organizationKeys.profile(tenantId), profile);
    },
  });
}

/** GET /organization/settings/job-create */
export function useJobCreateSettings(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: organizationKeys.jobCreateSettings(tenantId),
    queryFn: () => organizationService.getJobCreateSettings(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

/** PATCH /organization/settings/job-create */
export function useUpdateJobCreateSettings() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      organizationService.updateJobCreateSettings(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.jobCreateSettings(tenantId), data);
    },
  });
}

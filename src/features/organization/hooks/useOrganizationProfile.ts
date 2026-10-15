import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '../services/organization.service';
import type { OrganizationProfileFormValues } from '../types/organization.types';

export const organizationKeys = {
  all: ['tenant', 'organization'] as const,
  profile: () => [...organizationKeys.all, 'profile'] as const,
  jobCreateSettings: () => [...organizationKeys.all, 'job-create-settings'] as const,
};

export function useOrganizationProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: organizationKeys.profile(),
    queryFn: () => organizationService.getProfile(),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useUpdateOrganizationProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: OrganizationProfileFormValues) =>
      organizationService.updateProfile(values),
    onSuccess: (profile) => {
      queryClient.setQueryData(organizationKeys.profile(), profile);
    },
  });
}

/** GET /organization/settings/job-create */
export function useJobCreateSettings(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: organizationKeys.jobCreateSettings(),
    queryFn: () => organizationService.getJobCreateSettings(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

/** PATCH /organization/settings/job-create */
export function useUpdateJobCreateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      organizationService.updateJobCreateSettings(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.jobCreateSettings(), data);
    },
  });
}

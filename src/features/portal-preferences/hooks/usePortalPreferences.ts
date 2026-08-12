import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalPreferencesService } from '../services/portalPreferences.service';
import type { UpdatePortalPreferencesDto } from '../types/portalPreferences.types';

export const portalPreferenceKeys = {
  all: (scope: string) => ['portal', scope, 'preferences'] as const,
};

export function usePortalPreferences(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPreferenceKeys.all(scope),
    queryFn: () => portalPreferencesService.get(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useUpdatePortalPreferences() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: UpdatePortalPreferencesDto) => portalPreferencesService.update(dto),
    onSuccess: (prefs) => {
      if (scope !== 'anon') {
        qc.setQueryData(portalPreferenceKeys.all(scope), prefs);
      }
    },
  });
}

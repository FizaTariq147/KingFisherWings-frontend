import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { isUuid } from '@/lib/isUuid';
import { portalCcService } from '../services/portalCc.service';

export const portalCcKeys = {
  all: (scope: string) => ['portal', scope, 'cc-jobs'] as const,
  list: (scope: string) => [...portalCcKeys.all(scope), 'list'] as const,
  detail: (scope: string, id: string) => [...portalCcKeys.all(scope), 'detail', id] as const,
  checklist: (scope: string, id: string) =>
    [...portalCcKeys.all(scope), 'checklist', id] as const,
};

export function usePortalCcJobs() {
  const scope = usePortalQueryScope();
  const token = usePortalAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalCcKeys.list(scope),
    queryFn: () => portalCcService.list(),
    enabled: Boolean(token),
  });
}

export function usePortalCcJob(id: string) {
  const scope = usePortalQueryScope();
  const token = usePortalAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalCcKeys.detail(scope, id),
    queryFn: () => portalCcService.getById(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function usePortalCcChecklist(id: string) {
  const scope = usePortalQueryScope();
  const token = usePortalAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalCcKeys.checklist(scope, id),
    queryFn: () => portalCcService.checklist(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function usePortalCcUpload(id: string) {
  const scope = usePortalQueryScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => portalCcService.uploadDocument(id, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalCcKeys.detail(scope, id) });
      void queryClient.invalidateQueries({ queryKey: portalCcKeys.checklist(scope, id) });
    },
  });
}

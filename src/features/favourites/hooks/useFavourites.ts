import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { isUuid } from '@/lib/isUuid';
import {
  favouritesService,
  type CreateFavouriteDto,
} from '../services/favourites.service';

export const favouritesKeys = {
  all: ['favourites'] as const,
  list: () => [...favouritesKeys.all, 'list'] as const,
  check: (kind: string, targetKey: string) =>
    [...favouritesKeys.all, 'check', kind, targetKey] as const,
};

export function useFavouritesList(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: favouritesKeys.list(),
    queryFn: () => favouritesService.list(),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useFavouriteCheck(
  kind: string,
  targetKey: string,
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: favouritesKeys.check(kind, targetKey),
    queryFn: () => favouritesService.check(kind, targetKey),
    enabled:
      Boolean(accessToken) &&
      Boolean(kind.trim()) &&
      isUuid(targetKey) &&
      enabled,
  });
}

export function useFavouritesMutations() {
  const queryClient = useQueryClient();
  const invalidate = (kind?: string, targetKey?: string) => {
    void queryClient.invalidateQueries({ queryKey: favouritesKeys.all });
    if (kind && targetKey) {
      void queryClient.invalidateQueries({
        queryKey: favouritesKeys.check(kind, targetKey),
      });
    }
  };

  return {
    create: useMutation({
      mutationFn: (dto: CreateFavouriteDto) => favouritesService.create(dto),
      onSuccess: (_d, vars) => invalidate(vars.kind, vars.target_key),
    }),
    toggle: useMutation({
      mutationFn: (dto: CreateFavouriteDto) => favouritesService.toggle(dto),
      onSuccess: (_d, vars) => invalidate(vars.kind, vars.target_key),
    }),
    remove: useMutation({
      mutationFn: (id: string) => favouritesService.remove(id),
      onSuccess: () => invalidate(),
    }),
  };
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { masterService } from '../services/master.service';
import type { MasterListParams, MasterRecord } from '../types/master.types';

export const masterKeys = {
  all: ['masters'] as const,
  resource: (key: string) => [...masterKeys.all, key] as const,
  list: (key: string, params: MasterListParams) =>
    [...masterKeys.resource(key), 'list', params] as const,
  detail: (key: string, id: string) => [...masterKeys.resource(key), 'detail', id] as const,
  options: (key: string) => [...masterKeys.resource(key), 'options'] as const,
};

export function useMasterList(resourceKey: string, basePath: string, params: MasterListParams) {
  return useQuery({
    queryKey: masterKeys.list(resourceKey, params),
    queryFn: () => masterService.list(basePath, params),
    enabled: Boolean(resourceKey && basePath),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMasterDetail(resourceKey: string, basePath: string, id: string) {
  return useQuery({
    queryKey: masterKeys.detail(resourceKey, id),
    queryFn: () => masterService.getById(basePath, id),
    enabled: Boolean(basePath) && isUuid(id),
  });
}

/** Compact list for select dropdowns. */
export function useMasterOptions(
  resourceKey: string,
  basePath: string,
  enabled = true,
  /** When true, include inactive rows (e.g. departments must list everything). */
  includeInactive = false,
) {
  return useQuery({
    queryKey: [...masterKeys.options(resourceKey), includeInactive ? 'all' : 'active'] as const,
    queryFn: async () => {
      if (includeInactive) {
        return (
          await masterService.list(basePath, {
            page: 1,
            limit: 500,
          })
        ).items;
      }
      // Prefer active rows; if none, fall back to any so dependent selects are usable.
      const active = await masterService.list(basePath, {
        page: 1,
        limit: 200,
        is_active: true,
      });
      if (active.items.length > 0) return active.items;
      const all = await masterService.list(basePath, { page: 1, limit: 200 });
      return all.items;
    },
    enabled: enabled && Boolean(basePath),
    staleTime: 60_000,
  });
}

function useInvalidateMaster(resourceKey: string) {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: masterKeys.resource(resourceKey) });
    queryClient.invalidateQueries({ queryKey: masterKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: masterKeys.detail(resourceKey, detailId) });
    }
  };
}

export function useMasterMutations(resourceKey: string, basePath: string) {
  const invalidate = useInvalidateMaster(resourceKey);

  const create = useMutation({
    mutationFn: (dto: Record<string, unknown>) => masterService.create(basePath, dto),
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Record<string, unknown> }) =>
      masterService.update(basePath, id, dto),
    onSuccess: (_data, { id }) => invalidate(id),
  });

  const remove = useMutation({
    mutationFn: (id: string) => masterService.softDelete(basePath, id),
    onSuccess: (_data, id) => invalidate(id),
  });

  const setActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      masterService.setActive(basePath, id, is_active),
    onSuccess: (_data: MasterRecord, { id }) => invalidate(id),
  });

  return { create, update, remove, setActive };
}

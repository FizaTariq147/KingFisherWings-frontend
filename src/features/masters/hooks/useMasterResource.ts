import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '../api/masterPaths';
import { masterService } from '../services/master.service';
import type { MasterListParams, MasterRecord } from '../types/master.types';
import { masterPlacesToSelectOptions } from '../utils/placeLabel';

export const masterKeys = {
  all: ['masters'] as const,
  resource: (key: string) => [...masterKeys.all, key] as const,
  list: (key: string, params: MasterListParams) =>
    [...masterKeys.resource(key), 'list', params] as const,
  detail: (key: string, id: string) => [...masterKeys.resource(key), 'detail', id] as const,
  options: (key: string) => [...masterKeys.resource(key), 'options'] as const,
  placeOptions: (kind: 'ports' | 'airports', search: string) =>
    [...masterKeys.options(kind), 'place-typeahead', search] as const,
};

export function useMasterList(
  resourceKey: string,
  basePath: string,
  params: MasterListParams,
  options?: { fetchAll?: boolean },
) {
  const isWorldPlace = resourceKey === 'ports' || resourceKey === 'airports';
  const fetchAll = Boolean(options?.fetchAll);
  // Exclude page/limit from the all-pages cache key so paging is client-side.
  const queryParams: MasterListParams = fetchAll
    ? {
        search: params.search,
        is_active: params.is_active,
        order: params.order,
        extra: params.extra,
      }
    : params;

  return useQuery({
    queryKey: [...masterKeys.list(resourceKey, queryParams), fetchAll ? 'all-pages' : 'paged'],
    queryFn: () =>
      fetchAll
        ? masterService.listAll(basePath, queryParams, 500)
        : masterService.list(basePath, params),
    enabled: Boolean(resourceKey && basePath),
    placeholderData: keepPreviousData,
    // Ports/airports change after seed — don't keep stale catalogs.
    staleTime: isWorldPlace ? 0 : 30_000,
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
            order: 'asc',
          })
        ).items;
      }
      // Prefer active rows; if none, fall back to any so dependent selects are usable.
      // Ports/airports: backend orders by name and may auto-seed the world catalog.
      const active = await masterService.list(basePath, {
        page: 1,
        limit: 500,
        is_active: true,
        order: 'asc',
      });
      if (active.items.length > 0) return active.items;
      const all = await masterService.list(basePath, { page: 1, limit: 500, order: 'asc' });
      return all.items;
    },
    enabled: enabled && Boolean(basePath),
    staleTime: 60_000,
  });
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * World ports/airports typeahead for quote & job dropdowns.
 * GET /masters/ports|airports with search=, limit≤500, order=asc (name).
 */
export function useMasterPlaceOptions(
  kind: 'ports' | 'airports',
  search = '',
  enabled = true,
  /** Keep currently selected IDs visible even when not in the search page. */
  ensureIds: string[] = [],
) {
  const basePath = MASTER_PATHS[kind];
  const q = search.trim();
  const ensureKey = ensureIds.filter((id) => isUuid(id)).sort().join(',');

  const listQuery = useQuery({
    queryKey: masterKeys.placeOptions(kind, q),
    queryFn: async () => {
      const active = await masterService.list(basePath, {
        page: 1,
        limit: 500,
        search: q || undefined,
        is_active: true,
        order: 'asc',
      });
      if (active.items.length > 0) return active.items;
      return (
        await masterService.list(basePath, {
          page: 1,
          limit: 500,
          search: q || undefined,
          order: 'asc',
        })
      ).items;
    },
    enabled: enabled && Boolean(basePath),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const missingIds = useMemo(() => {
    const have = new Set((listQuery.data ?? []).map((r) => String(r.id)));
    return ensureKey
      .split(',')
      .filter((id) => id && isUuid(id) && !have.has(id));
  }, [listQuery.data, ensureKey]);

  const ensureQuery = useQuery({
    queryKey: [...masterKeys.options(kind), 'ensure', ensureKey] as const,
    queryFn: async () => {
      const rows: MasterRecord[] = [];
      for (const id of missingIds) {
        try {
          rows.push(await masterService.getById(basePath, id));
        } catch {
          /* ignore missing */
        }
      }
      return rows;
    },
    enabled: enabled && missingIds.length > 0,
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    const byId = new Map<string, MasterRecord>();
    for (const row of ensureQuery.data ?? []) byId.set(String(row.id), row);
    for (const row of listQuery.data ?? []) byId.set(String(row.id), row);
    return masterPlacesToSelectOptions([...byId.values()]);
  }, [listQuery.data, ensureQuery.data]);

  return {
    options,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
  };
}

/** Debounced search state for place typeaheads. */
export function usePlaceSearchQuery(delayMs = 300) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, delayMs);
  return { query, setQuery, debouncedSearch: debounced };
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

  const seedDefaults = useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      masterService.seedDefaults(basePath, body),
    onSuccess: () => invalidate(),
  });

  return { create, update, remove, setActive, seedDefaults };
}

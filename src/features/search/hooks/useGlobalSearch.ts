import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MIN_CHARS,
} from '../constants/search.constants';
import { searchService } from '../services/search.service';
import type { GlobalSearchParams } from '../types/search.types';

export const searchKeys = {
  all: ['tenant', 'global-search'] as const,
  query: (params: GlobalSearchParams) => [...searchKeys.all, params] as const,
};

export function useDebouncedValue<T>(value: T, delayMs = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Global search via GET /search.
 * TanStack Query cancels the previous in-flight request when the query key changes.
 * (Project data layer is React Query + Zustand — not Redux.)
 */
export function useGlobalSearch(
  params: Omit<GlobalSearchParams, 'q'> & { q: string },
  options?: { enabled?: boolean; debounceMs?: number },
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const debouncedQ = useDebouncedValue(params.q.trim(), options?.debounceMs ?? SEARCH_DEBOUNCE_MS);
  const ready =
    Boolean(accessToken) &&
    options?.enabled !== false &&
    debouncedQ.length >= SEARCH_MIN_CHARS;

  const queryParams: GlobalSearchParams = {
    ...params,
    q: debouncedQ,
    limit: params.limit ?? SEARCH_DEFAULT_LIMIT,
  };

  const query = useQuery({
    queryKey: searchKeys.query(queryParams),
    queryFn: ({ signal }) => searchService.search(queryParams, { signal }),
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: false,
  });

  return {
    ...query,
    debouncedQuery: debouncedQ,
    isWaitingForDebounce: params.q.trim() !== debouncedQ && params.q.trim().length >= SEARCH_MIN_CHARS,
    canSearch: params.q.trim().length >= SEARCH_MIN_CHARS,
  };
}

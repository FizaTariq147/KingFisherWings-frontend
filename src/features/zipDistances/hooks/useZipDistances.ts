import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { zipDistanceService } from '../services/zipDistance.service';
import type {
  CreateZipDistanceDto,
  UpdateZipDistanceDto,
  ZipDistanceListParams,
  ZipDistanceListResult,
} from '../types/zipDistance.types';

export const zipDistanceKeys = {
  all: ['tenant', 'zip-distances'] as const,
  list: (params: ZipDistanceListParams) => [...zipDistanceKeys.all, 'list', params] as const,
  detail: (id: string) => [...zipDistanceKeys.all, 'detail', id] as const,
};

export function useZipDistances(params: ZipDistanceListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: zipDistanceKeys.list(params),
    queryFn: () => zipDistanceService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useZipDistance(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: zipDistanceKeys.detail(id),
    queryFn: () => zipDistanceService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id?.trim()),
  });
}

function useInvalidateZipDistances() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: zipDistanceKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: zipDistanceKeys.detail(detailId) });
    }
  };
}

export function useCreateZipDistance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateZipDistanceDto) => zipDistanceService.create(dto),
    onSuccess: (created) => {
      queryClient.setQueryData(zipDistanceKeys.detail(created.id), created);
      queryClient.setQueriesData<ZipDistanceListResult>(
        { queryKey: [...zipDistanceKeys.all, 'list'] },
        (prev) => {
          if (!prev) {
            return {
              items: [created],
              meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
              backendListUnavailable: true,
            };
          }
          if (prev.items.some((z) => z.id === created.id)) return prev;
          return {
            ...prev,
            items: [created, ...prev.items],
            meta: {
              ...prev.meta,
              total: prev.meta.total + 1,
              totalPages: Math.max(
                1,
                Math.ceil((prev.meta.total + 1) / Math.max(prev.meta.limit, 1)),
              ),
            },
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: zipDistanceKeys.all });
    },
  });
}

export function useUpdateZipDistance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateZipDistanceDto) => zipDistanceService.update(id, dto),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: zipDistanceKeys.all });
      queryClient.setQueryData(zipDistanceKeys.detail(id), item);
    },
  });
}

export function useDeleteZipDistance() {
  const invalidate = useInvalidateZipDistances();
  return useMutation({
    mutationFn: (id: string) => zipDistanceService.softDelete(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useSetZipDistanceActive() {
  const invalidate = useInvalidateZipDistances();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      zipDistanceService.setActive(id, is_active),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

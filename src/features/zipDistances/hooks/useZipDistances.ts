import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { zipDistanceService } from '../services/zipDistance.service';
import type {
  CreateZipDistanceDto,
  UpdateZipDistanceDto,
  ZipDistanceListParams,
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
    enabled: Boolean(accessToken) && isUuid(id),
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
  const invalidate = useInvalidateZipDistances();
  return useMutation({
    mutationFn: (dto: CreateZipDistanceDto) => zipDistanceService.create(dto),
    onSuccess: (item) => invalidate(item.id),
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { quotationServiceCatalogService } from '../services/quotationServiceCatalog.service';
import type {
  CreateServiceCatalogItemDto,
  ServiceCatalogListParams,
  UpdateServiceCatalogItemDto,
} from '../types/quotationExtended.types';

export const serviceCatalogKeys = {
  all: ['tenant', 'quotations', 'service-catalog'] as const,
  list: (params: ServiceCatalogListParams) => [...serviceCatalogKeys.all, 'list', params] as const,
  detail: (id: string) => [...serviceCatalogKeys.all, 'detail', id] as const,
};

export function useServiceCatalog(params: ServiceCatalogListParams = {}) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: serviceCatalogKeys.list(params),
    queryFn: () => quotationServiceCatalogService.list(params),
    enabled: Boolean(token),
  });
}

export function useServiceCatalogMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: serviceCatalogKeys.all });
  return {
    create: useMutation({
      mutationFn: (dto: CreateServiceCatalogItemDto) => quotationServiceCatalogService.create(dto),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateServiceCatalogItemDto }) =>
        quotationServiceCatalogService.update(id, dto),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => quotationServiceCatalogService.remove(id),
      onSuccess: invalidate,
    }),
  };
}

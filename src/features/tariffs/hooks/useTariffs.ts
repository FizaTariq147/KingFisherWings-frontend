import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tariffService } from '../services/tariff.service';
import type {
  CreateTariffDto,
  TariffListParams,
  TariffListResult,
  UpdateTariffDto,
} from '../types/tariff.types';

export const tariffKeys = {
  all: ['tenant', 'tariffs'] as const,
  list: (params: TariffListParams) => [...tariffKeys.all, 'list', params] as const,
  detail: (id: string) => [...tariffKeys.all, 'detail', id] as const,
};

export function useTariffs(params: TariffListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: tariffKeys.list(params),
    queryFn: () => tariffService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useTariff(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: tariffKeys.detail(id),
    queryFn: () => tariffService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id?.trim()),
  });
}

function useInvalidateTariffs() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: tariffKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: tariffKeys.detail(detailId) });
    }
  };
}

export function useCreateTariff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTariffDto) => tariffService.create(dto),
    onSuccess: (created) => {
      queryClient.setQueryData(tariffKeys.detail(created.id), created);
      // Seed list caches so Online Tariff Master shows the row even if list unwrap/API lags.
      queryClient.setQueriesData<TariffListResult>(
        { queryKey: [...tariffKeys.all, 'list'] },
        (prev) => {
          if (!prev) {
            return {
              tariffs: [created],
              meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
              backendListUnavailable: true,
            };
          }
          if (prev.tariffs.some((t) => t.id === created.id)) return prev;
          return {
            ...prev,
            tariffs: [created, ...prev.tariffs],
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
      // Soft invalidate — list may fall back to session registry when API is shadowed.
      void queryClient.invalidateQueries({ queryKey: tariffKeys.all });
    },
  });
}

export function useUpdateTariff(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTariffDto) => tariffService.update(id, dto),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: tariffKeys.all });
      queryClient.setQueryData(tariffKeys.detail(id), t);
    },
  });
}

export function useDeleteTariff() {
  const invalidate = useInvalidateTariffs();
  return useMutation({
    mutationFn: (id: string) => tariffService.softDelete(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useSetTariffActive() {
  const invalidate = useInvalidateTariffs();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      tariffService.setActive(id, is_active),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

/** Duplicate = create a new tariff from an existing one's fields (no dedicated API). */
export function useDuplicateTariff() {
  const invalidate = useInvalidateTariffs();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const source = await tariffService.getById(sourceId);
      return tariffService.create({
        service_type: source.service_type,
        origin_port_id: source.origin_port_id,
        dest_port_id: source.dest_port_id,
        container_type_id: source.container_type_id,
        charge_code_id: source.charge_code_id,
        customer_id: source.customer_id,
        unit: source.unit,
        sale_rate: source.sale_rate,
        cost_rate: source.cost_rate,
        currency_code: source.currency_code,
        valid_from: source.valid_from || new Date().toISOString().slice(0, 10),
        valid_to: source.valid_to,
        is_active: true,
      });
    },
    onSuccess: (t) => invalidate(t.id),
  });
}

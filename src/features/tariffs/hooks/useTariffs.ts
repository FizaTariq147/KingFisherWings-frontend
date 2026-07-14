import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { tariffService } from '../services/tariff.service';
import type {
  CreateTariffDto,
  TariffListParams,
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
    enabled: Boolean(accessToken) && isUuid(id),
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
  const invalidate = useInvalidateTariffs();
  return useMutation({
    mutationFn: (dto: CreateTariffDto) => tariffService.create(dto),
    onSuccess: (t) => invalidate(t.id),
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

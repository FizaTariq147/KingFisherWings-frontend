import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { shipmentService } from '../services/shipment.service';
import type {
  ChangeShipmentBlStatusDto,
  ChangeShipmentDepartmentDto,
  ChangeShipmentStatusDto,
  CreateShipmentDto,
  MergeShipmentsDto,
  ShipmentListParams,
  SplitShipmentDto,
  UpdateShipmentDto,
} from '../types/shipment.types';

export const shipmentKeys = {
  all: ['tenant', 'shipments'] as const,
  list: (params: ShipmentListParams) => [...shipmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...shipmentKeys.all, 'detail', id] as const,
  detailTab: (id: string, tab: string) =>
    [...shipmentKeys.all, 'detail', id, 'tab', tab] as const,
  kpi: (id: string) => [...shipmentKeys.all, 'kpi', id] as const,
  tracking: (id: string) => [...shipmentKeys.all, 'tracking', id] as const,
};

export function useShipments(params: ShipmentListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.list(params),
    queryFn: () => shipmentService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Prefer Fresa detail endpoint; falls back inside the service. */
export function useShipment(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => shipmentService.getDetail(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useShipmentDetailTab(id: string, tab: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.detailTab(id, tab || ''),
    queryFn: () => shipmentService.getDetailTab(id, tab!),
    enabled: Boolean(accessToken) && isUuid(id) && Boolean(tab?.trim()),
    staleTime: 30_000,
  });
}

export function useShipmentKpi(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.kpi(id),
    queryFn: () => shipmentService.kpi(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useShipmentTracking(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.tracking(id),
    queryFn: () => shipmentService.tracking(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useInvalidateShipments() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(detailId) });
    }
  };
}

export function useCreateShipment() {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: CreateShipmentDto) => shipmentService.create(dto),
    onSuccess: (s) => invalidate(s.id),
  });
}

export function useUpdateShipment(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: UpdateShipmentDto) => shipmentService.update(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useGenerateShipmentJob(id: string) {
  const invalidate = useInvalidateShipments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => shipmentService.generateJob(id),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({ queryKey: ['tenant', 'jobs'] });
    },
  });
}

export function useChangeShipmentStatus(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: ChangeShipmentStatusDto) => shipmentService.changeStatus(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useChangeShipmentBlStatus(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: ChangeShipmentBlStatusDto) =>
      shipmentService.changeBlStatus(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useChangeShipmentDepartment(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: ChangeShipmentDepartmentDto) =>
      shipmentService.changeDepartment(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useCopyShipment(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: () => shipmentService.copy(id),
    onSuccess: () => invalidate(),
  });
}

export function useSplitShipment(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: SplitShipmentDto = {}) => shipmentService.split(id, dto),
    onSuccess: () => invalidate(),
  });
}

export function useMergeShipments(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (dto: MergeShipmentsDto) => shipmentService.merge(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useShipmentCreateSubmaster(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: () => shipmentService.createSubmaster(id),
    onSuccess: () => invalidate(),
  });
}

export function useShipmentEdi(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (args: { action: string; body?: Record<string, unknown> }) =>
      shipmentService.edi(id, args.action, args.body),
    onSuccess: () => invalidate(id),
  });
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { shipmentService } from '../services/shipment.service';
import type {
  ChangeShipmentBlStatusDto,
  ChangeShipmentDepartmentDto,
  ChangeShipmentStatusDto,
  CopyShipmentChargesDto,
  CreateShipmentChargeDto,
  CreateShipmentDto,
  GetShipmentChargesDto,
  MergeShipmentsDto,
  ShipmentListParams,
  GenerateJobFromShipmentDto,
  SplitShipmentDto,
  UpdateShipmentDto,
} from '../types/shipment.types';
import { useShipmentsPermissions } from './useShipmentsPermissions';

export const shipmentKeys = {
  all: ['tenant', 'shipments'] as const,
  list: (params: ShipmentListParams) => [...shipmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...shipmentKeys.all, 'detail', id] as const,
  detailTab: (id: string, tab: string) =>
    [...shipmentKeys.all, 'detail', id, 'tab', tab] as const,
  kpi: (id: string) => [...shipmentKeys.all, 'kpi', id] as const,
  tracking: (id: string) => [...shipmentKeys.all, 'tracking', id] as const,
  ediTypes: (id: string) => [...shipmentKeys.all, 'edi-types', id] as const,
  ediSubmissions: (id: string) =>
    [...shipmentKeys.all, 'edi-submissions', id] as const,
  statusOptions: [...(['tenant', 'shipments'] as const), 'status-options'] as const,
};

/** GET /shipments/status-options — system + custom catalog. */
export function useShipmentStatusOptions(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: shipmentKeys.statusOptions,
    queryFn: () => shipmentService.getStatusOptions(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
  });
}

export function useShipments(params: ShipmentListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.list(params),
    queryFn: () => shipmentService.list(params),
    enabled: Boolean(accessToken) && canReadApi,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Prefer Fresa detail endpoint; falls back inside the service. */
export function useShipment(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => shipmentService.getDetail(id),
    enabled: Boolean(accessToken) && isUuid(id) && canReadApi,
  });
}

export function useShipmentDetailTab(id: string, tab: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.detailTab(id, tab || ''),
    queryFn: () => shipmentService.getDetailTab(id, tab!),
    enabled: Boolean(accessToken) && isUuid(id) && Boolean(tab?.trim()) && canReadApi,
    staleTime: 30_000,
  });
}

/** Show All — aggregates sibling keys from GET /shipments/:id/detail via detail/:tab. */
export function useShipmentShowAll(id: string, siblingTabKeys: string[], enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  const keys = siblingTabKeys.map((k) => k.trim()).filter(Boolean).sort();
  return useQuery({
    queryKey: [...shipmentKeys.detail(id), 'show-all', keys] as const,
    queryFn: () => shipmentService.getShowAll(id, keys),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
    staleTime: 30_000,
  });
}

export function useShipmentKpi(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.kpi(id),
    queryFn: () => shipmentService.kpi(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
  });
}

export function useShipmentTracking(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.tracking(id),
    queryFn: () => shipmentService.tracking(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
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

/** PATCH /shipments/:id/detail/show_all */
export function usePatchShipmentShowAll(id: string) {
  const invalidate = useInvalidateShipments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: import('@/features/jobs/types/job.types').PatchShowAllDto) =>
      shipmentService.patchShowAll(id, dto),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({
        queryKey: [...shipmentKeys.detail(id), 'show-all'],
      });
      void queryClient.invalidateQueries({
        queryKey: shipmentKeys.detailTab(id, 'show_all'),
      });
    },
  });
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
    mutationFn: (dto?: GenerateJobFromShipmentDto) =>
      shipmentService.generateJob(id, dto ?? { mode: 'HOUSE' }),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeShipmentDepartmentDto) =>
      shipmentService.changeDepartment(id, dto),
    onSuccess: async (updated, dto) => {
      const preserved = {
        department_id:
          updated?.department_id || dto.department_id,
        department_name: updated?.department_name,
        branch_id:
          dto.branch_id != null && dto.branch_id !== ''
            ? updated?.branch_id || dto.branch_id
            : updated?.branch_id,
        branch_name: updated?.branch_name,
      };

      queryClient.setQueryData(
        shipmentKeys.detail(id),
        (prev: import('../types/shipment.types').Shipment | undefined) => ({
          ...(prev ?? {}),
          ...(updated ?? {}),
          id,
          department_id: preserved.department_id || prev?.department_id,
          department_name: preserved.department_name || prev?.department_name,
          branch_id: preserved.branch_id ?? prev?.branch_id,
          branch_name: preserved.branch_name || prev?.branch_name,
        }),
      );

      // Soft refetch detail and merge — full invalidate was wiping sparse GET responses.
      try {
        const fresh = await shipmentService.getDetail(id);
        queryClient.setQueryData(shipmentKeys.detail(id), {
          ...fresh,
          department_id: fresh.department_id || preserved.department_id,
          department_name: fresh.department_name || preserved.department_name,
          branch_id: fresh.branch_id || preserved.branch_id,
          branch_name: fresh.branch_name || preserved.branch_name,
        });
      } catch {
        /* keep setQueryData above */
      }

      // Refresh lists only (not this detail key via broad all-invalidate).
      void queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
        predicate: (query) => query.queryKey[2] === 'list',
      });
    },
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

export function useShipmentBookingForm(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: [...shipmentKeys.detail(id), 'booking-form'] as const,
    queryFn: () => shipmentService.getBookingForm(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
  });
}

export function useUpsertShipmentBookingForm(id: string) {
  const invalidate = useInvalidateShipments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.upsertBookingForm(id, body),
    onSuccess: (saved, body) => {
      const key = [...shipmentKeys.detail(id), 'booking-form'] as const;
      const previous = queryClient.getQueryData<Record<string, unknown>>(key);
      queryClient.setQueryData(key, {
        ...(previous ?? {}),
        ...body,
        ...(saved ?? {}),
        ...(body.custom_fields != null ? { custom_fields: body.custom_fields } : {}),
      });
      invalidate(id);
    },
  });

export function useCompleteShipmentBookingForm(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: () => shipmentService.completeBookingForm(id),
    onSuccess: () => invalidate(id),
  });
}

export function useQueueShipmentBookingConfirmation(id: string) {
  return useMutation({
    mutationFn: () => shipmentService.queueBookingConfirmation(id),
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

/** GET /shipments/:id/edi/types */
export function useShipmentEdiTypes(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.ediTypes(id),
    queryFn: () => shipmentService.listEdiTypes(id),
    enabled: Boolean(accessToken) && isUuid(id) && canReadApi && enabled,
  });
}

/** GET /shipments/:id/edi/submissions */
export function useShipmentEdiSubmissions(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: shipmentKeys.ediSubmissions(id),
    queryFn: () => shipmentService.listEdiSubmissions(id),
    enabled: Boolean(accessToken) && isUuid(id) && canReadApi && enabled,
  });
}

/** POST /shipments/:id/edi/generate { edi_type, company_codes? } */
export function useGenerateShipmentEdi(id: string) {
  const invalidate = useInvalidateShipments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: import('../types/shipment.types').GenerateShipmentEdiDto) =>
      shipmentService.generateEdi(id, dto),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.ediSubmissions(id) });
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.ediTypes(id) });
    },
  });
}

/** GET /shipments/:id/edi/submissions/:submissionId/download */
export function useDownloadShipmentEdiSubmission(id: string) {
  return useMutation({
    mutationFn: (submissionId: string) =>
      shipmentService.downloadEdiSubmission(id, submissionId),
  });
}

export function useSwitchShipmentBl(id: string) {
  const invalidate = useInvalidateShipments();
  return useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      shipmentService.switchBl(id, body ?? {}),
    onSuccess: () => invalidate(id),
  });
}

export function useShipmentAwb(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: [...shipmentKeys.detail(id), 'awb'] as const,
    queryFn: () => shipmentService.getAwb(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
  });
}

export function useShipmentBillsOfLading(id: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: [...shipmentKeys.detail(id), 'bills-of-lading'] as const,
    queryFn: () => shipmentService.listBillsOfLading(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
  });
}

export function useQueueShipmentHbl(id: string) {
  return useMutation({
    mutationFn: () => shipmentService.queueHblDocument(id),
  });
}

/** GET /shipments/:id/charges */
export function useShipmentCharges(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { canReadApi } = useShipmentsPermissions();
  return useQuery({
    queryKey: [...shipmentKeys.detail(id), 'charges'] as const,
    queryFn: () => shipmentService.listCharges(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled && canReadApi,
  });
}

/** CRUD mutations for /shipments/:id/charges */
export function useShipmentChargeMutations(id: string) {
  const invalidate = useInvalidateShipments();
  const after = () => invalidate(id);
  return {
    create: useMutation({
      mutationFn: (dto: CreateShipmentChargeDto) => shipmentService.addCharge(id, dto),
      onSuccess: after,
    }),
    createComposite: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        shipmentService.addCompositeCharges(id, body),
      onSuccess: after,
    }),
    update: useMutation({
      mutationFn: ({
        chargeId,
        dto,
      }: {
        chargeId: string;
        dto: Record<string, unknown>;
      }) => shipmentService.updateCharge(id, chargeId, dto),
      onSuccess: after,
    }),
    remove: useMutation({
      mutationFn: (chargeId: string) => shipmentService.deleteCharge(id, chargeId),
      onSuccess: after,
    }),
    pullCharges: useMutation({
      mutationFn: (dto: GetShipmentChargesDto = {}) =>
        shipmentService.pullCharges(id, dto),
      onSuccess: after,
    }),
    copyCharges: useMutation({
      mutationFn: (dto: CopyShipmentChargesDto) =>
        shipmentService.copyCharges(id, dto),
      onSuccess: after,
    }),
  };
}

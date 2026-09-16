import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { portalShipmentsService } from '../services/portalShipments.service';
import type { PortalShipmentListParams } from '../types/portalShipments.types';

export const portalShipmentKeys = {
  all: (scope: string) => ['portal', scope, 'shipments'] as const,
  summary: (scope: string) => [...portalShipmentKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalShipmentListParams) =>
    [...portalShipmentKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalShipmentKeys.all(scope), 'detail', id] as const,
  milestones: (scope: string, id: string) =>
    [...portalShipmentKeys.all(scope), 'milestones', id] as const,
  documents: (scope: string, id: string) =>
    [...portalShipmentKeys.all(scope), 'documents', id] as const,
  containerRequests: (scope: string, id: string) =>
    [...portalShipmentKeys.all(scope), 'container-requests', id] as const,
  uldRequests: (scope: string, id: string) =>
    [...portalShipmentKeys.all(scope), 'uld-requests', id] as const,
};

export function usePortalShipmentSummary(
  enabledOrPeriod: boolean | UiDashboardPeriod | ApiPeriodQuery = true,
  enabled = true,
) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const periodQuery: ApiPeriodQuery | undefined =
    typeof enabledOrPeriod === 'boolean'
      ? undefined
      : typeof enabledOrPeriod === 'string'
        ? uiPeriodToApi(enabledOrPeriod)
        : enabledOrPeriod;
  const isEnabled = typeof enabledOrPeriod === 'boolean' ? enabledOrPeriod : enabled;
  return useQuery({
    queryKey: [...portalShipmentKeys.summary(scope), periodQuery ?? null],
    queryFn: () => portalShipmentsService.summary(periodQuery),
    enabled: Boolean(accessToken) && isEnabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipments(params: PortalShipmentListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.list(scope, params),
    queryFn: () => portalShipmentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalShipment(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.detail(scope, id),
    queryFn: () => portalShipmentsService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipmentMilestones(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.milestones(scope, id),
    queryFn: () => portalShipmentsService.milestones(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipmentDocuments(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.documents(scope, id),
    queryFn: () => portalShipmentsService.documents(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipmentContainerRequests(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.containerRequests(scope, id),
    queryFn: () => portalShipmentsService.containerRequests(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipmentUldRequests(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.uldRequests(scope, id),
    queryFn: () => portalShipmentsService.uldRequests(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalShipmentActions(shipmentId: string) {
  const queryClient = useQueryClient();
  const scope = usePortalQueryScope();
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: portalShipmentKeys.detail(scope, shipmentId),
    });
    void queryClient.invalidateQueries({
      queryKey: portalShipmentKeys.milestones(scope, shipmentId),
    });
    void queryClient.invalidateQueries({
      queryKey: portalShipmentKeys.containerRequests(scope, shipmentId),
    });
    void queryClient.invalidateQueries({
      queryKey: portalShipmentKeys.uldRequests(scope, shipmentId),
    });
    void queryClient.invalidateQueries({ queryKey: portalShipmentKeys.all(scope) });
  };

  return {
    confirmPick: useMutation({
      mutationFn: ({
        lineId,
        dto = {},
      }: {
        lineId: string;
        dto?: Record<string, unknown>;
      }) => portalShipmentsService.confirmPick(shipmentId, lineId, dto),
      onSuccess: invalidate,
    }),
    confirmPortToken: useMutation({
      mutationFn: (dto: Record<string, unknown> = {}) =>
        portalShipmentsService.confirmPortToken(shipmentId, dto),
      onSuccess: invalidate,
    }),
    requestDraftBl: useMutation({
      mutationFn: (dto: Record<string, unknown> = {}) =>
        portalShipmentsService.requestDraftBl(shipmentId, dto),
      onSuccess: invalidate,
    }),
    confirmUldDropoff: useMutation({
      mutationFn: ({
        lineId,
        dto = {},
      }: {
        lineId: string;
        dto?: Record<string, unknown>;
      }) => portalShipmentsService.confirmUldDropoff(shipmentId, lineId, dto),
      onSuccess: invalidate,
    }),
    requestDraftHawb: useMutation({
      mutationFn: (dto: Record<string, unknown> = {}) =>
        portalShipmentsService.requestDraftHawb(shipmentId, dto),
      onSuccess: invalidate,
    }),
    requestDeliveryOrder: useMutation({
      mutationFn: (dto: Record<string, unknown> = {}) =>
        portalShipmentsService.requestDeliveryOrder(shipmentId, dto),
      onSuccess: invalidate,
    }),
  };
}

export function useExportPortalShipmentsCsv() {
  return useMutation({
    mutationFn: (params: PortalShipmentListParams = {}) =>
      portalShipmentsService.exportCsv(params),
  });
}

export function usePortalShipmentLookup() {
  return useMutation({
    mutationFn: (ref: string) => portalShipmentsService.lookup(ref),
  });
}

export function useDownloadPortalShipmentDocument() {
  return useMutation({
    mutationFn: ({
      shipmentId,
      docId,
      name,
    }: {
      shipmentId: string;
      docId: string;
      name?: string;
    }) => portalShipmentsService.downloadDocument(shipmentId, docId, name),
  });
}

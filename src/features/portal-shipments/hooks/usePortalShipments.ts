import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
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
};

export function usePortalShipmentSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalShipmentKeys.summary(scope),
    queryFn: () => portalShipmentsService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { shipmentService } from '../services/shipment.service';
import { shipmentKeys } from './useShipments';

function invalidateOrg(qc: ReturnType<typeof useQueryClient>, shipmentId: string) {
  void qc.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
  void qc.invalidateQueries({
    queryKey: shipmentKeys.detailTab(shipmentId, 'organization'),
  });
  void qc.invalidateQueries({
    queryKey: [...shipmentKeys.detail(shipmentId), 'organizations'],
  });
}

/** GET /shipments/:id/organizations */
export function useShipmentOrganizationsList(shipmentId: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...shipmentKeys.detail(shipmentId), 'organizations'] as const,
    queryFn: () => shipmentService.listOrganizations(shipmentId),
    enabled: Boolean(accessToken) && isUuid(shipmentId) && enabled,
  });
}

/** POST /shipments/:id/organizations — AddJobOrganizationDto (includes Vendor). */
export function useAddShipmentOrganization(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.addOrganizations(shipmentId, body),
    onSuccess: () => invalidateOrg(qc, shipmentId),
  });
}

/** PUT /shipments/:id/organizations/:orgType */
export function useReplaceShipmentOrganization(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orgType,
      dto,
    }: {
      orgType: string;
      dto: Record<string, unknown>;
    }) => shipmentService.replaceOrganization(shipmentId, orgType, dto),
    onSuccess: () => invalidateOrg(qc, shipmentId),
  });
}

/** DELETE /shipments/:id/organizations/:orgType */
export function useUnlinkShipmentOrganization(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orgType: string) =>
      shipmentService.unlinkOrganization(shipmentId, orgType),
    onSuccess: () => invalidateOrg(qc, shipmentId),
  });
}

/** POST /shipments/:id/organizations/copy-from */
export function useCopyShipmentOrganizations(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      shipmentService.copyOrganizationsFrom(shipmentId, body),
    onSuccess: () => invalidateOrg(qc, shipmentId),
  });
}

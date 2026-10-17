import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import { shipmentKeys } from './useShipments';

/** POST /shipments/:id/organizations — AddJobOrganizationDto (includes Vendor). */
export function useAddShipmentOrganization(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.addOrganizations(shipmentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      void qc.invalidateQueries({
        queryKey: shipmentKeys.detailTab(shipmentId, 'organization'),
      });
    },
  });
}

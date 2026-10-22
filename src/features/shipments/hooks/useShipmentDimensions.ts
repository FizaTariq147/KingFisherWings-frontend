import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import { shipmentKeys } from './useShipments';

/** Body for POST /shipments/:id/dimensions (same shape as job dimension line). */
export type AddShipmentDimensionDto = {
  length?: number;
  width?: number;
  height?: number;
  no_of_pcs?: number;
  g_weight?: number;
  hs_code?: string;
  length_unit?: string;
  g_weight_unit?: string;
  package_type?: string;
  [key: string]: unknown;
};

/** POST /shipments/:id/dimensions — add a dimension line. */
export function useAddShipmentDimensions(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddShipmentDimensionDto) =>
      shipmentService.addDimensions(shipmentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      void qc.invalidateQueries({
        queryKey: shipmentKeys.detailTab(shipmentId, 'dimensions'),
      });
      void qc.invalidateQueries({
        queryKey: shipmentKeys.detailTab(shipmentId, 'dimension'),
      });
    },
  });
}

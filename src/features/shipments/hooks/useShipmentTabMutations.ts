import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import { shipmentKeys } from './useShipments';

function invalidateTabs(qc: ReturnType<typeof useQueryClient>, shipmentId: string, tabs: string[]) {
  void qc.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
  for (const tab of tabs) {
    void qc.invalidateQueries({ queryKey: shipmentKeys.detailTab(shipmentId, tab) });
  }
}

/** POST /shipments/:id/exchange-rates */
export function useAddShipmentExchangeRate(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.addExchangeRates(shipmentId, body),
    onSuccess: () =>
      invalidateTabs(qc, shipmentId, ['ex_rate', 'exchange_rate', 'exchange_rates', 'exrate']),
  });
}

/** POST /shipments/:id/customs-refs */
export function useAddShipmentCustomsRef(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.addCustomsRefs(shipmentId, body),
    onSuccess: () =>
      invalidateTabs(qc, shipmentId, [
        'customs',
        'shipping_bill_boe',
        'shipping_bill',
        'boe',
        'customs_refs',
      ]),
  });
}

/** POST /shipments/:id/routing-legs */
export function useAddShipmentRoutingLeg(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shipmentService.createRoutingLeg(shipmentId, body),
    onSuccess: () => invalidateTabs(qc, shipmentId, ['routing', 'routing_legs', 'legs']),
  });
}

/** PATCH /shipments/:id/routing-legs/:legId */
export function useUpdateShipmentRoutingLeg(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ legId, body }: { legId: string; body: Record<string, unknown> }) =>
      shipmentService.updateRoutingLeg(shipmentId, legId, body),
    onSuccess: () => invalidateTabs(qc, shipmentId, ['routing', 'routing_legs', 'legs']),
  });
}

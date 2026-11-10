import type { Shipment } from '../types/shipment.types';

/**
 * Whether Delete should be offered on shipment detail.
 * Trust BE `actions.can_delete` when present; else require shipments.delete permission
 * (caller also gates with `perms.canWriteDelete`).
 */
export function canDeleteShipment(
  shipment: Pick<Shipment, 'actions' | 'status'>,
  hasDeletePermission: boolean,
): boolean {
  if (!hasDeletePermission) return false;
  if (shipment.actions?.can_delete === false) return false;
  if (shipment.actions?.can_delete === true) return true;
  return true;
}

import { useLocation } from 'react-router-dom';
import { shipmentPathsForLocation } from '../api/shipment.api';

/** List / create / detail paths for the current shipments surface (CS or Operations). */
export function useShipmentPaths() {
  const { pathname } = useLocation();
  return shipmentPathsForLocation(pathname);
}

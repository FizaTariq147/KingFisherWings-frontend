import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import type { PortalJobStatus } from '../api/portalShipments.api';

export interface PortalShipmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PortalJobStatus | string;
  job_type?: string;
  from_date?: string;
  to_date?: string;
  order?: 'asc' | 'desc';
}

export interface PortalShipmentSummary {
  total: number;
  active: number;
  delivered: number;
  onHold: number;
  byStatus: Record<string, number>;
  raw?: Record<string, unknown>;
}

export interface PortalShipmentListItem {
  id: string;
  reference: string;
  jobType?: string;
  status?: string;
  origin?: string;
  destination?: string;
  etd?: string;
  eta?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

/** Same-page Track & Trace result (portal lookup → tracking / quotation). */
export type PortalTrackKind = 'shipment' | 'quotation';

export interface PortalTrackByRefResult {
  kind: PortalTrackKind;
  reference: string;
  id: string;
  /** Raw API payload from tracking / quotation detail — render as-is. */
  data: unknown;
}

export interface PortalShipmentListResult {
  items: PortalShipmentListItem[];
  meta: PortalPaginationMeta;
}

export interface PortalMilestone {
  id: string;
  code?: string;
  label: string;
  status?: string;
  occurredAt?: string;
  location?: string;
  notes?: string;
}

export interface PortalShipmentDocument {
  id: string;
  name: string;
  documentType?: string;
  mimeType?: string;
  createdAt?: string;
  /** List shows all visible_to_customer docs; download may still be gated. */
  canDownload?: boolean;
  visibleToCustomer?: boolean;
  downloadPath?: string;
}

export interface PortalShipmentDocumentsSummary {
  total?: number;
  visible?: number;
  bookingFormAttached?: number;
  bookingFormMissing?: number;
  byType?: Record<string, number>;
}

export interface PortalShipmentPathHints {
  documents?: string;
  documentDownload?: string;
  acknowledgement?: string;
  bookingForm?: string;
  raw?: Record<string, string>;
}

export interface PortalShipmentDetail extends PortalShipmentListItem {
  cargoSummary?: string;
  pieces?: number;
  grossWeight?: number;
  chargeableWeight?: number;
  volumeCbm?: number;
  /** CreateJobDto / road-land fields when present on shipment payload. */
  serviceScope?: string;
  originDoorAddress?: string;
  destDoorAddress?: string;
  cargoCategory?: string;
  incoterms?: string;
  vehicleType?: string;
  originCityCountry?: string;
  destinationCityCountry?: string;
  milestones: PortalMilestone[];
  documents?: PortalShipmentDocument[];
  documentsSummary?: PortalShipmentDocumentsSummary;
  acknowledgementStatus?: string;
  bookingFormSummary?: Record<string, unknown>;
  pathHints?: PortalShipmentPathHints;
}

/** Portal view of staff-issued container requests / CRO lines. */
export interface PortalContainerRequest {
  id: string;
  lineId: string;
  status?: string;
  containerType?: string;
  containerNumber?: string;
  croNumber?: string;
  quantity?: number;
  canConfirmPick?: boolean;
  notes?: string;
  raw?: Record<string, unknown>;
}

/** Portal view of air ULD / pallet lines. */
export interface PortalUldRequest {
  id: string;
  lineId: string;
  status?: string;
  palletType?: string;
  uldNumber?: string;
  quantity?: number;
  canConfirmDropoff?: boolean;
  notes?: string;
  raw?: Record<string, unknown>;
}

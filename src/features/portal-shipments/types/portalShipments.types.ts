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
  canDownload?: boolean;
}

export interface PortalShipmentDetail extends PortalShipmentListItem {
  cargoSummary?: string;
  pieces?: number;
  grossWeight?: number;
  chargeableWeight?: number;
  volumeCbm?: number;
  milestones: PortalMilestone[];
  documents?: PortalShipmentDocument[];
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

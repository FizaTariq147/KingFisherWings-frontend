import { portalApiClient } from '@/lib/portalApiClient';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_SHIPMENTS_API } from '../api/portalShipments.api';
import type {
  PortalContainerRequest,
  PortalMilestone,
  PortalShipmentDetail,
  PortalShipmentDocument,
  PortalShipmentListItem,
  PortalShipmentListParams,
  PortalShipmentListResult,
  PortalShipmentSummary,
  PortalUldRequest,
} from '../types/portalShipments.types';
import {
  normalizeMilestones,
  normalizePortalContainerRequests,
  normalizePortalUldRequests,
  normalizeShipmentDetail,
  normalizeShipmentDocuments,
  normalizeShipmentList,
  normalizeShipmentListItem,
  normalizeShipmentSummary,
} from '../utils/normalizePortalShipments';
import { unwrapData } from '@/features/portal-shared/normalize';

export const portalShipmentsService = {
  async summary(period?: ApiPeriodQuery): Promise<PortalShipmentSummary> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.summary, {
      params: periodQueryParams(period),
    });
    return normalizeShipmentSummary(res.data);
  },

  async list(params: PortalShipmentListParams = {}): Promise<PortalShipmentListResult> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.list, { params });
    return normalizeShipmentList(res.data, params);
  },

  async exportCsv(params: PortalShipmentListParams = {}): Promise<void> {
    await downloadPortalBlob(PORTAL_SHIPMENTS_API.exportCsv, 'shipments.csv', {
      search: params.search,
      status: params.status,
      job_type: params.job_type,
      from_date: params.from_date,
      to_date: params.to_date,
      order: params.order,
      limit: 100,
    });
  },

  async lookup(ref: string): Promise<PortalShipmentListItem | null> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.lookup, {
      params: { ref: ref.trim() },
    });
    return normalizeShipmentListItem(unwrapData(res.data) ?? res.data);
  },

  async getById(id: string): Promise<PortalShipmentDetail> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.detail(id));
    const detail = normalizeShipmentDetail(res.data);
    if (!detail) throw new Error('Shipment not found.');
    return detail;
  },

  async milestones(id: string): Promise<PortalMilestone[]> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.milestones(id));
    return normalizeMilestones(res.data);
  },

  async documents(id: string): Promise<PortalShipmentDocument[]> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.documents(id));
    return normalizeShipmentDocuments(res.data);
  },

  async downloadDocument(
    shipmentId: string,
    docId: string,
    fallbackName = 'document',
  ): Promise<void> {
    const res = await portalApiClient.get(
      PORTAL_SHIPMENTS_API.downloadDocument(shipmentId, docId),
      { responseType: 'blob' },
    );
    const filename =
      filenameFromContentDisposition(
        typeof res.headers['content-disposition'] === 'string'
          ? res.headers['content-disposition']
          : undefined,
      ) || fallbackName;
    triggerBlobDownload(res.data as Blob, filename);
  },

  async containerRequests(id: string): Promise<PortalContainerRequest[]> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.containerRequests(id));
    return normalizePortalContainerRequests(res.data);
  },

  async confirmPick(
    shipmentId: string,
    lineId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.confirmPick(shipmentId, lineId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async confirmPortToken(
    shipmentId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.confirmPortToken(shipmentId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async requestDraftBl(
    shipmentId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.requestDraftBl(shipmentId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async uldRequests(id: string): Promise<PortalUldRequest[]> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.uldRequests(id));
    return normalizePortalUldRequests(res.data);
  },

  async confirmUldDropoff(
    shipmentId: string,
    lineId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.confirmUldDropoff(shipmentId, lineId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async requestDraftHawb(
    shipmentId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.requestDraftHawb(shipmentId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async requestDeliveryOrder(
    shipmentId: string,
    dto: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.requestDeliveryOrder(shipmentId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_SHIPMENTS_API } from '../api/portalShipments.api';
import type {
  PortalMilestone,
  PortalShipmentDetail,
  PortalShipmentDocument,
  PortalShipmentListItem,
  PortalShipmentListParams,
  PortalShipmentListResult,
  PortalShipmentSummary,
} from '../types/portalShipments.types';
import {
  normalizeMilestones,
  normalizeShipmentDetail,
  normalizeShipmentDocuments,
  normalizeShipmentList,
  normalizeShipmentListItem,
  normalizeShipmentSummary,
} from '../utils/normalizePortalShipments';
import { unwrapData } from '@/features/portal-shared/normalize';

export const portalShipmentsService = {
  async summary(): Promise<PortalShipmentSummary> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.summary);
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
};

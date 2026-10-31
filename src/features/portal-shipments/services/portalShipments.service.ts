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
  PortalTrackByRefResult,
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
    // GET /portal/shipments/export.csv — must not go through PDF filename logic.
    await downloadPortalBlob(PORTAL_SHIPMENTS_API.exportCsv, 'shipments.csv', {
      accept: 'text/csv,application/octet-stream,*/*',
      params: {
        search: params.search,
        status: params.status,
        job_type: params.job_type,
        from_date: params.from_date,
        to_date: params.to_date,
        order: params.order,
        limit: 100,
      },
    });
  },

  async lookup(ref: string): Promise<PortalShipmentListItem | null> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.lookup, {
      params: { ref: ref.trim() },
    });
    return normalizeShipmentListItem(unwrapData(res.data) ?? res.data);
  },

  /** GET /portal/shipments/:id/tracking — full track & trace payload. */
  async tracking(id: string): Promise<unknown> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.tracking(id));
    return unwrapData(res.data) ?? res.data;
  },

  /**
   * Same-page Track & Trace for the customer portal.
   * 1. GET /portal/shipments/lookup?ref=…
   * 2. GET /portal/shipments/:id/tracking (fallback: shipment detail)
   * 3. Else GET /portal/quotations?search=… → quotation detail
   */
  async trackByReference(ref: string): Promise<PortalTrackByRefResult> {
    const reference = ref.trim();
    if (reference.length < 2) throw new Error('Reference is required.');

    try {
      const item = await this.lookup(reference);
      if (item?.id) {
        let data: unknown;
        try {
          data = await this.tracking(item.id);
        } catch {
          data = await this.getById(item.id);
        }
        return {
          kind: 'shipment',
          id: item.id,
          reference: item.reference || reference,
          data,
        };
      }
    } catch {
      /* try quotation below */
    }

    const { portalQuotationsService } = await import(
      '@/features/portal-quotations/services/portalQuotations.service'
    );
    const listed = await portalQuotationsService.list({
      search: reference,
      limit: 10,
    });
    const needle = reference.toLowerCase();
    const match =
      listed.items.find((q) => (q.number || '').toLowerCase() === needle) ||
      listed.items.find((q) => (q.number || '').toLowerCase().includes(needle)) ||
      listed.items[0];
    if (match?.id) {
      const detail = await portalQuotationsService.getById(match.id);
      return {
        kind: 'quotation',
        id: detail.id,
        reference: detail.number || reference,
        data: detail.raw ?? detail,
      };
    }

    throw new Error('No shipment, job, or quotation found for that reference.');
  },

  async getById(id: string): Promise<PortalShipmentDetail> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.detail(id));
    const detail = normalizeShipmentDetail(res.data);
    if (!detail) {
      throw new Error(
        'Shipment details could not be read from the server response (missing id).',
      );
    }
    return detail;
  },

  /** GET /portal/jobs/:id/costing */
  async getJobCosting(jobId: string): Promise<unknown> {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.jobCosting(jobId));
    return unwrapData(res.data) ?? res.data;
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
    dto: import('../types/portalShipments.types').PortalConfirmPortTokenDto,
  ): Promise<Record<string, unknown>> {
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.confirmPortToken(shipmentId),
      dto,
    );
    return (asRecord(unwrapData(res.data)) ?? asRecord(res.data) ?? {}) as Record<string, unknown>;
  },

  async requestDraftBl(
    shipmentId: string,
    dto: import('../types/portalShipments.types').PortalRequestDraftBlDto,
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

  /** GET /portal/shipments/:id/acknowledgement */
  async getAcknowledgement(
    id: string,
  ): Promise<import('@/features/jobs/types/job.types').DeliveryAcknowledgement> {
    const { normalizeDeliveryAcknowledgement } = await import(
      '@/features/jobs/utils/normalizeJob'
    );
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.acknowledgement(id));
    return normalizeDeliveryAcknowledgement(res.data);
  },

  /** POST submit acknowledgement (fields + optional signature already uploaded). */
  async submitAcknowledgement(
    id: string,
    dto: import('@/features/jobs/types/job.types').SubmitDeliveryAcknowledgementDto,
  ): Promise<import('@/features/jobs/types/job.types').DeliveryAcknowledgement> {
    const { normalizeDeliveryAcknowledgement } = await import(
      '@/features/jobs/utils/normalizeJob'
    );
    const res = await portalApiClient.post(PORTAL_SHIPMENTS_API.acknowledgement(id), dto);
    return normalizeDeliveryAcknowledgement(res.data);
  },

  async uploadAcknowledgementSignature(id: string, file: File): Promise<unknown> {
    const form = new FormData();
    form.append('file', file);
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.acknowledgementSignature(id),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrapData(res.data) ?? res.data;
  },

  /** GET /portal/shipments/:id/acknowledgement/attachments */
  async listAcknowledgementAttachments(id: string): Promise<
    Array<{ id: string; file_name?: string; mime_type?: string; size_bytes?: number }>
  > {
    const res = await portalApiClient.get(PORTAL_SHIPMENTS_API.acknowledgementAttachments(id));
    const data = unwrapData(res.data) ?? res.data;
    const rec = asRecord(data);
    const list =
      (Array.isArray(data) ? data : null) ??
      (Array.isArray(rec?.items) ? rec!.items : null) ??
      (Array.isArray(rec?.attachments) ? rec!.attachments : null) ??
      [];
    return list
      .map((row) => {
        const r = asRecord(row);
        if (!r) return null;
        const attId = String(r.id ?? r.attachment_id ?? '').trim();
        if (!attId) return null;
        return {
          id: attId,
          file_name: String(r.file_name ?? r.filename ?? r.name ?? '').trim() || undefined,
          mime_type: String(r.mime_type ?? r.content_type ?? '').trim() || undefined,
          size_bytes:
            typeof r.size_bytes === 'number'
              ? r.size_bytes
              : typeof r.size === 'number'
                ? r.size
                : undefined,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  },

  async uploadAcknowledgementAttachment(id: string, file: File): Promise<unknown> {
    const form = new FormData();
    form.append('file', file);
    const res = await portalApiClient.post(
      PORTAL_SHIPMENTS_API.acknowledgementAttachments(id),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrapData(res.data) ?? res.data;
  },

  async downloadAcknowledgementAttachment(
    id: string,
    attachmentId: string,
    fileName = 'attachment',
  ): Promise<void> {
    const res = await portalApiClient.get(
      PORTAL_SHIPMENTS_API.acknowledgementAttachmentDownload(id, attachmentId),
      { responseType: 'blob' },
    );
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart]);
    triggerBlobDownload(blob, fileName);
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

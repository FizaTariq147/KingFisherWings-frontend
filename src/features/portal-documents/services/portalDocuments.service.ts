import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_DOCUMENTS_API } from '../api/portalDocuments.api';
import type {
  PortalDocumentListParams,
  PortalDocumentListResult,
  PortalDocumentPermission,
  PortalDocumentSummary,
} from '../types/portalDocuments.types';
import {
  normalizeDocumentList,
  normalizeDocumentPermissions,
  normalizeDocumentSummary,
} from '../utils/normalizePortalDocuments';

async function downloadBlob(url: string, fallbackName: string): Promise<void> {
  const res = await portalApiClient.get(url, { responseType: 'blob' });
  const filename =
    filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string'
        ? res.headers['content-disposition']
        : undefined,
    ) || fallbackName;
  triggerBlobDownload(res.data as Blob, filename);
}

export const portalDocumentsService = {
  async summary(): Promise<PortalDocumentSummary> {
    const res = await portalApiClient.get(PORTAL_DOCUMENTS_API.summary);
    return normalizeDocumentSummary(res.data);
  },

  async permissions(): Promise<PortalDocumentPermission[]> {
    const res = await portalApiClient.get(PORTAL_DOCUMENTS_API.permissions);
    return normalizeDocumentPermissions(res.data);
  },

  async list(params: PortalDocumentListParams = {}): Promise<PortalDocumentListResult> {
    const res = await portalApiClient.get(PORTAL_DOCUMENTS_API.list, { params });
    return normalizeDocumentList(res.data, params);
  },

  async downloadInvoice(invoiceId: string, fallbackName = 'invoice.pdf'): Promise<void> {
    await downloadBlob(PORTAL_DOCUMENTS_API.downloadInvoice(invoiceId), fallbackName);
  },

  async downloadJobDocument(
    jobId: string,
    docId: string,
    fallbackName = 'document',
  ): Promise<void> {
    await downloadBlob(PORTAL_DOCUMENTS_API.downloadJobDoc(jobId, docId), fallbackName);
  },
};

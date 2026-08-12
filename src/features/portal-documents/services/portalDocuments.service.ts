import { portalApiClient } from '@/lib/portalApiClient';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { safeDownloadFilename } from '@/features/portal-shared/normalize';
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
    await downloadPortalBlob(
      PORTAL_DOCUMENTS_API.downloadInvoice(invoiceId),
      safeDownloadFilename(fallbackName, 'invoice.pdf'),
      { accept: 'application/pdf, application/octet-stream, */*' },
    );
  },

  async downloadJobDocument(
    jobId: string,
    docId: string,
    fallbackName = 'document',
  ): Promise<void> {
    await downloadPortalBlob(
      PORTAL_DOCUMENTS_API.downloadJobDoc(jobId, docId),
      safeDownloadFilename(fallbackName, 'document'),
    );
  },
};

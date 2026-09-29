import { portalApiClient } from '@/lib/portalApiClient';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { portalInvoicesService } from '@/features/portal-invoices/services/portalInvoices.service';
import { applyPortalInvoicePdfChrome } from '@/features/portal-shared/applyPortalInvoicePdfChrome';
import { downloadPortalBlob, fetchPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
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

  /** Same client invoice PDF UI as admin / portal invoice detail. */
  async downloadInvoice(invoiceId: string, fallbackName = 'invoice.pdf'): Promise<void> {
    const { blob, fileName } = await portalInvoicesService.getPdfBlob(
      invoiceId,
      safeDownloadFilename(fallbackName, 'invoice.pdf'),
    );
    triggerBlobDownload(blob, fileName);
  },

  /**
   * Job document: API PDF body unchanged + invoice header/footer (matches admin Documents).
   */
  async downloadJobDocument(
    jobId: string,
    docId: string,
    fallbackName = 'document',
  ): Promise<void> {
    const filename = formatPdfFilename(
      safeDownloadFilename(fallbackName, 'document'),
      'document',
    );
    const { blob } = await fetchPortalBlob(
      PORTAL_DOCUMENTS_API.downloadJobDoc(jobId, docId),
      filename,
      { accept: 'application/pdf, application/octet-stream, */*' },
    );
    if (!(await blobLooksLikePdf(blob))) {
      await downloadPortalBlob(
        PORTAL_DOCUMENTS_API.downloadJobDoc(jobId, docId),
        filename,
        { accept: 'application/pdf, application/octet-stream, */*' },
      );
      return;
    }
    const stamped = await applyPortalInvoicePdfChrome(blob);
    triggerBlobDownload(stamped, filename);
  },
};

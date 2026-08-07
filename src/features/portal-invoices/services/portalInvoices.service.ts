import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_INVOICES_API } from '../api/portalInvoices.api';
import type { PortalInvoiceDetail, PortalInvoiceListParams, PortalInvoiceListResult, PortalInvoiceSummary } from '../types/portalInvoices.types';
import { normalizeInvoiceDetail, normalizeInvoiceList, normalizeInvoiceSummary } from '../utils/normalizePortalInvoices';

export const portalInvoicesService = {
  async summary(): Promise<PortalInvoiceSummary> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.summary);
    return normalizeInvoiceSummary(res.data);
  },
  async list(params: PortalInvoiceListParams = {}): Promise<PortalInvoiceListResult> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.list, { params });
    return normalizeInvoiceList(res.data, params);
  },
  async getById(id: string): Promise<PortalInvoiceDetail> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.detail(id));
    const detail = normalizeInvoiceDetail(res.data);
    if (!detail) throw new Error('Invoice not found.');
    return detail;
  },
  async downloadPdf(id: string, fallbackName = 'invoice.pdf'): Promise<void> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.pdf(id), { responseType: 'blob' });
    const filename = filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string' ? res.headers['content-disposition'] : undefined,
    ) || fallbackName;
    triggerBlobDownload(res.data as Blob, filename);
  },
};


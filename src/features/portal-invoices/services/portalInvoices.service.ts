import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { buildPaymentProofFormData } from '@/features/payment-proofs/utils/uploadPaymentProofMultipart';
import type { PaymentProof, UploadPaymentProofDto } from '@/features/payment-proofs/types/paymentProof.types';
import { normalizePaymentProof, normalizePaymentProofList } from '@/features/payment-proofs/utils/normalizePaymentProof';
import { invoicePdfBranding } from '@/features/files/utils/pdfBranding';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { PORTAL_DOCUMENTS_API } from '@/features/portal-documents/api/portalDocuments.api';
import { PORTAL_INVOICES_API } from '../api/portalInvoices.api';
import type { PortalInvoiceDetail, PortalInvoiceListParams, PortalInvoiceListResult, PortalInvoiceSummary } from '../types/portalInvoices.types';
import { normalizeInvoiceDetail, normalizeInvoiceList, normalizeInvoiceSummary } from '../utils/normalizePortalInvoices';

const PDF_ACCEPT = 'application/pdf, application/octet-stream, */*';

function friendlyInvoicePdfError(err: unknown): PortalApiError {
  if (err instanceof PortalApiError) {
    const raw = err.message.trim().toLowerCase();
    const generic =
      !raw ||
      raw.includes('status code') ||
      raw === 'internal server error' ||
      raw === 'internal server error.' ||
      raw.includes('something went wrong') ||
      raw.includes('download failed') ||
      raw.includes('empty file');
    if (err.status === 403) {
      return new PortalApiError(
        generic
          ? 'You do not have permission to download this invoice PDF.'
          : err.message,
        err.status,
      );
    }
    if (err.status === 404 || err.status === 500 || err.status >= 500 || generic) {
      return new PortalApiError(
        generic
          ? 'PDF is not ready for this invoice yet. Your forwarder needs to generate it first (ERP: Invoices → Generate PDF).'
          : err.message,
        err.status || 404,
      );
    }
    return err;
  }
  if (err instanceof Error) {
    return new PortalApiError(err.message, 0);
  }
  return new PortalApiError(
    'PDF is not ready for this invoice yet. Your forwarder needs to generate it first (ERP: Invoices → Generate PDF).',
    404,
  );
}

export const portalInvoicesService = {
  async summary(): Promise<PortalInvoiceSummary> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.summary);
    return normalizeInvoiceSummary(res.data);
  },
  async list(params: PortalInvoiceListParams = {}): Promise<PortalInvoiceListResult> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.list, { params });
    return normalizeInvoiceList(res.data, params);
  },
  async openItems(): Promise<PortalInvoiceListResult> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.openItems);
    return normalizeInvoiceList(res.data, {});
  },
  async listPaymentProofs(invoiceId: string): Promise<PaymentProof[]> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.paymentProofs(invoiceId));
    return normalizePaymentProofList(res.data);
  },
  async uploadPaymentProof(
    invoiceId: string,
    file: File,
    dto: UploadPaymentProofDto,
  ): Promise<PaymentProof> {
    const form = buildPaymentProofFormData(file, {
      ...(dto.amount != null ? { amount: String(dto.amount) } : {}),
      ...(dto.payment_date ? { payment_date: dto.payment_date } : {}),
      ...(dto.reference ? { reference: dto.reference } : {}),
      ...(dto.notes ? { notes: dto.notes } : {}),
    });
    const res = await portalApiClient.post(PORTAL_INVOICES_API.paymentProofs(invoiceId), form);
    const proof = normalizePaymentProof(res.data);
    if (!proof) throw new Error('Upload failed.');
    return proof;
  },
  async exportCsv(params: PortalInvoiceListParams = {}): Promise<void> {
    await downloadPortalBlob(PORTAL_INVOICES_API.exportCsv, 'invoices.csv', {
      search: params.search,
      status: params.status,
      job_id: params.job_id,
      from_date: params.from_date,
      to_date: params.to_date,
      limit: 100,
    });
  },
  async getById(id: string): Promise<PortalInvoiceDetail> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.detail(id));
    const detail = normalizeInvoiceDetail(res.data);
    if (!detail) throw new Error('Invoice not found.');
    return detail;
  },
  async downloadPdf(id: string, invoiceNumber = 'invoice'): Promise<void> {
    const ref = stripPdfExtension(invoiceNumber) || 'invoice';
    const filename = formatPdfFilename(ref, 'invoice');

    try {
      await downloadPortalBlob(PORTAL_INVOICES_API.pdf(id), filename, {
        accept: PDF_ACCEPT,
        branding: invoicePdfBranding(ref),
      });
      return;
    } catch (primaryErr) {
      const status = primaryErr instanceof PortalApiError ? primaryErr.status : 0;
      if (status !== 403 && status !== 404 && status < 500 && status !== 0) {
        throw friendlyInvoicePdfError(primaryErr);
      }
      try {
        await downloadPortalBlob(PORTAL_DOCUMENTS_API.downloadInvoice(id), filename, {
          accept: PDF_ACCEPT,
          branding: invoicePdfBranding(ref),
        });
      } catch (fallbackErr) {
        throw friendlyInvoicePdfError(fallbackErr);
      }
    }
  },
};

import { vendorApiClient, VendorApiError } from '@/lib/vendorApiClient';
import type { PaymentProof, UploadPaymentProofDto } from '@/features/payment-proofs/types/paymentProof.types';
import { normalizePaymentProof, normalizePaymentProofList } from '@/features/payment-proofs/utils/normalizePaymentProof';
import { buildPaymentProofFormData } from '@/features/payment-proofs/utils/uploadPaymentProofMultipart';
import { downloadVendorBlob, resolveVendorDownloadUrl } from '@/features/vendor-shared/downloadVendorBlob';
import { safeDownloadFilename } from '@/features/vendor-shared/normalize';
import { postVendorWithOptionalFile } from '@/features/vendor-shared/vendorMultipart';
import { vendorInvoicePdfErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { VENDOR_INVOICES_API } from '../api/vendorInvoices.api';
import type {
  VendorInvoiceDetail,
  VendorInvoiceListParams,
  VendorInvoiceListResult,
  VendorInvoiceSubmitDto,
  VendorInvoiceSummary,
} from '../types/vendorInvoices.types';
import {
  normalizeInvoiceDetail,
  normalizeInvoiceList,
  normalizeInvoiceListItem,
  normalizeInvoiceSummary,
} from '../utils/normalizeVendorInvoices';

const PDF_ACCEPT = 'application/pdf, application/octet-stream, */*';

function friendlyVendorInvoicePdfError(err: unknown): VendorApiError {
  const message = vendorInvoicePdfErrorMessage(err);
  const status = err instanceof VendorApiError ? err.status : 0;
  return new VendorApiError(message, status);
}

async function downloadPdfFromUrl(url: string, fallbackName: string): Promise<void> {
  const safeName = safeDownloadFilename(fallbackName, 'invoice.pdf');
  const name = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
  await downloadVendorBlob(resolveVendorDownloadUrl(url), name, { accept: PDF_ACCEPT });
}

export const vendorInvoicesService = {
  async summary(): Promise<VendorInvoiceSummary> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.summary);
    return normalizeInvoiceSummary(res.data);
  },

  async list(params: VendorInvoiceListParams = {}): Promise<VendorInvoiceListResult> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.list, { params });
    return normalizeInvoiceList(res.data, params);
  },

  async openItems(): Promise<VendorInvoiceListResult> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.openItems);
    return normalizeInvoiceList(res.data, {});
  },

  async listPaymentProofs(invoiceId: string): Promise<PaymentProof[]> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.paymentProofs(invoiceId));
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
    const res = await vendorApiClient.post(VENDOR_INVOICES_API.paymentProofs(invoiceId), form);
    const proof = normalizePaymentProof(res.data);
    if (!proof) throw new Error('Upload failed.');
    return proof;
  },

  async exportCsv(params: VendorInvoiceListParams = {}): Promise<void> {
    await downloadVendorBlob(VENDOR_INVOICES_API.exportCsv, 'vendor-invoices.csv', {
      search: params.search,
      status: params.status,
      from_date: params.from_date,
      to_date: params.to_date,
      limit: 100,
    });
  },

  async getById(id: string): Promise<VendorInvoiceDetail> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.detail(id));
    const detail = normalizeInvoiceDetail(res.data);
    if (!detail) throw new VendorApiError('Invoice not found.', 404);
    return detail;
  },

  async downloadPdf(
    id: string,
    fallbackName = 'invoice.pdf',
    pdfUrl?: string,
  ): Promise<void> {
    const safeName = safeDownloadFilename(fallbackName, 'invoice.pdf');
    const name = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    let resolvedPdfUrl = pdfUrl?.trim();
    if (!resolvedPdfUrl) {
      try {
        const detail = await this.getById(id);
        resolvedPdfUrl = detail.pdfUrl;
      } catch {
        /* continue to API PDF route */
      }
    }

    if (resolvedPdfUrl) {
      try {
        await downloadPdfFromUrl(resolvedPdfUrl, name);
        return;
      } catch {
        /* fall through to generated PDF route */
      }
    }

    try {
      await downloadVendorBlob(VENDOR_INVOICES_API.pdf(id), name, { accept: PDF_ACCEPT });
    } catch (primaryErr) {
      throw friendlyVendorInvoicePdfError(primaryErr);
    }
  },

  async submit(dto: VendorInvoiceSubmitDto): Promise<VendorInvoiceDetail | null> {
    const fields: Record<string, string | undefined> = {
      currency_code: dto.currency_code.trim().toUpperCase(),
      total_amount: String(dto.total_amount),
      invoice_date: dto.invoice_date || undefined,
      due_date: dto.due_date || undefined,
      reference: dto.reference,
      remarks: dto.remarks,
    };
    const res = await postVendorWithOptionalFile(VENDOR_INVOICES_API.submit, fields, dto.file);
    const detail = normalizeInvoiceDetail(res.data);
    if (detail) return detail;
    const item = normalizeInvoiceListItem(res.data);
    return item ? { ...item, lines: [] } : null;
  },
};

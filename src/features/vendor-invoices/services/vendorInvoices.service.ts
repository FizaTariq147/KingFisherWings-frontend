import { vendorApiClient, VendorApiError } from '@/lib/vendorApiClient';
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

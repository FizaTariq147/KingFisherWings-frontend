import { vendorApiClient, VendorApiError } from '@/lib/vendorApiClient';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { portalInvoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import {
  downloadVendorBlob,
  fetchVendorBlob,
  resolveVendorDownloadUrl,
} from '@/features/vendor-shared/downloadVendorBlob';
import { safeDownloadFilename } from '@/features/vendor-shared/normalize';
import { postVendorWithOptionalFile } from '@/features/vendor-shared/vendorMultipart';
import { vendorInvoicePdfErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { postShareEmail, type ShareEmailDto, type ShareEmailResult } from '@/features/shared/share-email';
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

async function fetchPdfFromUrl(
  url: string,
  fallbackName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const safeName = safeDownloadFilename(fallbackName, 'invoice.pdf');
  const name = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
  const result = await fetchVendorBlob(resolveVendorDownloadUrl(url), name, { accept: PDF_ACCEPT });
  if (!(await blobLooksLikePdf(result.blob))) {
    throw new VendorApiError(
      'Download was expected to be a PDF but the server returned a non-PDF response.',
      400,
    );
  }
  return { blob: result.blob, fileName: result.filename };
}

export const vendorInvoicesService = {
  async summary(period?: ApiPeriodQuery): Promise<VendorInvoiceSummary> {
    const res = await vendorApiClient.get(VENDOR_INVOICES_API.summary, {
      params: periodQueryParams(period),
    });
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

  async getPdfBlob(
    id: string,
    fallbackName = 'invoice.pdf',
    pdfUrl?: string,
  ): Promise<{ blob: Blob; fileName: string }> {
    const safeName = safeDownloadFilename(fallbackName, 'invoice.pdf');
    const ref = stripPdfExtension(safeName) || 'invoice';
    const filename = formatPdfFilename(ref, 'invoice');

    let detail: VendorInvoiceDetail | undefined;
    try {
      detail = await this.getById(id);
    } catch {
      /* continue */
    }

    // Same KingFisher tax-invoice layout as customer portal / staff ERP (dynamic from detail).
    if (detail) {
      try {
        const user = useVendorAuthStore.getState().user;
        const blob = await generateInvoicePdf(
          portalInvoiceToPdfModel(
            {
              number: detail.number,
              invoiceDate: detail.invoiceDate,
              dueDate: detail.dueDate,
              currencyCode: detail.currencyCode,
              reference: detail.reference,
              subtotal: detail.subtotal,
              taxTotal: detail.taxTotal,
              totalAmount: detail.totalAmount,
              paidAmount: detail.paidAmount,
              outstandingBalance: detail.outstandingBalance,
              remarks: detail.remarks,
              vatRate: detail.vatRate,
              lines: detail.lines,
            },
            {
              clientName: detail.partyName || user?.party?.name || user?.fullName,
              attn: user?.fullName,
              email: detail.partyEmail || user?.email,
              phone: detail.partyPhone,
              company: { name: user?.tenantName || 'KINGFISHER WINGS GROUP' },
            },
          ),
        );
        return { blob, fileName: formatPdfFilename(detail.number || ref, 'invoice') };
      } catch {
        /* fall through to server PDF */
      }
    }

    const resolvedPdfUrl = pdfUrl?.trim() || detail?.pdfUrl;
    if (resolvedPdfUrl) {
      try {
        return await fetchPdfFromUrl(resolvedPdfUrl, filename);
      } catch {
        /* fall through to generated PDF route */
      }
    }

    try {
      const result = await fetchVendorBlob(VENDOR_INVOICES_API.pdf(id), filename, {
        accept: PDF_ACCEPT,
      });
      if (!(await blobLooksLikePdf(result.blob))) {
        throw new VendorApiError(
          'Download was expected to be a PDF but the server returned a non-PDF response.',
          400,
        );
      }
      return { blob: result.blob, fileName: result.filename };
    } catch (primaryErr) {
      throw friendlyVendorInvoicePdfError(primaryErr);
    }
  },

  async downloadPdf(
    id: string,
    fallbackName = 'invoice.pdf',
    pdfUrl?: string,
  ): Promise<void> {
    const { blob, fileName } = await this.getPdfBlob(id, fallbackName, pdfUrl);
    triggerBlobDownload(blob, fileName);
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

  /**
   * Post (finalize) a draft invoice via POST /vendor/invoices/submit —
   * there is no /vendor/invoices/{id}/post endpoint.
   * Submit creates/returns a finance draft; vendor portal treats a successful post as POSTED.
   */
  async post(detail: VendorInvoiceDetail): Promise<VendorInvoiceDetail> {
    if (!detail?.id?.trim()) throw new VendorApiError('Invoice id is required.', 400);
    const total = detail.totalAmount;
    if (total == null || !Number.isFinite(total) || total < 0.01) {
      throw new VendorApiError('Invoice total amount is required to post.', 400);
    }
    const currency =
      (detail.currencyCode || 'AED').trim().toUpperCase() || 'AED';
    const submitted = await this.submit({
      currency_code: currency,
      total_amount: total,
      invoice_date: detail.invoiceDate || undefined,
      due_date: detail.dueDate || undefined,
      reference: detail.reference || undefined,
      remarks: detail.remarks || undefined,
    });
    const base = submitted
      ? { ...detail, ...submitted, id: detail.id, lines: submitted.lines?.length ? submitted.lines : detail.lines }
      : detail;
    const status = String(base.status || '').trim().toUpperCase();
    if (!status || status === 'DRAFT' || status === 'SUBMITTED') {
      return { ...base, status: 'POSTED' };
    }
    return base;
  },

  async sendEmail(id: string, dto: ShareEmailDto = {}): Promise<ShareEmailResult> {
    return postShareEmail(vendorApiClient, VENDOR_INVOICES_API.sendEmail(id), dto);
  },
};

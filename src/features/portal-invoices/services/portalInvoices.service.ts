import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import {
  buildPaymentProofUploadFields,
  formatPaymentProofUploadError,
  postPaymentProofMultipartFetch,
} from '@/features/payment-proofs/utils/uploadPaymentProofMultipart';
import type { PaymentProof, UploadPaymentProofDto } from '@/features/payment-proofs/types/paymentProof.types';
import { normalizePaymentProof, normalizePaymentProofList } from '@/features/payment-proofs/utils/normalizePaymentProof';
import { invoicePdfBranding } from '@/features/files/utils/pdfBranding';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import {
  downloadPortalBlob,
  fetchPortalBlob,
  resolvePortalDownloadUrl,
} from '@/features/portal-shared/downloadPortalBlob';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { PORTAL_DOCUMENTS_API } from '@/features/portal-documents/api/portalDocuments.api';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import {
  portalInvoiceToPdfModel,
  shipmentFromPortalShipment,
} from '@/features/invoices/utils/invoiceToPdfModel';
import { portalShipmentsService } from '@/features/portal-shipments/services/portalShipments.service';
import { PORTAL_INVOICES_API } from '../api/portalInvoices.api';
import type {
  PortalInvoiceDetail,
  PortalInvoiceListParams,
  PortalInvoiceListResult,
  PortalInvoiceSummary,
} from '../types/portalInvoices.types';
import {
  normalizeInvoiceDetail,
  normalizeInvoiceList,
  normalizeInvoiceSummary,
  pickPortalInvoicePdfUrl,
} from '../utils/normalizePortalInvoices';

const PDF_ACCEPT = 'application/pdf, application/octet-stream, application/json, */*';

function isGenericPdfMessage(raw: string): boolean {
  const msg = raw.trim().toLowerCase();
  return (
    !msg ||
    msg.includes('status code') ||
    msg === 'internal server error' ||
    msg === 'internal server error.' ||
    msg.includes('something went wrong') ||
    msg.includes('download failed') ||
    msg.includes('empty file') ||
    msg.includes('non-pdf response') ||
    msg.includes('not a valid pdf')
  );
}

function friendlyInvoicePdfError(err: unknown): PortalApiError {
  if (err instanceof PortalApiError) {
    if (err.status === 403) {
      return new PortalApiError(
        isGenericPdfMessage(err.message)
          ? 'You do not have permission to download this invoice PDF.'
          : err.message,
        err.status,
      );
    }
    if (err.status === 404 || err.status >= 500) {
      return new PortalApiError(
        isGenericPdfMessage(err.message)
          ? 'Invoice PDF is not available yet. If this continues, ask your forwarder to confirm the invoice PDF in ERP.'
          : err.message,
        err.status || 404,
      );
    }
    if (!isGenericPdfMessage(err.message)) return err;
  }
  if (err instanceof Error && err.message.trim() && !isGenericPdfMessage(err.message)) {
    return new PortalApiError(err.message, err instanceof PortalApiError ? err.status : 0);
  }
  return new PortalApiError(
    'Could not download this invoice PDF. Please try again in a moment.',
    err instanceof PortalApiError ? err.status || 0 : 0,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function tryFetchFromPdfUrl(
  pdfUrl: string | undefined,
  filename: string,
  branding: ReturnType<typeof invoicePdfBranding>,
): Promise<{ blob: Blob; fileName: string } | null> {
  const url = pdfUrl?.trim();
  if (!url) return null;
  try {
    const result = await fetchPortalBlob(resolvePortalDownloadUrl(url), filename, {
      accept: PDF_ACCEPT,
      branding,
    });
    if (!(await blobLooksLikePdf(result.blob))) return null;
    return { blob: result.blob, fileName: result.filename };
  } catch {
    return null;
  }
}

/** When GET /pdf returns JSON metadata (same shape as staff), follow pdf_url. */
async function tryFetchFromPdfMetadata(
  id: string,
  filename: string,
  branding: ReturnType<typeof invoicePdfBranding>,
): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.pdf(id), {
      headers: { Accept: 'application/json' },
    });
    const root = asRecord(res.data) ?? {};
    const data = asRecord(unwrapData(res.data)) ?? root;
    const url = pickPortalInvoicePdfUrl(data) || pickString(root.pdf_url, root.customer_pdf_url);
    if (!url) return null;
    return tryFetchFromPdfUrl(url, filename, branding);
  } catch {
    return null;
  }
}

export const portalInvoicesService = {
  async summary(period?: ApiPeriodQuery): Promise<PortalInvoiceSummary> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.summary, {
      params: periodQueryParams(period),
    });
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
    if (!invoiceId?.trim()) throw new Error('Invoice id is required.');
    try {
      const token = usePortalAuthStore.getState().accessToken;
      const data = await postPaymentProofMultipartFetch({
        path: PORTAL_INVOICES_API.paymentProofs(invoiceId),
        file,
        accessToken: token,
        fields: buildPaymentProofUploadFields(dto, 'portal'),
        errorFactory: (message, status) => new PortalApiError(message, status),
      });
      const proof = normalizePaymentProof(data);
      if (!proof) throw new Error('Upload failed — server returned an unexpected response.');
      return proof;
    } catch (error) {
      throw formatPaymentProofUploadError(error);
    }
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
  async getPdfBlob(
    id: string,
    invoiceNumber = 'invoice',
  ): Promise<{ blob: Blob; fileName: string }> {
    const ref = stripPdfExtension(invoiceNumber) || 'invoice';
    const filename = formatPdfFilename(ref, 'invoice');
    const branding = invoicePdfBranding(ref);

    let detail: PortalInvoiceDetail | undefined;
    try {
      detail = await this.getById(id);
    } catch {
      /* continue with dedicated PDF routes */
    }

    // Prefer KingFisher tax-invoice client layout (same visual as staff ERP / vendor portal).
    if (detail) {
      try {
        const user = usePortalAuthStore.getState().user;
        let shipment = undefined;
        if (detail.jobId) {
          try {
            const shipmentDetail = await portalShipmentsService.getById(detail.jobId);
            shipment = shipmentFromPortalShipment(shipmentDetail) ?? undefined;
          } catch {
            /* shipment optional — invoice PDF still downloads */
          }
        }
        const blob = await generateInvoicePdf(
          portalInvoiceToPdfModel(
            {
              number: detail.number,
              invoiceDate: detail.invoiceDate,
              dueDate: detail.dueDate,
              currencyCode: detail.currencyCode,
              jobId: detail.jobId,
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
              phone: detail.partyPhone || user?.phone,
              email: detail.partyEmail || user?.email,
              company: { name: user?.tenantName || 'KINGFISHER WINGS GROUP' },
              shipment,
            },
          ),
        );
        return { blob, fileName: formatPdfFilename(detail.number || ref, 'invoice') };
      } catch {
        /* fall through to server PDF */
      }
    }

    const fromUrl = await tryFetchFromPdfUrl(detail?.pdfUrl, filename, branding);
    if (fromUrl) return fromUrl;

    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) await sleep(700 * attempt);

      try {
        const result = await fetchPortalBlob(PORTAL_INVOICES_API.pdf(id), filename, {
          accept: PDF_ACCEPT,
          branding,
        });
        if (await blobLooksLikePdf(result.blob)) {
          return { blob: result.blob, fileName: result.filename };
        }
        throw new PortalApiError('Download was expected to be a PDF but the server returned a non-PDF response.', 400);
      } catch (primaryErr) {
        lastError = primaryErr;
        const status = primaryErr instanceof PortalApiError ? primaryErr.status : 0;
        if (status === 403) throw friendlyInvoicePdfError(primaryErr);

        const fromMeta = await tryFetchFromPdfMetadata(id, filename, branding);
        if (fromMeta) return fromMeta;

        try {
          const result = await fetchPortalBlob(PORTAL_DOCUMENTS_API.downloadInvoice(id), filename, {
            accept: PDF_ACCEPT,
            branding,
          });
          if (await blobLooksLikePdf(result.blob)) {
            return { blob: result.blob, fileName: result.filename };
          }
          throw new PortalApiError(
            'Download was expected to be a PDF but the server returned a non-PDF response.',
            400,
          );
        } catch (fallbackErr) {
          lastError = fallbackErr;
          const fallbackStatus =
            fallbackErr instanceof PortalApiError ? fallbackErr.status : 0;
          if (fallbackStatus === 403) throw friendlyInvoicePdfError(fallbackErr);
          // Retry on 404/5xx/transient — PDF may still be writing after staff generate.
          if (
            fallbackStatus !== 404 &&
            fallbackStatus < 500 &&
            fallbackStatus !== 0 &&
            status !== 404 &&
            status < 500 &&
            status !== 0
          ) {
            throw friendlyInvoicePdfError(fallbackErr);
          }
        }
      }
    }

    throw friendlyInvoicePdfError(lastError);
  },

  async downloadPdf(id: string, invoiceNumber = 'invoice'): Promise<void> {
    const { blob, fileName } = await this.getPdfBlob(id, invoiceNumber);
    triggerBlobDownload(blob, fileName);
  },
};
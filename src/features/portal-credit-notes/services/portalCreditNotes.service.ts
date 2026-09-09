import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { invoicePdfBranding } from '@/features/files/utils/pdfBranding';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { portalInvoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { safeDownloadFilename } from '@/features/portal-shared/normalize';
import { PORTAL_CREDIT_NOTES_API, PORTAL_DEBIT_NOTES_API } from '../api/portalCreditNotes.api';
import type {
  PortalCreditNoteDetail,
  PortalCreditNoteListParams,
  PortalCreditNoteListResult,
} from '../types/portalCreditNotes.types';
import {
  normalizeCreditNoteDetail,
  normalizeCreditNoteList,
} from '../utils/normalizePortalCreditNotes';

export type PortalNoteKind = 'credit' | 'debit';

const PDF_ACCEPT = 'application/pdf, application/octet-stream, application/json, */*';

function apiFor(kind: PortalNoteKind) {
  return kind === 'debit' ? PORTAL_DEBIT_NOTES_API : PORTAL_CREDIT_NOTES_API;
}

function notePdfLabels(kind: PortalNoteKind) {
  if (kind === 'debit') {
    return {
      documentTitle: 'DEBIT NOTE',
      documentSubtitle: 'DEBIT NOTE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'DEBIT NOTE DETAILS',
      numberLabel: 'Debit Note No.',
      dateLabel: 'Debit Date',
      copyLabel: 'ORIGINAL',
      documentType: 'DEBIT NOTE' as const,
    };
  }
  return {
    documentTitle: 'CREDIT NOTE',
    documentSubtitle: 'CREDIT NOTE / STATEMENT OF CHARGES',
    detailsSectionTitle: 'CREDIT NOTE DETAILS',
    numberLabel: 'Credit Note No.',
    dateLabel: 'Credit Date',
    copyLabel: 'ORIGINAL',
    documentType: 'CREDIT NOTE' as const,
  };
}

function linesSubtotal(detail: PortalCreditNoteDetail): number {
  return (detail.lines ?? []).reduce((sum, line) => {
    if (line.lineTotal != null && Number.isFinite(line.lineTotal)) return sum + line.lineTotal;
    return sum + (line.quantity ?? 0) * (line.unitPrice ?? 0);
  }, 0);
}

async function tryDownloadFromPdfUrl(
  url: string | undefined,
  filename: string,
  branding: ReturnType<typeof invoicePdfBranding>,
): Promise<boolean> {
  const trimmed = String(url || '').trim();
  if (!trimmed) return false;
  try {
    await downloadPortalBlob(trimmed, filename, { accept: PDF_ACCEPT, branding });
    return true;
  } catch {
    return false;
  }
}

export const portalCreditNotesService = {
  async list(
    params: PortalCreditNoteListParams = {},
    kind: PortalNoteKind = 'credit',
  ): Promise<PortalCreditNoteListResult> {
    const res = await portalApiClient.get(apiFor(kind).list, { params });
    return normalizeCreditNoteList(res.data, params, kind);
  },
  async getById(id: string, kind: PortalNoteKind = 'credit'): Promise<PortalCreditNoteDetail> {
    const res = await portalApiClient.get(apiFor(kind).detail(id));
    const detail = normalizeCreditNoteDetail(res.data, kind);
    if (!detail) throw new Error(kind === 'debit' ? 'Debit note not found.' : 'Credit note not found.');
    return detail;
  },
  async downloadPdf(
    id: string,
    kind: PortalNoteKind = 'credit',
    fallbackName?: string,
  ): Promise<void> {
    const labels = notePdfLabels(kind);
    const fallbackBase = kind === 'debit' ? 'debit-note' : 'credit-note';
    const ref = stripPdfExtension(fallbackName || fallbackBase) || fallbackBase;
    const filename = formatPdfFilename(ref, fallbackBase);
    const branding = {
      ...invoicePdfBranding(ref),
      documentType: labels.documentType,
    };

    let detail: PortalCreditNoteDetail | undefined;
    try {
      detail = await this.getById(id, kind);
    } catch {
      /* continue with dedicated PDF routes */
    }

    // Prefer client KingFisher layout (same visual family as portal invoices).
    // Do NOT call /portal/documents/invoices/:id — that expects an invoice id and returns "Document not found".
    if (detail) {
      try {
        const user = usePortalAuthStore.getState().user;
        const lineSum = linesSubtotal(detail);
        const subtotal = detail.subtotal ?? (lineSum || (detail.totalAmount ?? 0));
        const taxTotal = detail.taxTotal ?? 0;
        const blob = await generateInvoicePdf(
          portalInvoiceToPdfModel(
            {
              number: detail.number,
              invoiceDate: detail.creditDate,
              currencyCode: detail.currencyCode,
              reference: detail.creditedInvoiceNumber,
              subtotal,
              taxTotal,
              totalAmount: detail.totalAmount ?? subtotal + taxTotal,
              outstandingBalance: detail.totalAmount ?? subtotal + taxTotal,
              paidAmount: 0,
              remarks: detail.remarks,
              vatRate: detail.vatRate,
              lines: detail.lines,
            },
            {
              clientName: user?.party?.name || user?.fullName,
              attn: user?.fullName,
              phone: user?.phone,
              email: user?.email,
              company: { name: user?.tenantName || 'KINGFISHER WINGS GROUP' },
              ...labels,
            },
          ),
        );
        triggerBlobDownload(
          blob,
          formatPdfFilename(detail.number || ref, fallbackBase),
        );
        return;
      } catch {
        /* fall through to server PDF */
      }
    }

    if (await tryDownloadFromPdfUrl(detail?.pdfUrl, filename, branding)) return;

    // Swagger portal debit notes are list+detail only; credit may have /pdf.
    if (kind === 'credit') {
      try {
        await downloadPortalBlob(
          PORTAL_CREDIT_NOTES_API.pdf(id),
          safeDownloadFilename(filename, filename),
          { accept: PDF_ACCEPT, branding },
        );
        return;
      } catch (err) {
        const message =
          err instanceof PortalApiError || err instanceof Error
            ? err.message
            : 'Could not download credit note PDF.';
        if (/document not found/i.test(message) || /not found/i.test(message)) {
          throw new Error(
            'Credit note PDF is not available yet. Ask your account team to generate it, or try again shortly.',
          );
        }
        throw err instanceof Error ? err : new Error(message);
      }
    }

    throw new Error(
      'Debit note PDF could not be generated from note details.',
    );
  },
};

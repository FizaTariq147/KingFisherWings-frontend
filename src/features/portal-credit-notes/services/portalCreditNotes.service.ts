import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { formatPdfFilename, stripPdfExtension } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { portalInvoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { applyPortalInvoicePdfChrome } from '@/features/portal-shared/applyPortalInvoicePdfChrome';
import { downloadPortalBlob, fetchPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { postPortalWithOptionalFile } from '@/features/portal-shared/portalMultipart';
import { safeDownloadFilename, unwrapData, pickString, pickNumber, asRecord } from '@/features/portal-shared/normalize';
import { PORTAL_CREDIT_NOTES_API, PORTAL_DEBIT_NOTES_API } from '../api/portalCreditNotes.api';
import { portalInvoicesService } from '@/features/portal-invoices/services/portalInvoices.service';
import { isUuid } from '@/lib/isUuid';
import type {
  PortalCreateDebitNoteDto,
  PortalCreditNoteDetail,
  PortalCreditNoteListItem,
  PortalCreditNoteListParams,
  PortalCreditNoteListResult,
} from '../types/portalCreditNotes.types';
import {
  normalizeCreditNoteDetail,
  normalizeCreditNoteList,
} from '../utils/normalizePortalCreditNotes';

export type PortalNoteKind = 'credit' | 'debit';

async function enrichPortalNoteInvoiceNumbers(
  items: PortalCreditNoteListItem[],
): Promise<PortalCreditNoteListItem[]> {
  const missingIds = [
    ...new Set(
      items
        .filter(
          (item) =>
            item.creditedInvoiceId &&
            isUuid(item.creditedInvoiceId) &&
            (!item.creditedInvoiceNumber || isUuid(item.creditedInvoiceNumber)),
        )
        .map((item) => item.creditedInvoiceId as string),
    ),
  ];
  if (!missingIds.length) return items;

  const numberById = new Map<string, string>();
  await Promise.all(
    missingIds.map(async (id) => {
      try {
        const detail = await portalInvoicesService.getById(id);
        const number = detail.number?.trim();
        if (number && !isUuid(number)) numberById.set(id, number);
      } catch {
        /* keep id-only fallback */
      }
    }),
  );
  if (!numberById.size) return items;

  return items.map((item) => {
    if (!item.creditedInvoiceId) return item;
    const resolved = numberById.get(item.creditedInvoiceId);
    if (!resolved) return item;
    return { ...item, creditedInvoiceNumber: resolved };
  });
}

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

async function tryDownloadFromPdfUrl(url: string | undefined, filename: string): Promise<boolean> {
  const trimmed = String(url || '').trim();
  if (!trimmed) return false;
  try {
    const result = await fetchPortalBlob(trimmed, filename, { accept: PDF_ACCEPT });
    if (!(await blobLooksLikePdf(result.blob))) return false;
    triggerBlobDownload(await applyPortalInvoicePdfChrome(result.blob), result.filename);
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
    const normalized = normalizeCreditNoteList(res.data, params, kind);
    return {
      ...normalized,
      items: await enrichPortalNoteInvoiceNumbers(normalized.items),
    };
  },

  async getById(id: string, kind: PortalNoteKind = 'credit'): Promise<PortalCreditNoteDetail> {
    const res = await portalApiClient.get(apiFor(kind).detail(id));
    const detail = normalizeCreditNoteDetail(res.data, kind);
    if (!detail) throw new Error(`${kind === 'debit' ? 'Debit' : 'Credit'} note not found.`);
    const [enriched] = await enrichPortalNoteInvoiceNumbers([detail]);
    return { ...detail, ...(enriched ?? {}) };
  },

  /**
   * POST /portal/debit-notes — customer creates a job-ledger debit note
   * (e.g. advance payment proof) with optional attachment. No invoice required.
   */
  async createDebitNote(dto: PortalCreateDebitNoteDto): Promise<PortalCreditNoteDetail> {
    if (!isUuid(dto.job_id)) throw new Error('Select a valid job.');
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
      throw new Error('Enter a positive amount.');
    }
    const res = await postPortalWithOptionalFile(
      PORTAL_DEBIT_NOTES_API.create,
      {
        job_id: dto.job_id.trim(),
        amount: String(dto.amount),
        currency_code: dto.currency_code?.trim().toUpperCase() || 'AED',
        remarks: dto.remarks?.trim() || undefined,
        description:
          dto.description?.trim() ||
          dto.remarks?.trim() ||
          'Advance payment / job ledger debit',
      },
      dto.file,
    );
    const detail = normalizeCreditNoteDetail(unwrapData(res.data) ?? res.data, 'debit');
    if (!detail) throw new Error('Could not create debit note.');
    return detail;
  },

  async downloadDebitAttachment(
    id: string,
    fallbackName = 'debit-note-attachment',
  ): Promise<void> {
    await downloadPortalBlob(
      PORTAL_DEBIT_NOTES_API.attachment(id),
      safeDownloadFilename(fallbackName, 'debit-note-attachment'),
      { accept: 'application/octet-stream, */*' },
    );
  },

  /** POST /portal/debit-notes/:id/pay — start online payment for an admin-issued DN. */
  async payDebitNote(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<{ checkoutUrl?: string; status?: string }> {
    const res = await portalApiClient.post(PORTAL_DEBIT_NOTES_API.pay(id), body);
    const data = asRecord(unwrapData(res.data) ?? res.data) ?? {};
    return {
      checkoutUrl:
        pickString(
          data.checkout_url,
          data.checkoutUrl,
          data.url,
          data.payment_url,
          data.paymentUrl,
        ) || undefined,
      status: pickString(data.status, data.payment_status, data.paymentStatus) || undefined,
    };
  },

  async debitPaymentStatus(id: string): Promise<{
    status?: string;
    paidAmount?: number;
    outstandingAmount?: number;
  }> {
    const res = await portalApiClient.get(PORTAL_DEBIT_NOTES_API.paymentStatus(id));
    const data = asRecord(unwrapData(res.data) ?? res.data) ?? {};
    return {
      status: pickString(data.status, data.payment_status, data.paymentStatus) || undefined,
      paidAmount: pickNumber(data.paid_amount, data.paidAmount) ?? undefined,
      outstandingAmount:
        pickNumber(
          data.outstanding_amount,
          data.outstandingAmount,
          data.balance_due,
          data.remaining_amount,
        ) ?? undefined,
    };
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

    let detail: PortalCreditNoteDetail | undefined;
    try {
      detail = await this.getById(id, kind);
    } catch {
      /* continue with dedicated PDF routes */
    }

    // Prefer client KingFisher layout (same as admin / portal invoices).
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

    if (await tryDownloadFromPdfUrl(detail?.pdfUrl, filename)) return;

    if (kind === 'credit') {
      try {
        const result = await fetchPortalBlob(
          PORTAL_CREDIT_NOTES_API.pdf(id),
          safeDownloadFilename(filename, filename),
          { accept: PDF_ACCEPT },
        );
        if (!(await blobLooksLikePdf(result.blob))) {
          throw new PortalApiError(
            'Download was expected to be a PDF but the server returned a non-PDF response.',
            400,
          );
        }
        triggerBlobDownload(await applyPortalInvoicePdfChrome(result.blob), result.filename);
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

    throw new Error('Debit note PDF could not be generated from note details.');
  },
};

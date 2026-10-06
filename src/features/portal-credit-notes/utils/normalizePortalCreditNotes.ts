import { isUuid } from '@/lib/isUuid';
import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList
} from '@/features/portal-shared/normalize';
import type {
  PortalCreditNoteDetail, PortalCreditNoteLine, PortalCreditNoteListItem, PortalCreditNoteListResult,
} from '../types/portalCreditNotes.types';

function humanCode(...candidates: Array<string | undefined>): string | undefined {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !isUuid(trimmed)) return trimmed;
  }
  return undefined;
}

export function normalizeCreditNoteLine(raw: unknown): PortalCreditNoteLine | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    description: pickString(r.description) || 'Line',
    quantity: pickNumber(r.quantity),
    unitPrice: pickNumber(r.unit_price, r.unitPrice),
    lineTotal: pickNumber(r.line_total, r.lineTotal, r.amount, r.total),
  };
}

export function normalizeCreditNoteListItem(
  raw: unknown,
  kind: 'credit' | 'debit' = 'credit',
): PortalCreditNoteListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const credited = asRecord(r.credited_invoice) ?? asRecord(r.invoice) ?? asRecord(r.source_invoice);
  const prefix = kind === 'debit' ? 'DN' : 'CN';
  const number =
    humanCode(
      pickString(
        r.credit_note_number,
        r.creditNoteNumber,
        r.debit_note_number,
        r.debitNoteNumber,
        r.number,
        r.ref,
      ),
    ) || `${prefix}-${id.slice(0, 8).toUpperCase()}`;
  return {
    id,
    number,
    status: pickString(r.status) || undefined,
    currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
    creditDate:
      pickString(
        r.credit_date,
        r.creditDate,
        r.debit_date,
        r.debitDate,
        r.invoice_date,
        r.created_at,
      ) || undefined,
    totalAmount: pickNumber(r.total_amount, r.totalAmount, r.total),
    creditedInvoiceId:
      pickString(
        r.credited_invoice_id,
        r.creditedInvoiceId,
        r.invoice_id,
        r.debited_invoice_id,
        credited?.id,
      ) || undefined,
    creditedInvoiceNumber:
      humanCode(
        pickString(
          r.credited_invoice_number,
          r.creditedInvoiceNumber,
          r.debited_invoice_number,
          credited?.invoice_number,
          credited?.number,
        ),
        // Avoid treating the note's own number / UUID as the source invoice label.
      ) || undefined,
    kind,
  };
}

export function normalizeCreditNoteList(
  raw: unknown,
  params: { page?: number; limit?: number },
  kind: 'credit' | 'debit' = 'credit',
): PortalCreditNoteListResult {
  const { items, meta } = unwrapList(raw, [
    'items',
    'results',
    'credit_notes',
    'creditNotes',
    'debit_notes',
    'debitNotes',
    'data',
  ]);
  const normalized = items
    .map((row) => normalizeCreditNoteListItem(row, kind))
    .filter((x): x is PortalCreditNoteListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeCreditNoteDetail(
  raw: unknown,
  kind: 'credit' | 'debit' = 'credit',
): PortalCreditNoteDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!data) return null;
  const base = normalizeCreditNoteListItem(data, kind); if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    remarks: pickString(data.remarks) || undefined,
    lines: linesRaw.map(normalizeCreditNoteLine).filter((l): l is PortalCreditNoteLine => Boolean(l)),
    subtotal: pickNumber(data.subtotal, data.sub_total, data.net_amount, data.netAmount),
    taxTotal: pickNumber(data.tax_total, data.taxTotal, data.vat_amount, data.vatAmount),
    vatRate: pickNumber(data.vat_rate, data.vatRate, data.tax_rate, data.taxRate),
    pdfUrl:
      pickString(
        data.pdf_url,
        data.pdfUrl,
        data.customer_pdf_url,
        data.customerPdfUrl,
        data.download_url,
        data.downloadUrl,
        data.file_url,
        data.fileUrl,
      ) || undefined,
  };
}


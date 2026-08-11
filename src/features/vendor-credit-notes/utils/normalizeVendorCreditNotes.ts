import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type {
  VendorCreditNoteListItem,
  VendorCreditNoteListParams,
  VendorCreditNoteListResult,
} from '../types/vendorCreditNotes.types';

function normalizeItem(raw: unknown): VendorCreditNoteListItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return {
    id,
    number: pickString(r.credit_note_number, r.number, r.ref) || id,
    status: pickString(r.status) || undefined,
    creditDate: pickString(r.credit_date, r.date, r.issued_at) || undefined,
    amount: pickNumber(r.amount, r.total, r.total_amount),
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    reference: pickString(r.reference, r.invoice_number) || undefined,
  };
}

export function normalizeCreditNoteList(
  raw: unknown,
  params: VendorCreditNoteListParams,
): VendorCreditNoteListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'credit_notes', 'creditNotes', 'data']);
  const normalized = items
    .map(normalizeItem)
    .filter((x): x is VendorCreditNoteListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

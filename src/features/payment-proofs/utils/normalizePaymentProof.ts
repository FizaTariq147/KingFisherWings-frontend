import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type { FinanceOpenItemsSummary, PaymentProof } from '../types/paymentProof.types';

export function normalizePaymentProof(raw: unknown): PaymentProof | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id);
  if (!id) return null;
  return {
    id,
    invoiceId: pickString(record.invoice_id, record.invoiceId) || undefined,
    status: pickString(record.status) || undefined,
    amount: pickNumber(record.amount, record.payment_amount, record.paymentAmount),
    currencyCode: pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
    paymentDate: pickString(record.payment_date, record.paymentDate) || undefined,
    reference: pickString(record.reference, record.reference_number, record.bank_reference) || undefined,
    notes: pickString(record.notes, record.remarks) || undefined,
    reviewNotes: pickString(record.review_notes, record.reviewNotes) || undefined,
    fileName: pickString(record.file_name, record.fileName, record.filename) || undefined,
    fileUrl: pickString(record.file_url, record.fileUrl, record.download_url) || undefined,
    submittedAt: pickString(record.submitted_at, record.created_at, record.submittedAt) || undefined,
    reviewedAt: pickString(record.reviewed_at, record.acknowledged_at, record.reviewedAt) || undefined,
    raw: record,
  };
}

export function normalizePaymentProofList(raw: unknown): PaymentProof[] {
  const { items } = unwrapList(raw, ['payment_proofs', 'proofs', 'items', 'results']);
  return items
    .map(normalizePaymentProof)
    .filter((p): p is PaymentProof => Boolean(p));
}

export function normalizeFinancePaymentsSummary(raw: unknown): FinanceOpenItemsSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    totalOutstanding: pickNumber(
      data.total_outstanding,
      data.outstanding,
      data.balance_due,
      data.pending,
    ),
    totalPaidYtd: pickNumber(data.total_paid_ytd, data.paid_ytd, data.received_ytd, data.paid),
    count: pickNumber(data.count, data.open_count),
    currencyCode: pickString(data.currency_code, data.currencyCode, data.currency) || undefined,
    raw: data,
  };
}

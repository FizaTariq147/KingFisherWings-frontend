import type { PartyPaymentRow } from '../types/partyPayments.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizePartyPaymentRow(raw: unknown): PartyPaymentRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id) ?? str(r.payment_id) ?? str(r.receipt_id);
  if (!id) return null;
  const proof = asRecord(r.proof) ?? asRecord(r.payment_proof);
  const invoice = asRecord(r.invoice) ?? asRecord(r.document);
  return {
    id,
    direction: (
      str(r.direction) ??
      str(r.payment_type) ??
      str(r.type) ??
      str(r.voucher_type)
    )?.toUpperCase(),
    amount: num(r.amount) ?? num(r.total_amount) ?? num(r.paid_amount),
    currency_code: (str(r.currency_code) ?? str(r.currencyCode) ?? str(r.currency))?.toUpperCase(),
    payment_date:
      str(r.payment_date) ??
      str(r.date) ??
      str(r.posted_at) ??
      str(r.created_at)?.slice(0, 10),
    reference:
      str(r.reference) ??
      str(r.reference_number) ??
      str(r.payment_number) ??
      str(r.number),
    invoice_id:
      str(r.invoice_id) ??
      str(invoice?.id) ??
      str(r.document_id),
    invoice_number:
      str(r.invoice_number) ??
      str(invoice?.invoice_number) ??
      str(invoice?.number) ??
      str(r.document_number),
    proof_id: str(r.proof_id) ?? str(proof?.id),
    proof_url:
      str(r.proof_url) ??
      str(r.proof_file_url) ??
      str(proof?.file_url) ??
      str(proof?.fileUrl),
    notes: str(r.notes) ?? str(r.narration),
    raw: r,
  };
}

export function normalizePartyPaymentList(raw: unknown): PartyPaymentRow[] {
  const root = asRecord(raw);
  const nested = asRecord(root?.data);
  const list =
    (Array.isArray(raw) && raw) ||
    (Array.isArray(root?.payments) && root.payments) ||
    (Array.isArray(root?.items) && root.items) ||
    (Array.isArray(root?.data) && root.data) ||
    (Array.isArray(nested?.payments) && nested.payments) ||
    (Array.isArray(nested?.items) && nested.items) ||
    [];
  return list
    .map(normalizePartyPaymentRow)
    .filter((p): p is PartyPaymentRow => Boolean(p));
}

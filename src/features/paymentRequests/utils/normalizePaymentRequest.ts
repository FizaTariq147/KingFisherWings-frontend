import { isUuid } from '@/lib/isUuid';
import {
  PAYMENT_REQUEST_STATUSES,
  type PaymentRequestStatus,
} from '../constants/paymentRequest.constants';
import type { PaymentRequest } from '../types/paymentRequest.types';

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

function normalizeStatus(value: unknown): PaymentRequestStatus {
  const raw = String(value ?? 'PENDING').trim().toUpperCase();
  return (PAYMENT_REQUEST_STATUSES as readonly string[]).includes(raw)
    ? (raw as PaymentRequestStatus)
    : 'PENDING';
}

export function normalizePaymentRequest(raw: unknown): PaymentRequest | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;
  const party_id = str(r.party_id) ?? '';
  return {
    id,
    request_number:
      str(r.request_number) ?? str(r.payment_request_number) ?? str(r.number),
    status: normalizeStatus(r.status),
    party_id,
    party_name:
      str(r.party_name) ??
      str(r.customer_name) ??
      str(r.vendor_name) ??
      str(asRecord(r.party)?.name),
    amount: num(r.amount) ?? 0,
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    invoice_id: str(r.invoice_id),
    job_id: str(r.job_id),
    due_date: str(r.due_date),
    remarks: str(r.remarks),
    rejected_reason: str(r.rejected_reason) ?? str(r.rejection_reason),
    approved_at: str(r.approved_at),
    rejected_at: str(r.rejected_at),
    paid_at: str(r.paid_at),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizePaymentRequests(raw: unknown): PaymentRequest[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizePaymentRequest)
    .filter((p): p is PaymentRequest => Boolean(p));
}

export function paymentRequestDisplayNumber(pr: PaymentRequest): string {
  return pr.request_number || pr.id.slice(0, 8).toUpperCase();
}

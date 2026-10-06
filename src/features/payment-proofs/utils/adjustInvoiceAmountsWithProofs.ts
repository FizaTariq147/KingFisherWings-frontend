import type { PaymentProof } from '../types/paymentProof.types';

function statusKey(status?: string): string {
  return String(status || 'PENDING').trim().toUpperCase();
}

/** Proofs that still count toward customer-facing payment (not rejected). */
export function isCountablePaymentProof(proof: PaymentProof): boolean {
  const s = statusKey(proof.status);
  return s !== 'REJECTED' && s !== 'CANCELLED' && s !== 'VOID' && s !== 'DECLINED';
}

/** Awaiting finance review — not yet reflected on invoice.paid_amount. */
export function isPendingPaymentProof(proof: PaymentProof): boolean {
  const s = statusKey(proof.status);
  return s === 'PENDING' || s === 'SUBMITTED' || s === '' || s === 'UNDER_REVIEW';
}

export function isAcknowledgedPaymentProof(proof: PaymentProof): boolean {
  const s = statusKey(proof.status);
  return (
    s === 'ACKNOWLEDGED' ||
    s === 'APPROVED' ||
    s === 'ACCEPTED' ||
    s === 'POSTED'
  );
}

export function sumProofAmounts(
  proofs: PaymentProof[],
  predicate: (proof: PaymentProof) => boolean,
): number {
  return proofs.reduce((sum, proof) => {
    if (!predicate(proof)) return sum;
    const amount = proof.amount;
    if (amount == null || !Number.isFinite(amount) || amount <= 0) return sum;
    return sum + amount;
  }, 0);
}

export interface InvoiceAmountBasis {
  totalAmount?: number;
  paidAmount?: number;
  outstandingBalance?: number;
  /** Backend invoice status (used when amounts do not imply a payment state). */
  status?: string;
}

export interface AdjustedInvoiceAmounts {
  /** Backend-confirmed paid (invoice.paid_amount). */
  confirmedPaid: number;
  /** Sum of pending/submitted proof amounts awaiting review. */
  pendingProofAmount: number;
  /** Paid shown to the customer: confirmed + pending proofs (capped at total). */
  paidAmount: number;
  /** Remaining after confirmed + pending proofs. */
  remainingAmount: number;
  totalAmount?: number;
  /** True when pending proofs increased the displayed paid figure. */
  includesPendingProofs: boolean;
  /**
   * Display status derived from paid vs remaining (PAID / PARTIALLY_PAID).
   * Preserves cancelled/void. No hardcoded amounts.
   */
  displayStatus: string;
}

const TERMINAL_STATUSES = new Set(['CANCELLED', 'VOID', 'WRITTEN_OFF']);

/** Money equality tolerance for float totals. */
const MONEY_EPS = 0.009;

/**
 * Derive PAID / PARTIALLY_PAID from amounts. Any invoice whose remaining is ~0
 * with paid &gt; 0 is PAID — totals are never hard-coded.
 */
export function resolveInvoiceDisplayStatus(
  currentStatus: string | undefined,
  amounts: Pick<AdjustedInvoiceAmounts, 'paidAmount' | 'remainingAmount' | 'totalAmount'>,
): string {
  const current = String(currentStatus || '').trim().toUpperCase();
  if (TERMINAL_STATUSES.has(current)) return current;

  const paid = amounts.paidAmount;
  const remaining = amounts.remainingAmount;
  const total = amounts.totalAmount;

  const fullyPaidByRemaining = remaining <= MONEY_EPS && paid > MONEY_EPS;
  const fullyPaidByTotal =
    total != null && total > MONEY_EPS && paid + MONEY_EPS >= total && remaining <= MONEY_EPS;

  if (fullyPaidByRemaining || fullyPaidByTotal) return 'PAID';
  if (paid > MONEY_EPS && remaining > MONEY_EPS) return 'PARTIALLY_PAID';

  return current || 'DRAFT';
}

/**
 * Customer-facing paid / remaining: pending payment proofs adjust paid immediately
 * so a partial claim reduces remaining while finance review is still open.
 * Acknowledged proofs are assumed to already be in invoice.paid_amount when that
 * field is present; if paid_amount is missing, acknowledged amounts are included.
 */
export function adjustInvoiceAmountsWithProofs(
  invoice: InvoiceAmountBasis,
  proofs: PaymentProof[],
): AdjustedInvoiceAmounts {
  const total =
    invoice.totalAmount != null && Number.isFinite(invoice.totalAmount)
      ? invoice.totalAmount
      : undefined;

  const backendPaid =
    invoice.paidAmount != null && Number.isFinite(invoice.paidAmount)
      ? Math.max(0, invoice.paidAmount)
      : undefined;

  const pendingProofAmount = sumProofAmounts(proofs, isPendingPaymentProof);
  const acknowledgedAmount = sumProofAmounts(proofs, isAcknowledgedPaymentProof);

  const confirmedPaid =
    backendPaid != null
      ? backendPaid
      : acknowledgedAmount > 0
        ? acknowledgedAmount
        : 0;

  let paidAmount = confirmedPaid + pendingProofAmount;
  if (total != null) paidAmount = Math.min(total, Math.max(0, paidAmount));
  else paidAmount = Math.max(0, paidAmount);

  let remainingAmount: number;
  if (total != null) {
    remainingAmount = Math.max(0, total - paidAmount);
  } else if (
    invoice.outstandingBalance != null &&
    Number.isFinite(invoice.outstandingBalance)
  ) {
    remainingAmount = Math.max(0, invoice.outstandingBalance - pendingProofAmount);
  } else {
    remainingAmount = 0;
  }

  const base = {
    confirmedPaid,
    pendingProofAmount,
    paidAmount,
    remainingAmount,
    totalAmount: total,
    includesPendingProofs: pendingProofAmount > 0,
  };

  return {
    ...base,
    displayStatus: resolveInvoiceDisplayStatus(invoice.status, base),
  };
}

import { glPaymentService } from '@/features/glPayments/services/glPayment.service';
import type { PaymentMethod } from '@/features/glPayments/constants/glPayment.constants';
import type { PurchaseInvoice } from '@/features/purchaseInvoices/types/purchaseInvoice.types';
import { isUuid } from '@/lib/isUuid';
import type { PaymentProof } from '../types/paymentProof.types';

function proofPaymentDate(proof: PaymentProof): string {
  const raw = proof.paymentDate?.trim() || '';
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (m) return m[1];
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Fallback when PATCH /payment-proofs/:id/approve returns 500:
 * create + post a vendor GL PAYMENT allocated to the purchase invoice.
 * Caller should then acknowledge the proof (approve may still be broken on BE).
 */
export async function applyPurchaseInvoiceProofViaGlPayment(options: {
  invoice: PurchaseInvoice;
  proof: PaymentProof;
  paymentMethod: PaymentMethod;
  bankAccountId: string;
  glAccountId?: string;
  reviewNotes?: string;
}): Promise<{ paymentId: string }> {
  const { invoice, proof, paymentMethod, bankAccountId, glAccountId, reviewNotes } = options;
  if (!isUuid(invoice.party_id)) {
    throw new Error('Purchase invoice has no vendor party_id — cannot post GL payment.');
  }
  const amount = proof.amount;
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Proof has no claimed amount to post.');
  }
  if (paymentMethod !== 'CASH' && !isUuid(bankAccountId)) {
    throw new Error('Select a bank account before recording the GL payment.');
  }

  const currency =
    (proof.currencyCode || invoice.currency_code || 'AED').trim().toUpperCase() || 'AED';
  const created = await glPaymentService.create({
    direction: 'PAYMENT',
    payment_method: paymentMethod,
    party_id: invoice.party_id,
    amount,
    currency_code: currency,
    payment_date: proofPaymentDate(proof),
    ...(isUuid(bankAccountId) ? { bank_account_id: bankAccountId } : {}),
    ...(glAccountId && isUuid(glAccountId) ? { gl_account_id: glAccountId } : {}),
    ...(invoice.company_id && isUuid(invoice.company_id)
      ? { company_id: invoice.company_id }
      : {}),
    ...(invoice.branch_id && isUuid(invoice.branch_id) ? { branch_id: invoice.branch_id } : {}),
    reference_number: proof.reference?.trim() || proof.fileName?.slice(0, 100) || undefined,
    narration:
      reviewNotes?.trim() || `Payment proof ${proof.id.slice(0, 8)}`,
    allocations: [{ invoice_id: invoice.id, amount }],
  });

  let paymentId = created.id;
  if (String(created.status || '').toUpperCase() !== 'POSTED') {
    const posted = await glPaymentService.post(created.id);
    paymentId = posted.id;
  }
  return { paymentId };
}

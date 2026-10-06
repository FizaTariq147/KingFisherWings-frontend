import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from '@/features/glPayments/constants/glPayment.constants';
import type { PaymentProof } from '../types/paymentProof.types';
import { useInvoicePaymentProofs, useReviewPaymentProof } from '../hooks/usePaymentProofs';
import { PaymentProofOpenButton } from './PaymentProofOpenButton';

function proofVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = (status || '').toUpperCase();
  if (s === 'ACKNOWLEDGED' || s === 'APPROVED' || s === 'POSTED') return 'success';
  if (s === 'REJECTED') return 'danger';
  if (s === 'SUBMITTED' || s === 'PENDING') return 'warning';
  return 'neutral';
}

function statusKey(status?: string): string {
  return String(status || '').trim().toUpperCase();
}

interface StaffPaymentProofReviewPanelProps {
  invoiceId: string;
}

export function StaffPaymentProofReviewPanel({ invoiceId }: StaffPaymentProofReviewPanelProps) {
  const { hasPermission } = useAuth();
  const canReview = hasPermission('invoices.review_payment_proofs');
  const { data: proofs = [], isLoading, refetch } = useInvoicePaymentProofs(invoiceId);
  const review = useReviewPaymentProof(invoiceId);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, PaymentMethod>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pending = proofs.filter((p) => {
    const s = statusKey(p.status);
    return s === 'SUBMITTED' || s === 'PENDING';
  });

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading payment proofs…</p>;
  }

  if (proofs.length === 0) {
    return (
      <p className="text-sm text-[var(--color-neutral-400)]">
        No payment proofs submitted for this invoice yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      {!canReview && pending.length > 0 ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          {pending.length} proof(s) awaiting review. You need invoices.review_payment_proofs
          permission.
        </p>
      ) : null}
      <p className="text-xs text-[var(--color-neutral-500)]">
        Approving a proof posts the claimed amount via a GL receipt. Portal-recorded payments already
        post a RECEIPT — reject cancels that receipt and restores balance due. Acknowledge is a
        no-op when payment was already posted.
      </p>
      {proofs.map((proof) => (
        <ProofRow
          key={proof.id}
          proof={proof}
          canReview={canReview}
          notes={notes[proof.id] || ''}
          paymentMethod={methods[proof.id] || 'BANK_TRANSFER'}
          onNotesChange={(value) => setNotes((prev) => ({ ...prev, [proof.id]: value }))}
          onMethodChange={(value) => setMethods((prev) => ({ ...prev, [proof.id]: value }))}
          onApprove={() =>
            run(
              () =>
                review.approve.mutateAsync({
                  id: proof.id,
                  dto: {
                    payment_method: methods[proof.id] || 'BANK_TRANSFER',
                    ...(notes[proof.id]?.trim()
                      ? { review_notes: notes[proof.id].trim() }
                      : {}),
                  },
                }),
              proof.amount != null
                ? `Proof approved. ${proof.amount} applied to invoice paid amount.`
                : 'Payment proof approved and applied to invoice.',
            )
          }
          onAcknowledge={() =>
            run(
              () =>
                review.acknowledge.mutateAsync({
                  id: proof.id,
                  dto: notes[proof.id]?.trim()
                    ? { review_notes: notes[proof.id].trim() }
                    : {},
                }),
              proof.linkedPaymentId
                ? 'Acknowledged. Payment was already posted from the portal — invoice balance unchanged.'
                : 'Payment proof acknowledged.',
            )
          }
          onReject={() =>
            run(
              () =>
                review.reject.mutateAsync({
                  id: proof.id,
                  dto: notes[proof.id]?.trim()
                    ? { review_notes: notes[proof.id].trim() }
                    : {},
                }),
              proof.linkedPaymentId
                ? 'Payment proof rejected. Linked RECEIPT cancelled and invoice balance restored.'
                : 'Payment proof rejected.',
            )
          }
          busy={
            review.approve.isPending ||
            review.reject.isPending ||
            review.acknowledge.isPending
          }
        />
      ))}
    </div>
  );
}

function ProofRow({
  proof,
  canReview,
  notes,
  paymentMethod,
  onNotesChange,
  onMethodChange,
  onApprove,
  onAcknowledge,
  onReject,
  busy,
}: {
  proof: PaymentProof;
  canReview: boolean;
  notes: string;
  paymentMethod: PaymentMethod;
  onNotesChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod) => void;
  onApprove: () => void;
  onAcknowledge: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  const s = statusKey(proof.status);
  const linked = Boolean(proof.linkedPaymentId);
  const rejected = s === 'REJECTED';
  const pendingReview = s === 'SUBMITTED' || s === 'PENDING';
  const canApprove = canReview && pendingReview && !linked;
  /** Acknowledge is mainly for portal-posted payments (no-op on amounts). */
  const canAcknowledge = canReview && linked && !rejected;
  const canReject = canReview && !rejected && (pendingReview || linked);

  return (
    <div className="space-y-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{proof.fileName || proof.reference || proof.id}</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {[
              proof.paymentDate,
              proof.amount != null ? `Claimed ${proof.amount}` : null,
              proof.reference,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {proof.status ? (
            <Badge variant={proofVariant(proof.status)} dot={false}>
              {proof.status.replaceAll('_', ' ')}
            </Badge>
          ) : null}
          <PaymentProofOpenButton proof={proof} viewer="staff" />
        </div>
      </div>
      {linked ? (
        <p className="text-xs text-[var(--color-neutral-600)]">
          Linked portal RECEIPT — balance already applied. Reject cancels the receipt and restores
          balance due. Acknowledge does not change amounts.
        </p>
      ) : null}
      {proof.notes ? <p className="text-xs text-[var(--color-neutral-600)]">{proof.notes}</p> : null}
      {proof.reviewNotes ? (
        <p className="text-xs text-[var(--color-neutral-500)]">Review: {proof.reviewNotes}</p>
      ) : null}
      {canApprove || canAcknowledge || canReject ? (
        <div className="space-y-2 pt-1">
          {canApprove ? (
            <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
              Payment method
              <select
                className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(e) => onMethodChange(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Input
            placeholder="Review notes (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {canApprove ? (
              <Button type="button" size="sm" disabled={busy} onClick={onApprove}>
                Approve &amp; apply to invoice
              </Button>
            ) : null}
            {canAcknowledge ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={onAcknowledge}
              >
                Acknowledge
              </Button>
            ) : null}
            {canReject ? (
              <Button type="button" size="sm" variant="danger" disabled={busy} onClick={onReject}>
                {linked ? 'Reject & reverse RECEIPT' : 'Reject'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

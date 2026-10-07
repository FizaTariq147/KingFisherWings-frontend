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
import {
  usePurchaseInvoicePaymentProofs,
  useUploadPurchaseInvoicePaymentProof,
} from '@/features/purchaseInvoices/hooks/usePurchaseInvoices';
import type { PaymentProof } from '../types/paymentProof.types';
import { useReviewPaymentProof } from '../hooks/usePaymentProofs';
import { PaymentProofOpenButton } from './PaymentProofOpenButton';
import { PaymentProofUploadForm } from './PaymentProofPanels';

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

interface StaffPurchaseInvoicePaymentProofPanelProps {
  purchaseInvoiceId: string;
  currencyCode?: string;
  remainingAmount?: number;
}

/**
 * Admin-side payment proofs for purchase invoices (AP).
 * Vendors post invoices; staff upload / review proofs here.
 */
export function StaffPurchaseInvoicePaymentProofPanel({
  purchaseInvoiceId,
  currencyCode,
  remainingAmount,
}: StaffPurchaseInvoicePaymentProofPanelProps) {
  const { hasPermission } = useAuth();
  const canReview = hasPermission('invoices.review_payment_proofs');
  const {
    data: proofs = [],
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = usePurchaseInvoicePaymentProofs(purchaseInvoiceId);
  const upload = useUploadPurchaseInvoicePaymentProof(purchaseInvoiceId);
  const review = useReviewPaymentProof(purchaseInvoiceId, 'purchase-invoice');
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

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-neutral-500)]">
        Upload remittance proof for this vendor purchase invoice (file, amount claimed, payment
        date), then approve or reject.
      </p>

      <PaymentProofUploadForm
        disabled={upload.isPending}
        currencyCode={currencyCode}
        remainingAmount={remainingAmount}
        onUpload={async (file, dto) => {
          await upload.mutateAsync({ file, dto });
          void refetch();
        }}
      />

      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      {isError ? (
        <div className="space-y-1">
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {loadError instanceof Error
              ? loadError.message
              : 'Could not load payment proofs for this purchase invoice.'}
          </p>
          <button type="button" className="text-xs underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading payment proofs…</p>
      ) : proofs.length === 0 && !isError ? (
        <p className="text-sm text-[var(--color-neutral-400)]">
          No payment proofs recorded for this purchase invoice yet.
        </p>
      ) : proofs.length > 0 ? (
        <div className="space-y-3">
          {!canReview && pending.length > 0 ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              {pending.length} proof(s) awaiting review. You need invoices.review_payment_proofs
              permission.
            </p>
          ) : null}
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
                    ? `Proof approved. ${proof.amount} applied to purchase invoice.`
                    : 'Payment proof approved.',
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
                  'Payment proof acknowledged.',
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
                  'Payment proof rejected.',
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
      ) : null}
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
  const rejected = s === 'REJECTED';
  const pendingReview = s === 'SUBMITTED' || s === 'PENDING';
  const canApprove = canReview && pendingReview;
  const canAcknowledge = canReview && !rejected && !pendingReview && s !== 'APPROVED';
  const canReject = canReview && !rejected && (pendingReview || Boolean(proof.linkedPaymentId));

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
                Approve &amp; apply
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
                Reject
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

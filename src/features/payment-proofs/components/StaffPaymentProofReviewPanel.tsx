import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import type { PaymentProof } from '../types/paymentProof.types';
import { useInvoicePaymentProofs, useReviewPaymentProof } from '../hooks/usePaymentProofs';

function proofVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = (status || '').toUpperCase();
  if (s === 'ACKNOWLEDGED') return 'success';
  if (s === 'REJECTED') return 'danger';
  if (s === 'SUBMITTED' || s === 'PENDING') return 'warning';
  return 'neutral';
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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pending = proofs.filter((p) => {
    const s = (p.status || '').toUpperCase();
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
          {pending.length} proof(s) awaiting review. You need invoices.review_payment_proofs permission.
        </p>
      ) : null}
      {proofs.map((proof) => (
        <ProofRow
          key={proof.id}
          proof={proof}
          canReview={canReview}
          notes={notes[proof.id] || ''}
          onNotesChange={(value) => setNotes((prev) => ({ ...prev, [proof.id]: value }))}
          onAcknowledge={() =>
            run(
              () =>
                review.acknowledge.mutateAsync({
                  id: proof.id,
                  dto: notes[proof.id]?.trim() ? { review_notes: notes[proof.id].trim() } : {},
                }),
              'Payment proof acknowledged.',
            )
          }
          onReject={() =>
            run(
              () =>
                review.reject.mutateAsync({
                  id: proof.id,
                  dto: notes[proof.id]?.trim() ? { review_notes: notes[proof.id].trim() } : {},
                }),
              'Payment proof rejected.',
            )
          }
          busy={review.acknowledge.isPending || review.reject.isPending}
        />
      ))}
    </div>
  );
}

function ProofRow({
  proof,
  canReview,
  notes,
  onNotesChange,
  onAcknowledge,
  onReject,
  busy,
}: {
  proof: PaymentProof;
  canReview: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  onAcknowledge: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  const s = (proof.status || '').toUpperCase();
  const reviewable = canReview && (s === 'SUBMITTED' || s === 'PENDING');

  return (
    <div className="rounded-md border border-[var(--color-neutral-200)] px-3 py-3 text-sm space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{proof.fileName || proof.reference || proof.id}</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {[proof.paymentDate, proof.amount != null ? String(proof.amount) : null, proof.reference]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {proof.status ? (
          <Badge variant={proofVariant(proof.status)} dot={false}>
            {proof.status.replaceAll('_', ' ')}
          </Badge>
        ) : null}
      </div>
      {proof.notes ? <p className="text-xs text-[var(--color-neutral-600)]">{proof.notes}</p> : null}
      {proof.reviewNotes ? (
        <p className="text-xs text-[var(--color-neutral-500)]">Review: {proof.reviewNotes}</p>
      ) : null}
      {reviewable ? (
        <div className="space-y-2 pt-1">
          <Input
            placeholder="Review notes (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={onAcknowledge}>
              Acknowledge
            </Button>
            <Button type="button" size="sm" variant="danger" disabled={busy} onClick={onReject}>
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

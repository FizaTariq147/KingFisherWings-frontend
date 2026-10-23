import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VERIFICATION_DOC_KIND_LABELS } from '../api/partyVerification.api';
import {
  useStaffPartyVerification,
  useStaffPartyVerificationMutations,
} from '../hooks/usePartyVerification';
import { staffPartyVerificationService } from '../services/partyVerification.service';

interface StaffPartyVerificationPanelProps {
  partyId: string;
}

export function StaffPartyVerificationPanel({ partyId }: StaffPartyVerificationPanelProps) {
  const query = useStaffPartyVerification(partyId);
  const { approve, reject } = useStaffPartyVerificationMutations(partyId);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const status = String(query.data?.status || '').toUpperCase();
  const busy = approve.isPending || reject.isPending;

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      void query.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  if (query.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading verification…</p>;
  }

  if (query.isError) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {query.error instanceof Error
          ? query.error.message
          : 'Could not load party verification.'}
      </p>
    );
  }

  const state = query.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">
          Party verification (KYC)
        </h3>
        {state?.status ? (
          <Badge
            variant={
              status === 'APPROVED'
                ? 'success'
                : status === 'REJECTED'
                  ? 'danger'
                  : status === 'PENDING_REVIEW'
                    ? 'warning'
                    : 'neutral'
            }
            dot={false}
          >
            {String(state.status).replaceAll('_', ' ')}
          </Badge>
        ) : null}
      </div>

      <p className="text-xs text-[var(--color-neutral-500)]">
        Portal and vendor users for this party stay gated until you approve VAT certificate and
        business license.
      </p>

      {state?.rejectionReason ? (
        <p className="text-xs text-[var(--color-danger-600)]">
          Last rejection: {state.rejectionReason}
        </p>
      ) : null}

      <div className="space-y-2">
        {(state?.documents ?? []).length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No documents uploaded yet.</p>
        ) : (
          state?.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {VERIFICATION_DOC_KIND_LABELS[
                    doc.kind as keyof typeof VERIFICATION_DOC_KIND_LABELS
                  ] || doc.kind}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {doc.fileName || doc.id}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  void staffPartyVerificationService
                    .download(partyId, doc.id, doc.fileName || 'verification-doc')
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : 'Download failed.'),
                    )
                }
              >
                Download
              </Button>
            </div>
          ))
        )}
      </div>

      {status === 'PENDING_REVIEW' || status === 'REJECTED' || status === 'NOT_STARTED' ? (
        <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-3">
          <Input
            label="Approval notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Input
            label="Rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required when rejecting"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || !(state?.documents?.length)}
              onClick={() =>
                void run(
                  () => approve.mutateAsync(notes.trim() || undefined),
                  'Party verification approved — portal/vendor users unlocked.',
                )
              }
            >
              {approve.isPending ? 'Approving…' : 'Approve'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={busy || !reason.trim()}
              onClick={() =>
                void run(
                  () => reject.mutateAsync(reason.trim()),
                  'Verification rejected — party can re-upload.',
                )
              }
            >
              {reject.isPending ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
    </div>
  );
}

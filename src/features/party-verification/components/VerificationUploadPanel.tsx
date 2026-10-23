import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  REQUIRED_VERIFICATION_KINDS,
  VERIFICATION_DOC_KIND_LABELS,
  type VerificationDocKind,
} from '../api/partyVerification.api';
import type { PartyVerificationState } from '../types/partyVerification.types';

type Mutations = {
  upload: {
    mutateAsync: (args: { kind: string; file: File }) => Promise<unknown>;
    isPending: boolean;
  };
  remove: {
    mutateAsync: (documentId: string) => Promise<unknown>;
    isPending: boolean;
  };
  submit: {
    mutateAsync: () => Promise<unknown>;
    isPending: boolean;
  };
};

interface VerificationUploadPanelProps {
  state?: PartyVerificationState;
  isLoading?: boolean;
  mutations: Mutations;
  audienceLabel?: string;
  onApproved?: () => void;
  /** GET …/documents/:id/download — view/download an uploaded file. */
  onDownload?: (documentId: string, fileName?: string) => Promise<void>;
}

function statusVariant(
  status?: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = String(status || '').toUpperCase();
  if (s === 'APPROVED') return 'success';
  if (s === 'PENDING_REVIEW') return 'warning';
  if (s === 'REJECTED') return 'danger';
  if (s === 'NOT_STARTED') return 'neutral';
  return 'info';
}

export function VerificationUploadPanel({
  state,
  isLoading,
  mutations,
  audienceLabel = 'portal',
  onApproved,
  onDownload,
}: VerificationUploadPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [downloadBusyId, setDownloadBusyId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const status = String(state?.status || 'NOT_STARTED').toUpperCase();
  const approved = status === 'APPROVED' || state?.canUse === true;
  const pending = status === 'PENDING_REVIEW';
  const rejected = status === 'REJECTED';

  const requiredReady = REQUIRED_VERIFICATION_KINDS.every((kind) =>
    state?.documents.some((d) => String(d.kind).toUpperCase() === kind),
  );

  const busy =
    mutations.upload.isPending || mutations.remove.isPending || mutations.submit.isPending;

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMessage(null);
    try {
      const next = (await fn()) as PartyVerificationState | undefined;
      setMessage(success);
      if (next?.status === 'APPROVED' || next?.canUse) onApproved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading verification…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
          Company verification
        </h2>
        {state?.status ? (
          <Badge variant={statusVariant(state.status)} dot={false}>
            {String(state.status).replaceAll('_', ' ')}
          </Badge>
        ) : null}
      </div>

      <p className="text-sm text-[var(--color-neutral-600)]">
        Upload your <strong>VAT certificate</strong> and <strong>business license</strong> before
        using the {audienceLabel}. Your forwarder’s Tenant Admin must approve these documents —
        uploading alone does not unlock access.
      </p>

      {rejected && state?.rejectionReason ? (
        <div
          className="rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-sm text-[var(--color-danger-700)]"
          role="status"
        >
          Rejected: {state.rejectionReason}. Please upload corrected documents and submit again.
        </div>
      ) : null}

      {pending ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          Documents submitted and waiting for Tenant Admin approval. You can browse limited
          account settings, but quotes and bookings stay locked until approved.
        </div>
      ) : null}

      {approved ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Your company is verified. Full {audienceLabel} access is unlocked.
        </div>
      ) : null}

      <div className="space-y-3">
        {([...REQUIRED_VERIFICATION_KINDS, 'OTHER'] as VerificationDocKind[]).map((kind) => {
          const doc = state?.documents.find((d) => String(d.kind).toUpperCase() === kind);
          const label = VERIFICATION_DOC_KIND_LABELS[kind] || kind;
          const required = kind !== 'OTHER';
          return (
            <div
              key={kind}
              className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                    {label}
                    {required ? (
                      <span className="text-[var(--color-danger-600)]"> *</span>
                    ) : (
                      <span className="text-xs font-normal text-[var(--color-neutral-400)]">
                        {' '}
                        (optional)
                      </span>
                    )}
                  </p>
                  {doc ? (
                    <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                      Uploaded: {doc.fileName || doc.id}
                      {doc.uploadedAt ? ` · ${doc.uploadedAt}` : ''}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--color-neutral-400)]">Not uploaded yet</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc && onDownload ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={downloadBusyId === doc.id}
                      onClick={() => {
                        setError(null);
                        setDownloadBusyId(doc.id);
                        void onDownload(doc.id, doc.fileName || `${kind.toLowerCase()}.pdf`)
                          .catch((err) =>
                            setError(
                              err instanceof Error
                                ? err.message
                                : 'Could not download document.',
                            ),
                          )
                          .finally(() => setDownloadBusyId(null));
                      }}
                    >
                      {downloadBusyId === doc.id ? 'Opening…' : 'View / download'}
                    </Button>
                  ) : null}
                  {!approved ? (
                    <>
                      <input
                        ref={(el) => {
                          fileRefs.current[kind] = el;
                        }}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          void run(
                            () => mutations.upload.mutateAsync({ kind, file }),
                            `${label} uploaded.`,
                          );
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => fileRefs.current[kind]?.click()}
                      >
                        {doc ? 'Replace' : 'Upload'}
                      </Button>
                      {doc && status !== 'PENDING_REVIEW' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => mutations.remove.mutateAsync(doc.id),
                              `${label} removed.`,
                            )
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--color-success-700)]" role="status">
          {message}
        </p>
      ) : null}

      {!approved ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            disabled={busy || !requiredReady || pending}
            onClick={() =>
              void run(
                () => mutations.submit.mutateAsync(),
                'Submitted for Tenant Admin review.',
              )
            }
          >
            {mutations.submit.isPending
              ? 'Submitting…'
              : pending
                ? 'Awaiting approval'
                : 'Submit for review'}
          </Button>
          {!requiredReady ? (
            <p className="self-center text-xs text-[var(--color-neutral-500)]">
              Both VAT certificate and business license are required before submit.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

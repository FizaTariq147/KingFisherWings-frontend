import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from '@/features/glPayments/constants/glPayment.constants';
import { glPaymentKeys } from '@/features/glPayments/hooks/useGlPayments';
import {
  isBankOrCashGlAccount,
  useGlAccountSelectOptions,
} from '@/features/chartOfAccounts/hooks/useGlAccountSelectOptions';
import { useBankAccounts } from '@/features/organization/hooks/useBankAccounts';
import { isUuid } from '@/lib/isUuid';
import {
  purchaseInvoiceKeys,
  usePurchaseInvoice,
  usePurchaseInvoicePaymentProofs,
  useUploadPurchaseInvoicePaymentProof,
} from '@/features/purchaseInvoices/hooks/usePurchaseInvoices';
import type { PaymentProof } from '../types/paymentProof.types';
import { useReviewPaymentProof } from '../hooks/usePaymentProofs';
import { applyPurchaseInvoiceProofViaGlPayment } from '../utils/applyPurchaseInvoiceProofViaGlPayment';
import {
  formatPaymentProofActionError,
  isApproveHttp500Message,
} from '../utils/formatPaymentProofActionError';
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

function formatProofDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return m?.[1] ?? value.trim();
}

function needsBankAccount(method: PaymentMethod): boolean {
  // CASH can post without a bank GL account; other methods need one for Approve & apply.
  return method !== 'CASH';
}

interface StaffPurchaseInvoicePaymentProofPanelProps {
  purchaseInvoiceId: string;
  currencyCode?: string;
  remainingAmount?: number;
  /** Invoice status — remittance proofs usually apply after POSTED. */
  invoiceStatus?: string;
}

/**
 * Admin-side payment proofs for purchase invoices (AP).
 * Vendors post invoices; staff upload / review proofs here.
 */
export function StaffPurchaseInvoicePaymentProofPanel({
  purchaseInvoiceId,
  currencyCode,
  remainingAmount,
  invoiceStatus,
}: StaffPurchaseInvoicePaymentProofPanelProps) {
  const { hasPermission } = useAuth();
  const canReview = hasPermission('invoices.review_payment_proofs');
  const queryClient = useQueryClient();
  const { data: invoice } = usePurchaseInvoice(purchaseInvoiceId);
  const {
    data: proofs = [],
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = usePurchaseInvoicePaymentProofs(purchaseInvoiceId);
  const upload = useUploadPurchaseInvoicePaymentProof(purchaseInvoiceId);
  const review = useReviewPaymentProof(purchaseInvoiceId, 'purchase-invoice');
  const { data: bankData } = useBankAccounts({ page: 1, limit: 100 });
  const { accounts: glAccounts } = useGlAccountSelectOptions(true);
  const glById = useMemo(() => {
    const map = new Map<string, (typeof glAccounts)[number]>();
    for (const a of glAccounts) map.set(a.id, a);
    return map;
  }, [glAccounts]);

  const bankOpts = useMemo(
    () =>
      (bankData?.accounts ?? [])
        .filter((a) => isUuid(a.id) && a.is_active !== false)
        .map((a) => {
          const glId = a.gl_account_id && isUuid(a.gl_account_id) ? a.gl_account_id : '';
          const gl = glId ? glById.get(glId) : undefined;
          const hasGl = Boolean(glId);
          const glIsBankCash = gl ? isBankOrCashGlAccount(gl) : false;
          const glLabel = gl
            ? [gl.account_code, gl.account_name].filter(Boolean).join(' ')
            : glId
              ? 'unknown GL'
              : '';
          const base = [a.account_name, a.bank_name, a.account_number]
            .filter(Boolean)
            .join(' — ');
          let suffix = '';
          if (!hasGl) suffix = ' (no GL link)';
          else if (!glIsBankCash)
            suffix = ` (bad GL: ${glLabel || 'not Bank/Cash'} — fix in Bank accounts)`;
          else if (glLabel) suffix = ` → ${glLabel}`;
          return {
            id: a.id,
            hasGl,
            glId,
            glIsBankCash,
            suitable: hasGl && glIsBankCash,
            label: `${base}${suffix}`,
          };
        }),
    [bankData?.accounts, glById],
  );

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, PaymentMethod>>({});
  const [bankAccounts, setBankAccounts] = useState<Record<string, string>>({});
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
      setError(formatPaymentProofActionError(err));
    }
  };

  const status = String(invoice?.status ?? invoiceStatus ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const likelyNeedsPost =
    status === 'DRAFT' || status === 'SUBMITTED' || status === 'PENDING';

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-neutral-500)]">
        Vendor portal and staff remittance proofs for this purchase invoice appear here. Open or
        download the file, then approve or reject. Approve posts a GL payment — pick the bank
        account when using bank transfer.
      </p>
      {likelyNeedsPost ? (
        <p className="text-xs text-[var(--color-warning-700,#a16207)]">
          This purchase invoice is still {status || 'DRAFT'}. Post it first — remittance proofs
          usually apply only to posted AP invoices.
        </p>
      ) : null}

      <PaymentProofUploadForm
        disabled={upload.isPending || likelyNeedsPost}
        currencyCode={currencyCode}
        remainingAmount={remainingAmount}
        onUpload={async (file, dto) => {
          if (likelyNeedsPost) {
            throw new Error(
              `Post this purchase invoice first (status is ${status || 'DRAFT'}).`,
            );
          }
          await upload.mutateAsync({ file, dto });
          void refetch();
        }}
      />

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      {isError ? (
        <div className="space-y-1">
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {formatPaymentProofActionError(
              loadError,
              'Could not load payment proofs for this purchase invoice.',
            )}
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
              invoiceNeedsPost={likelyNeedsPost}
              notes={notes[proof.id] || ''}
              paymentMethod={methods[proof.id] || 'BANK_TRANSFER'}
              bankAccountId={bankAccounts[proof.id] || ''}
              bankOpts={bankOpts}
              onNotesChange={(value) => setNotes((prev) => ({ ...prev, [proof.id]: value }))}
              onMethodChange={(value) => setMethods((prev) => ({ ...prev, [proof.id]: value }))}
              onBankAccountChange={(value) =>
                setBankAccounts((prev) => ({ ...prev, [proof.id]: value }))
              }
              onApprove={() => {
                if (likelyNeedsPost) {
                  setError(
                    `Post this purchase invoice first (status is ${status || 'DRAFT'}). Approve & apply posts a GL payment and needs a posted AP invoice.`,
                  );
                  return;
                }
                const method = methods[proof.id] || 'BANK_TRANSFER';
                const bankId = bankAccounts[proof.id]?.trim() || '';
                if (needsBankAccount(method) && !isUuid(bankId)) {
                  setError(
                    'Select the bank account this remittance was paid from before Approve & apply.',
                  );
                  return;
                }
                const bankOpt = bankOpts.find((b) => b.id === bankId);
                if (needsBankAccount(method) && bankOpt && !bankOpt.suitable) {
                  setError(
                    bankOpt.hasGl && !bankOpt.glIsBankCash
                      ? 'That bank account is linked to the wrong GL ledger (e.g. Trade Receivables). Edit Organization → Bank accounts and link a Bank/Cash COA account, then retry Approve.'
                      : 'That bank account has no linked GL bank/cash ledger. Edit Organization → Bank accounts, set GL bank / cash account, then retry Approve.',
                  );
                  return;
                }
                const reviewNotes = notes[proof.id]?.trim() || undefined;
                const bankGlOk = Boolean(bankOpt?.suitable) || method === 'CASH';
                void (async () => {
                  setError(null);
                  setMessage(null);
                  try {
                    try {
                      await review.approve.mutateAsync({
                        id: proof.id,
                        dto: {
                          payment_method: method,
                          ...(isUuid(bankId) ? { bank_account_id: bankId } : {}),
                          ...(reviewNotes ? { review_notes: reviewNotes } : {}),
                        },
                      });
                      setMessage(
                        proof.amount != null
                          ? `Proof approved. ${proof.amount} applied to purchase invoice.`
                          : 'Payment proof approved.',
                      );
                    } catch (approveErr) {
                      if (!isApproveHttp500Message(approveErr) || !invoice || !isUuid(invoice.id)) {
                        throw new Error(
                          formatPaymentProofActionError(approveErr, undefined, { bankGlOk }),
                        );
                      }
                      if (!isUuid(invoice.party_id)) {
                        throw new Error(
                          formatPaymentProofActionError(approveErr, undefined, { bankGlOk }) +
                            ' Invoice has no vendor party_id for GL payment fallback.',
                        );
                      }
                      const { paymentId } = await applyPurchaseInvoiceProofViaGlPayment({
                        invoice,
                        proof,
                        paymentMethod: method,
                        bankAccountId: bankId,
                        glAccountId: bankOpt?.glId,
                        reviewNotes,
                      });
                      await review.acknowledge.mutateAsync({
                        id: proof.id,
                        dto: {
                          review_notes:
                            reviewNotes ||
                            `Payment recorded (GL ${paymentId}); proof acknowledged.`,
                        },
                      });
                      void queryClient.invalidateQueries({ queryKey: glPaymentKeys.all });
                      void queryClient.invalidateQueries({
                        queryKey: purchaseInvoiceKeys.detail(purchaseInvoiceId),
                      });
                      setMessage(
                        proof.amount != null
                          ? `Payment of ${proof.amount} recorded and proof acknowledged.`
                          : 'Payment recorded and proof acknowledged.',
                      );
                    }
                    void refetch();
                  } catch (err) {
                    setError(formatPaymentProofActionError(err, undefined, { bankGlOk }));
                  }
                })();
              }}
              onAcknowledge={() =>
                void run(
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
                void run(
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
  invoiceNeedsPost,
  notes,
  paymentMethod,
  bankAccountId,
  bankOpts,
  onNotesChange,
  onMethodChange,
  onBankAccountChange,
  onApprove,
  onAcknowledge,
  onReject,
  busy,
}: {
  proof: PaymentProof;
  canReview: boolean;
  invoiceNeedsPost: boolean;
  notes: string;
  paymentMethod: PaymentMethod;
  bankAccountId: string;
  bankOpts: Array<{
    id: string;
    label: string;
    hasGl: boolean;
    glId?: string;
    glIsBankCash: boolean;
    suitable: boolean;
  }>;
  onNotesChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod) => void;
  onBankAccountChange: (value: string) => void;
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
  const showBank = canApprove && needsBankAccount(paymentMethod);

  return (
    <div className="space-y-2 rounded-md bg-[var(--color-neutral-50)] px-3 py-3 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{proof.fileName || proof.reference || proof.id}</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {[
              formatProofDate(proof.paymentDate),
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
          <PaymentProofOpenButton proof={proof} viewer="staff" showDownload />
        </div>
      </div>
      {proof.notes ? (
        <p className="text-xs text-[var(--color-neutral-600)]">Notes: {proof.notes}</p>
      ) : null}
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
          {showBank ? (
            <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
              Bank account (paid from) *
              <select
                className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                value={bankAccountId}
                onChange={(e) => onBankAccountChange(e.target.value)}
              >
                <option value="">
                  {bankOpts.length ? 'Select bank account…' : 'No bank accounts — add under Organization'}
                </option>
                {bankOpts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] font-normal text-[var(--color-neutral-400)]">
                Pick an account whose GL is Bank/Cash. “Trade Receivables” (or “bad GL”) will be
                blocked — fix the link under Organization → Bank accounts.
              </span>
            </label>
          ) : null}
          <Input
            placeholder="Review notes (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {canApprove ? (
              <Button
                type="button"
                size="sm"
                disabled={
                  busy ||
                  invoiceNeedsPost ||
                  (showBank &&
                    (!isUuid(bankAccountId) ||
                      !bankOpts.find((b) => b.id === bankAccountId)?.suitable))
                }
                title={
                  invoiceNeedsPost
                    ? 'Post the purchase invoice before approving this proof'
                    : undefined
                }
                onClick={onApprove}
              >
                Approve &amp; apply
              </Button>
            ) : null}
            {canApprove && invoiceNeedsPost ? (
              <p className="w-full text-xs text-[var(--color-warning-700,#a16207)]">
                Post this purchase invoice first, then Approve &amp; apply.
              </p>
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

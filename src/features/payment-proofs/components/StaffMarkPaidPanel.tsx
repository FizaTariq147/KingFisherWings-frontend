import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { pickValidatedUploadFile, PAYMENT_PROOF_UPLOAD_OPTIONS } from '@/lib/fileUploadValidation';
import { useMarkInvoicePaid } from '../hooks/usePaymentProofs';
import type { MarkPaidNeedsInvoiceError } from '../types/paymentProof.types';
import { formatPaymentProofActionError } from '../utils/formatPaymentProofActionError';

interface StaffMarkPaidPanelProps {
  invoiceId: string;
  remainingAmount?: number;
  currencyCode?: string;
  disabled?: boolean;
}

function todayLocalYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Staff mark-paid: POST /invoices/:id/mark-paid (multipart).
 * Proof file is mandatory — without it the line stays unpaid. Posts RECEIPT.
 */
export function StaffMarkPaidPanel({
  invoiceId,
  remainingAmount,
  currencyCode,
  disabled,
}: StaffMarkPaidPanelProps) {
  const markPaid = useMarkInvoicePaid(invoiceId);
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState(
    remainingAmount != null && remainingAmount > 0 ? String(remainingAmount) : '',
  );
  const [paymentDate, setPaymentDate] = useState(todayLocalYmd());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [needsInvoiceJobId, setNeedsInvoiceJobId] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setMessage(null);
    setNeedsInvoiceJobId(null);
    if (!file) {
      setError('A payment proof file is required to mark paid.');
      return;
    }
    const amountValue = amount.trim() ? Number(amount.trim()) : undefined;
    if (amountValue != null && (!Number.isFinite(amountValue) || amountValue <= 0)) {
      setError('Amount must be a positive number.');
      return;
    }
    if (
      amountValue != null &&
      remainingAmount != null &&
      Number.isFinite(remainingAmount) &&
      amountValue > remainingAmount + 0.0001
    ) {
      setError(`Amount cannot exceed the remaining balance (${remainingAmount}).`);
      return;
    }
    try {
      await markPaid.mutateAsync({
        file,
        dto: {
          ...(amountValue != null ? { amount: amountValue } : {}),
          ...(paymentDate.trim() ? { payment_date: paymentDate.trim().slice(0, 10) } : {}),
          ...(reference.trim() ? { reference: reference.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      });
      setMessage('Marked paid — proof saved and RECEIPT posted.');
      setFile(null);
      setReference('');
      setNotes('');
    } catch (err) {
      const needs = err as MarkPaidNeedsInvoiceError;
      if (needs?.code === 'needs_invoice') {
        setError(needs.message || 'Generate a sale invoice from costing before marking paid.');
        setNeedsInvoiceJobId(needs.job_id ?? null);
        return;
      }
      setError(formatPaymentProofActionError(err, 'Could not mark invoice paid.'));
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
      <p className="text-sm font-medium text-[var(--color-neutral-800)]">Mark paid</p>
      <p className="text-xs text-[var(--color-neutral-500)]">
        Uploads payment proof and posts a RECEIPT. Proof alone (via payment-proofs) does not change
        balances — use this action to settle.
        {remainingAmount != null && Number.isFinite(remainingAmount)
          ? ` Remaining ${remainingAmount.toLocaleString()}${currencyCode ? ` ${currencyCode}` : ''}.`
          : ''}
      </p>
      <Input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          const { file: picked, error: fileError } = pickValidatedUploadFile(
            e.target.files,
            PAYMENT_PROOF_UPLOAD_OPTIONS,
          );
          setFile(picked);
          setError(fileError ?? null);
          e.target.value = '';
        }}
      />
      {file ? (
        <p className="text-xs text-[var(--color-neutral-500)]">Attached: {file.name}</p>
      ) : (
        <p className="text-xs text-[var(--color-danger-600)]">Proof file required</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label="Amount"
          placeholder="e.g. 100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          label="Payment date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
        <Input
          placeholder="Bank reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="sm:col-span-2"
        />
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="sm:col-span-2"
        />
      </div>
      {error ? <p className="text-xs text-[var(--color-danger-600)]">{error}</p> : null}
      {needsInvoiceJobId ? (
        <a
          href={`/jobs/${needsInvoiceJobId}?tab=costing`}
          className="text-xs text-[var(--color-primary-600)] hover:underline"
        >
          Open job costing to generate sale invoice →
        </a>
      ) : null}
      {message ? <p className="text-xs text-[var(--color-success-700)]">{message}</p> : null}
      <Button
        type="button"
        size="sm"
        disabled={disabled || markPaid.isPending || !file}
        onClick={() => void submit()}
      >
        {markPaid.isPending ? 'Marking paid…' : 'Mark paid'}
      </Button>
    </div>
  );
}

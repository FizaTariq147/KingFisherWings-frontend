import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { pickValidatedUploadFile, PAYMENT_PROOF_UPLOAD_OPTIONS } from '@/lib/fileUploadValidation';
import type { PaymentProof, UploadPaymentProofDto } from '../types/paymentProof.types';
import { Badge } from '@/components/ui/Badge';
import { PaymentProofOpenButton } from './PaymentProofOpenButton';
import type { PaymentProofViewer } from '../utils/openPaymentProofFile';

interface PaymentProofUploadFormProps {
  onUpload: (file: File, dto: UploadPaymentProofDto) => Promise<void>;
  disabled?: boolean;
  /** Prefill currency from the open invoice when known. */
  currencyCode?: string;
  /** Remaining balance still due — amount claimed cannot exceed this. */
  remainingAmount?: number;
}

export function PaymentProofUploadForm({
  onUpload,
  disabled,
  currencyCode,
  remainingAmount,
}: PaymentProofUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const amountRaw = amount.trim();
      if (!amountRaw) {
        setError('Enter the amount paid for this proof.');
        setPending(false);
        return;
      }
      const amountValue = Number(amountRaw);
      if (!Number.isFinite(amountValue) || amountValue <= 0) {
        setError('Amount must be a positive number.');
        setPending(false);
        return;
      }
      if (
        remainingAmount != null &&
        Number.isFinite(remainingAmount) &&
        amountValue > remainingAmount + 0.0001
      ) {
        setError(
          `Amount cannot exceed the remaining balance (${remainingAmount}).`,
        );
        setPending(false);
        return;
      }
      const dto: UploadPaymentProofDto = {
        amount: amountValue,
        ...(paymentDate ? { payment_date: paymentDate } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(currencyCode?.trim() ? { currency_code: currencyCode.trim() } : {}),
      };
      await onUpload(file, dto);
      setMessage(
        remainingAmount != null && amountValue < remainingAmount
          ? `Proof uploaded for ${amountValue}. Remaining due will show as ${(remainingAmount - amountValue).toLocaleString()}.`
          : 'Payment proof uploaded.',
      );
      setFile(null);
      setAmount('');
      setPaymentDate('');
      setReference('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
      <p className="text-sm font-medium text-[var(--color-neutral-800)]">Upload payment proof</p>
      {remainingAmount != null && Number.isFinite(remainingAmount) ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Remaining balance: {remainingAmount.toLocaleString()}
          {currencyCode ? ` ${currencyCode}` : ''}. Enter the amount you paid
          (partial payments are allowed).
        </p>
      ) : null}
      <Input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          const { file, error: fileError } = pickValidatedUploadFile(
            e.target.files,
            PAYMENT_PROOF_UPLOAD_OPTIONS,
          );
          setFile(file);
          setError(fileError ?? null);
          e.target.value = '';
        }}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label="Amount claimed"
          placeholder="e.g. 100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
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
      {message ? <p className="text-xs text-[var(--color-success-700)]">{message}</p> : null}
      <Button type="button" size="sm" disabled={disabled || pending || !file} onClick={() => void submit()}>
        {pending ? 'Uploading…' : 'Upload proof'}
      </Button>
    </div>
  );
}

export function PaymentProofList({
  proofs,
  onSendEmail,
  onDownload,
  downloadingProofId,
  sendingProofId,
  viewer = 'portal',
}: {
  proofs: PaymentProof[];
  onSendEmail?: (proof: PaymentProof) => void;
  /** Explicit download (e.g. portal invoice proof file API). When omitted, open/view uses stored file URL. */
  onDownload?: (proof: PaymentProof) => void;
  downloadingProofId?: string | null;
  sendingProofId?: string | null;
  /** Auth context for opening stored files (portal customer vs vendor vs staff). */
  viewer?: PaymentProofViewer;
}) {
  if (proofs.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-400)]">No payment proofs yet.</p>;
  }
  return (
    <div className="space-y-2">
      {proofs.map((proof) => (
        <div
          key={proof.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-100)] px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <p className="font-medium">{proof.fileName || proof.reference || 'Proof'}</p>
            <p className="text-xs text-[var(--color-neutral-500)]">
              {[proof.paymentDate, proof.amount != null ? String(proof.amount) : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {proof.status ? (
              <Badge variant="neutral" dot={false}>
                {proof.status.replaceAll('_', ' ')}
              </Badge>
            ) : null}
            {onDownload ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={downloadingProofId === proof.id}
                onClick={() => onDownload(proof)}
              >
                {downloadingProofId === proof.id ? 'Downloading…' : 'Download'}
              </Button>
            ) : (
              <PaymentProofOpenButton proof={proof} viewer={viewer} />
            )}
            {onSendEmail ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={sendingProofId === proof.id}
                onClick={() => onSendEmail(proof)}
              >
                {sendingProofId === proof.id ? 'Sending…' : 'Email'}
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

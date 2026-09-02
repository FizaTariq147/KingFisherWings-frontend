import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { PaymentProof, UploadPaymentProofDto } from '../types/paymentProof.types';
import { Badge } from '@/components/ui/Badge';

interface PaymentProofUploadFormProps {
  onUpload: (file: File, dto: UploadPaymentProofDto) => Promise<void>;
  disabled?: boolean;
}

export function PaymentProofUploadForm({ onUpload, disabled }: PaymentProofUploadFormProps) {
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
      const dto: UploadPaymentProofDto = {
        ...(amount.trim() ? { amount: Number(amount) } : {}),
        ...(paymentDate ? { payment_date: paymentDate } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      await onUpload(file, dto);
      setMessage('Payment proof uploaded.');
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
      <Input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="Amount paid" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
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

export function PaymentProofList({ proofs }: { proofs: PaymentProof[] }) {
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
          <div>
            <p className="font-medium">{proof.fileName || proof.reference || 'Proof'}</p>
            <p className="text-xs text-[var(--color-neutral-500)]">
              {[proof.paymentDate, proof.amount != null ? String(proof.amount) : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          {proof.status ? (
            <Badge variant="neutral" dot={false}>
              {proof.status.replaceAll('_', ' ')}
            </Badge>
          ) : null}
        </div>
      ))}
    </div>
  );
}

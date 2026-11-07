import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { pickValidatedUploadFile, PAYMENT_PROOF_UPLOAD_OPTIONS } from '@/lib/fileUploadValidation';
import { jobService } from '@/features/jobs/services/job.service';
import type { PendingJobChargeLine } from '../../types/arApAging.types';

interface PendingJobChargesTableProps {
  charges: PendingJobChargeLine[];
  /** AR shows SALE; AP shows COST. */
  statementSide?: 'AR' | 'AP';
  onMarkedPaid?: () => void;
}

function amountFor(c: PendingJobChargeLine): number | undefined {
  return c.amount ?? (c.side === 'COST' ? c.cost_amount : c.sale_amount);
}

function MarkChargePaidCell({
  charge,
  defaultSide,
  onDone,
}: {
  charge: PendingJobChargeLine;
  defaultSide: 'SALE' | 'COST';
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!charge.job_id) {
    return <span className="text-xs text-[var(--color-neutral-400)]">No job</span>;
  }

  const submit = async () => {
    setError(null);
    setMessage(null);
    if (!file) {
      setError('Proof file is required.');
      return;
    }
    setPending(true);
    try {
      await jobService.markChargePaid(charge.job_id!, charge.charge_id, file, {
        side: charge.side ?? defaultSide,
        amount: amountFor(charge),
      });
      setMessage('Marked paid.');
      setFile(null);
      setOpen(false);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark charge paid.');
    } finally {
      setPending(false);
    }
  };

  if (!open) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Mark paid
      </Button>
    );
  }

  return (
    <div className="min-w-[200px] space-y-1.5">
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
      {file ? <p className="text-[11px] text-[var(--color-neutral-500)]">{file.name}</p> : null}
      {error ? <p className="text-[11px] text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-[11px] text-emerald-700">{message}</p> : null}
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" disabled={pending || !file} onClick={() => void submit()}>
          {pending ? '…' : 'Confirm'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setFile(null);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function PendingJobChargesTable({
  charges,
  statementSide = 'AR',
  onMarkedPaid,
}: PendingJobChargesTableProps) {
  const defaultSide = statementSide === 'AP' ? 'COST' : 'SALE';
  const amountLabel = statementSide === 'AP' ? 'Cost amount' : 'Sale amount';

  return (
    <Table className="min-w-[860px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Job</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>{amountLabel}</TableHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Mark paid</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-[var(--color-neutral-400)] py-8">
              No uninvoiced pending job charges
            </TableCell>
          </TableRow>
        ) : (
          charges.map((c) => {
            const amt = amountFor(c);
            return (
              <TableRow key={`${c.charge_id}-${c.side ?? defaultSide}`}>
                <TableCell>
                  {c.job_id ? (
                    <Link
                      to={`/jobs/${c.job_id}?tab=costing`}
                      className="text-[var(--color-primary-600)] hover:underline"
                    >
                      {c.job_number || c.job_id.slice(0, 8)}
                    </Link>
                  ) : (
                    c.job_number || '—'
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium uppercase text-[var(--color-neutral-600)]">
                    {c.side ?? defaultSide}
                  </span>
                </TableCell>
                <TableCell>{c.description || '—'}</TableCell>
                <TableCell mono>
                  {amt != null
                    ? `${c.currency_code || ''} ${amt.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
                <TableCell>
                  {c.needs_invoice ? (
                    <span className="inline-flex rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                      Needs invoice
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--color-neutral-400)]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <MarkChargePaidCell
                    charge={c}
                    defaultSide={defaultSide}
                    onDone={onMarkedPaid}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { isUuid } from '@/lib/isUuid';
import { BANK_RECON_ROUTE_PREFIX } from '../api/bankReconciliation.api';
import { BANK_RECON_STATUS_LABELS } from '../constants/bankReconciliation.constants';
import {
  useAddReconciliationLine,
  useBankReconciliation,
  useBankReconciliationUnmatched,
  useCancelBankReconciliation,
  useCompleteBankReconciliation,
  useRemoveReconciliationLine,
} from '../hooks/useBankReconciliation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function BankReconciliationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useBankReconciliation(id);
  const { data: unmatched } = useBankReconciliationUnmatched(id);
  const addLine = useAddReconciliationLine(id);
  const removeLine = useRemoveReconciliationLine(id);
  const cancel = useCancelBankReconciliation();
  const complete = useCompleteBankReconciliation(id);
  const [txnDate, setTxnDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [statementRef, setStatementRef] = useState('');
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');
  const [voucherId, setVoucherId] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        <button type="button" className="underline text-sm" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const draft = data.status === 'DRAFT';

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(BANK_RECON_ROUTE_PREFIX)}
      >
        ← Back to reconciliations
      </button>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Reconciliation {data.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)]">
            {BANK_RECON_STATUS_LABELS[data.status]} · Statement {data.statement_date || '—'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!window.confirm('Cancel this draft reconciliation?')) return;
                  await cancel.mutateAsync(id);
                  navigate(BANK_RECON_ROUTE_PREFIX);
                }}
              >
                Cancel draft
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  await complete.mutateAsync();
                  refetch();
                }}
              >
                Complete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-sm">Statement balance: <span className="font-semibold">{Number(data.statement_balance ?? 0).toLocaleString()}</span></div>
        <div className="text-sm">Computed balance: <span className="font-semibold">{Number(data.computed_balance ?? 0).toLocaleString()}</span></div>
        <div className="text-sm">Difference: <span className="font-semibold">{Number(data.difference ?? 0).toLocaleString()}</span></div>
      </Card>

      {draft ? (
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-[var(--color-neutral-800)]">Add statement line</h3>
          {errorText ? <p className="text-sm text-[var(--color-danger-600)]">{errorText}</p> : null}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Txn date *" type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
            <Input label="Statement ref" value={statementRef} onChange={(e) => setStatementRef(e.target.value)} />
            <Input label="Voucher ID" value={voucherId} onChange={(e) => setVoucherId(e.target.value)} />
            <Input label="Debit amount" type="number" value={debit} onChange={(e) => setDebit(e.target.value)} />
            <Input label="Credit amount" type="number" value={credit} onChange={(e) => setCredit(e.target.value)} />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button
            type="button"
            onClick={async () => {
              setErrorText(null);
              if (!txnDate.trim()) {
                setErrorText('Txn date is required.');
                return;
              }
              try {
                await addLine.mutateAsync({
                  txn_date: txnDate,
                  description: description.trim() || undefined,
                  statement_ref: statementRef.trim() || undefined,
                  voucher_id: isUuid(voucherId) ? voucherId : undefined,
                  debit_amount: debit.trim() ? Number(debit) : undefined,
                  credit_amount: credit.trim() ? Number(credit) : undefined,
                  is_matched: true,
                });
                setDescription('');
                setStatementRef('');
                setVoucherId('');
                setDebit('');
                setCredit('');
                refetch();
              } catch (e) {
                setErrorText(getErrorMessage(e));
              }
            }}
          >
            Add line
          </Button>
        </Card>
      ) : null}

      <Card className="p-4">
        <h3 className="font-medium text-[var(--color-neutral-800)] mb-3">Lines</h3>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Matched</TableHead>
              <TableHead>Statement Ref</TableHead>
              {draft ? <TableHead>{' '}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.lines ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={draft ? 7 : 6} className="py-8 text-center text-[var(--color-neutral-400)]">
                  No lines
                </TableCell>
              </TableRow>
            ) : (
              (data.lines ?? []).map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.txn_date || '—'}</TableCell>
                  <TableCell>{line.description || '—'}</TableCell>
                  <TableCell mono>{line.debit_amount.toLocaleString()}</TableCell>
                  <TableCell mono>{line.credit_amount.toLocaleString()}</TableCell>
                  <TableCell>{line.is_matched ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{line.statement_ref || '—'}</TableCell>
                  {draft ? (
                    <TableCell>
                      <button
                        type="button"
                        className="text-xs text-[var(--color-danger-600)]"
                        onClick={async () => {
                          await removeLine.mutateAsync(line.id);
                          refetch();
                        }}
                      >
                        Remove
                      </button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-[var(--color-neutral-800)] mb-2">Unmatched GL lines</h3>
        <p className="text-sm text-[var(--color-neutral-500)]">
          {(unmatched ?? []).length} unmatched entries returned by API.
        </p>
      </Card>
    </div>
  );
}

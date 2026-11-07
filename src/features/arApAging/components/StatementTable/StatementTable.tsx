import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { StatementLine } from '../../types/arApAging.types';

interface StatementTableProps {
  lines: StatementLine[];
  currencyCode?: string;
}

function paymentStatusLabel(status?: string): string {
  if (!status) return '—';
  const s = status.toUpperCase();
  if (s === 'PAID') return 'Paid';
  if (s === 'PROOF_UPLOADED') return 'Proof uploaded';
  if (s === 'UNPAID') return 'Unpaid';
  return status;
}

function paymentStatusTagClass(status?: string): string {
  const s = status?.toUpperCase();
  if (s === 'PAID') {
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200';
  }
  if (s === 'PROOF_UPLOADED') {
    return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200';
  }
  if (s === 'UNPAID') {
    return 'bg-red-50 text-[var(--color-danger-700)] ring-1 ring-inset ring-red-200';
  }
  return 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)]';
}

export function StatementTable({ lines, currencyCode }: StatementTableProps) {
  return (
    <Table className="min-w-[980px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Debit</TableHead>
          <TableHead>Credit</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
              No statement lines
            </TableCell>
          </TableRow>
        ) : (
          lines.map((line, idx) => {
            const invoiceId =
              typeof line.document_id === 'string' && line.document_id
                ? line.document_id
                : undefined;
            const isInvoice =
              Boolean(invoiceId) &&
              /invoice|sale|ar/i.test(String(line.type ?? line.reference ?? ''));
            return (
              <TableRow key={line.id || `${line.reference}-${idx}`}>
                <TableCell>{line.date || '—'}</TableCell>
                <TableCell>{line.type || '—'}</TableCell>
                <TableCell mono>
                  {isInvoice && invoiceId ? (
                    <Link
                      to={`/invoices/${invoiceId}`}
                      className="text-[var(--color-primary-600)] hover:underline"
                    >
                      {line.reference || line.document_number || invoiceId.slice(0, 8)}
                    </Link>
                  ) : (
                    line.reference || line.document_number || '—'
                  )}
                </TableCell>
                <TableCell>{line.description || '—'}</TableCell>
                <TableCell>
                  {line.payment_status ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${paymentStatusTagClass(line.payment_status)}`}
                    >
                      {paymentStatusLabel(line.payment_status)}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-neutral-400)]">—</span>
                  )}
                </TableCell>
                <TableCell mono>
                  {line.debit
                    ? `${currencyCode || ''} ${line.debit.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
                <TableCell mono>
                  {line.credit
                    ? `${currencyCode || ''} ${line.credit.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
                <TableCell mono>
                  {line.balance != null
                    ? `${currencyCode || ''} ${line.balance.toLocaleString()}`.trim()
                    : '—'}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

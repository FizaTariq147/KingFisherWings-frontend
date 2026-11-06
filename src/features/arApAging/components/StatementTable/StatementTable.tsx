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

function paymentStatusClass(status?: string): string {
  const s = status?.toUpperCase();
  if (s === 'PAID') return 'text-emerald-700';
  if (s === 'PROOF_UPLOADED') return 'text-amber-700';
  if (s === 'UNPAID') return 'text-[var(--color-danger-600)]';
  return 'text-[var(--color-neutral-500)]';
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
                  <span className={`text-xs font-medium ${paymentStatusClass(line.payment_status)}`}>
                    {paymentStatusLabel(line.payment_status)}
                  </span>
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

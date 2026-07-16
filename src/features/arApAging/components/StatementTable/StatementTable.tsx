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

export function StatementTable({ lines, currencyCode }: StatementTableProps) {
  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Debit</TableHead>
          <TableHead>Credit</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
              No statement lines
            </TableCell>
          </TableRow>
        ) : (
          lines.map((line, idx) => (
            <TableRow key={line.id || `${line.reference}-${idx}`}>
              <TableCell>{line.date || '—'}</TableCell>
              <TableCell>{line.type || '—'}</TableCell>
              <TableCell mono>{line.reference || line.document_number || '—'}</TableCell>
              <TableCell>{line.description || '—'}</TableCell>
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
          ))
        )}
      </TableBody>
    </Table>
  );
}

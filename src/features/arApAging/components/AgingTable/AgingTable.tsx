import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { AGING_BUCKET_LABELS } from '../../constants/arApAging.constants';
import type { AgingLine } from '../../types/arApAging.types';

interface AgingTableProps {
  lines: AgingLine[];
  totals?: AgingLine;
  onOpenStatement?: (line: AgingLine) => void;
}

function fmt(n: number, currency?: string) {
  const value = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${value}` : value;
}

export function AgingTable({ lines, totals, onOpenStatement }: AgingTableProps) {
  const buckets = [
    'current',
    'days_1_30',
    'days_31_60',
    'days_61_90',
    'days_over_90',
    'total',
  ] as const;

  return (
    <Table className="min-w-[960px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Party</TableHead>
          {buckets.map((key) => (
            <TableHead key={key}>{AGING_BUCKET_LABELS[key]}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
              No aging data
            </TableCell>
          </TableRow>
        ) : (
          <>
            {lines.map((line, idx) => (
              <TableRow key={line.party_id || `${line.party_name}-${idx}`}>
                <TableCell>
                  {line.party_id && onOpenStatement ? (
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => onOpenStatement(line)}
                    >
                      {line.party_name || line.party_code || line.party_id.slice(0, 8)}
                    </button>
                  ) : (
                    <span>
                      {line.party_name || line.party_code || line.party_id || '—'}
                    </span>
                  )}
                  {line.party_code ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">{line.party_code}</div>
                  ) : null}
                </TableCell>
                {buckets.map((key) => (
                  <TableCell key={key}>
                    {fmt(line[key], line.currency_code)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {totals ? (
              <TableRow className="bg-[var(--color-neutral-50)]">
                <TableCell>{totals.party_name || 'Totals'}</TableCell>
                {buckets.map((key) => (
                  <TableCell key={key}>
                    {fmt(totals[key], totals.currency_code)}
                  </TableCell>
                ))}
              </TableRow>
            ) : null}
          </>
        )}
      </TableBody>
    </Table>
  );
}

import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import {
  CHEQUE_TYPE_LABELS,
  type ChequeSortKey,
} from '../../constants/cheque.constants';
import type { GlCheque } from '../../types/cheque.types';
import { chequeDisplayNumber } from '../../utils/normalizeCheque';
import { ChequeStatusBadge } from '../ChequeStatusBadge';

interface ChequeTableProps {
  cheques: GlCheque[];
  isFetching?: boolean;
  page: number;
  pageSize: number;
  total: number;
  sortKey: ChequeSortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: ChequeSortKey) => void;
  onPage: (page: number) => void;
  onView: (cheque: GlCheque) => void;
}

function SortHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium hover:text-[var(--color-neutral-800)]"
      onClick={onClick}
    >
      {label}
      {active ? <span className="text-[10px]">{dir === 'asc' ? '▲' : '▼'}</span> : null}
    </button>
  );
}

export function ChequeTable({
  cheques,
  isFetching,
  page,
  pageSize,
  total,
  sortKey,
  sortDir,
  onSort,
  onPage,
  onView,
}: ChequeTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <SortHead
                label="Cheque No"
                active={sortKey === 'cheque_number'}
                dir={sortDir}
                onClick={() => onSort('cheque_number')}
              />
            </TableHead>
            <TableHead>
              <SortHead
                label="Cheque date"
                active={sortKey === 'cheque_date'}
                dir={sortDir}
                onClick={() => onSort('cheque_date')}
              />
            </TableHead>
            <TableHead>
              <SortHead
                label="Due date"
                active={sortKey === 'due_date'}
                dir={sortDir}
                onClick={() => onSort('due_date')}
              />
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>
              <SortHead
                label="Amount"
                active={sortKey === 'amount'}
                dir={sortDir}
                onClick={() => onSort('amount')}
              />
            </TableHead>
            <TableHead>PDC</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cheques.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                No cheques found
              </TableCell>
            </TableRow>
          ) : (
            cheques.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell mono>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(c)}
                  >
                    {chequeDisplayNumber(c)}
                  </button>
                </TableCell>
                <TableCell>{c.cheque_date || '—'}</TableCell>
                <TableCell>{c.due_date || '—'}</TableCell>
                <TableCell>{CHEQUE_TYPE_LABELS[c.cheque_type] ?? c.cheque_type}</TableCell>
                <TableCell>{c.party_name || c.party_code || c.party_id.slice(0, 8)}</TableCell>
                <TableCell mono>{`${c.currency_code} ${c.amount.toLocaleString()}`}</TableCell>
                <TableCell>{c.is_pdc ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <ChequeStatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-2 text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {page} of {totalPages} ({total} cheques)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

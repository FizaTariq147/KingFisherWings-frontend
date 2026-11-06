import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { PendingJobChargeLine } from '../../types/arApAging.types';

interface PendingJobChargesTableProps {
  charges: PendingJobChargeLine[];
}

export function PendingJobChargesTable({ charges }: PendingJobChargesTableProps) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Job</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Sale amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-[var(--color-neutral-400)] py-8">
              No uninvoiced billable sale charges
            </TableCell>
          </TableRow>
        ) : (
          charges.map((c) => (
            <TableRow key={c.charge_id}>
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
              <TableCell>{c.description || '—'}</TableCell>
              <TableCell mono>
                {c.sale_amount != null
                  ? `${c.currency_code || ''} ${c.sale_amount.toLocaleString()}`.trim()
                  : '—'}
              </TableCell>
              <TableCell>
                {c.needs_invoice !== false ? (
                  <span className="text-xs text-amber-700">Needs sale invoice</span>
                ) : (
                  <span className="text-xs text-[var(--color-neutral-500)]">Pending</span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

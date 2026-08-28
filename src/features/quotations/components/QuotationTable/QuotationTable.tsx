import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { useMemo } from 'react';
import { JOB_TYPE_LABELS } from '../../constants/quotation.constants';
import type { PaginationMeta, Quotation } from '../../types/quotation.types';
import {
  buildPortLabelMap,
  formatQuotationDate,
  quotationCustomerLabel,
  quotationRouteLabel,
  quotationTotalLabel,
} from '../../utils/quotationDisplay';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';
import { QuotationActionMenu } from '../QuotationActionMenu';
import { QuotationStatusBadge } from '../QuotationStatusBadge';

interface QuotationTableProps {
  quotations: Quotation[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingActionId?: string | null;
  onView: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onDuplicate: (q: Quotation) => void;
  onSubmit: (q: Quotation) => void;
  onApprove: (q: Quotation) => void;
  onReject: (q: Quotation) => void;
  onSend: (q: Quotation) => void;
  onDelete: (q: Quotation) => void;
  onArchive: (q: Quotation) => void;
  emptyMessage?: string;
}

export function QuotationTable({
  quotations,
  isFetching,
  meta,
  onPage,
  pendingActionId,
  onView,
  onEdit,
  onDuplicate,
  onSubmit,
  onApprove,
  onReject,
  onSend,
  onDelete,
  onArchive,
  emptyMessage = 'No quotations found',
}: QuotationTableProps) {
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: customersResult } = useParties({
    page: 1,
    limit: 500,
    party_type: 'CUSTOMER',
    order: 'asc',
  });

  const portMap = useMemo(() => buildPortLabelMap(ports), [ports]);
  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of customersResult?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      const label = [p.code, p.name].filter(Boolean).join(' — ') || p.id.slice(0, 8);
      map.set(p.id, label);
    }
    return map;
  }, [customersResult?.parties]);

  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Quote No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Job type</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Valid until</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            quotations.map((q) => (
              <TableRow
                key={q.id}
                className="cursor-pointer"
                onClick={() => onView(q)}
              >
                <TableCell mono>{quotationDisplayNumber(q)}</TableCell>
                <TableCell>
                  <div className="font-medium text-[var(--color-neutral-800)]">
                    {quotationCustomerLabel(q, partyMap)}
                  </div>
                </TableCell>
                <TableCell>{JOB_TYPE_LABELS[q.job_type] ?? q.job_type}</TableCell>
                <TableCell mono>{quotationRouteLabel(q, portMap)}</TableCell>
                <TableCell>{formatQuotationDate(q.valid_until)}</TableCell>
                <TableCell mono>{quotationTotalLabel(q)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <QuotationStatusBadge status={q.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <QuotationActionMenu
                    quotation={q}
                    disabled={pendingActionId === q.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onSubmit={onSubmit}
                    onApprove={onApprove}
                    onReject={onReject}
                    onSend={onSend}
                    onDelete={onDelete}
                    onArchive={onArchive}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && onPage && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

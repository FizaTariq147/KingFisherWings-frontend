import { AppFetchBar } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { ListRowEditButton } from '@/components/ui/ListRowEditButton';
import { OperationTypeBadge } from '@/components/erp';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { erpTable, listShell } from '@/lib/erpTypography';
import { useMemo } from 'react';
import type { PaginationMeta, Quotation } from '../../types/quotation.types';
import {
  buildPortLabelMap,
  formatQuotationDate,
  quotationCustomerLabel,
  quotationDestLabel,
  quotationIdNameLabel,
  quotationListDate,
  quotationOriginLabel,
  quotationTotalLabel,
} from '../../utils/quotationDisplay';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';
import { isQuotationDraftEditable } from '../../utils/quotationStatus';
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

/**
 * Fresa Quotation list grid (blog Step 3 — Create from this screen).
 * Columns mirror API list fields; labels resolved from masters (never hardcoded rows).
 */
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
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: customersResult } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });

  const portMap = useMemo(() => buildPortLabelMap(ports), [ports]);
  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of customersResult?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      const label = [p.code, p.name].filter(Boolean).join(' — ');
      if (label) map.set(p.id, label);
    }
    return map;
  }, [customersResult?.parties]);
  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departments) {
      const id = String(d.id ?? '');
      if (!isUuid(id)) continue;
      const label = String(d.name ?? d.code ?? '').trim();
      if (label && !isUuid(label)) map.set(id, label);
    }
    return map;
  }, [departments]);

  return (
    <div className="relative">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <div className="overflow-x-auto">
        <table className={listShell.table}>
          <thead>
            <tr>
              <th className={`${erpTable.th} w-10`}>{''}</th>
              <th className={erpTable.th}>Quotation No</th>
              <th className={erpTable.th}>Date</th>
              <th className={erpTable.th}>Department</th>
              <th className={erpTable.th}>Customer</th>
              <th className={erpTable.th}>Origin</th>
              <th className={erpTable.th}>Destination</th>
              <th className={erpTable.th}>Incoterm</th>
              <th className={erpTable.th}>Valid From</th>
              <th className={erpTable.th}>Valid To</th>
              <th className={erpTable.th}>Total</th>
              <th className={erpTable.th}>Status</th>
              <th className={`${erpTable.th} w-10`}>{''}</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={13} className={`${erpTable.td} ${listShell.empty}`}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              quotations.map((q) => {
                const canEdit = isQuotationDraftEditable(q.status);
                const deptName = quotationIdNameLabel(
                  q.department_name,
                  q.department_id,
                  departmentMap,
                );
                return (
                  <tr
                    key={q.id}
                    className={`${erpTable.row} cursor-pointer`}
                    onClick={() => onView(q)}
                  >
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                      <ListRowEditButton
                        disabled={pendingActionId === q.id || !canEdit}
                        title={canEdit ? 'Edit quotation' : 'Only draft quotations can be edited'}
                        onClick={() => (canEdit ? onEdit(q) : onView(q))}
                      />
                    </td>
                    <td className={erpTable.td}>
                      <span className="font-semibold text-[var(--color-primary-700)]">
                        {quotationDisplayNumber(q)}
                      </span>
                    </td>
                    <td className={erpTable.td}>{quotationListDate(q)}</td>
                    <td className={erpTable.td}>
                      <div className="flex flex-col gap-0.5">
                        <OperationTypeBadge code={q.job_type} />
                        {deptName !== '—' ? (
                          <span className="text-[12px] text-[#64748b]">{deptName}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className={erpTable.td}>{quotationCustomerLabel(q, partyMap)}</td>
                    <td className={`${erpTable.td} max-w-[180px] whitespace-normal break-words`}>
                      {quotationOriginLabel(q, portMap)}
                    </td>
                    <td className={`${erpTable.td} max-w-[180px] whitespace-normal break-words`}>
                      {quotationDestLabel(q, portMap)}
                    </td>
                    <td className={erpTable.td}>{q.incoterm?.trim() || '—'}</td>
                    <td className={erpTable.td}>{formatQuotationDate(q.valid_from)}</td>
                    <td className={erpTable.td}>{formatQuotationDate(q.valid_until)}</td>
                    <td className={erpTable.td}>{quotationTotalLabel(q)}</td>
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                      <QuotationStatusBadge status={q.status} />
                    </td>
                    <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {meta && onPage && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-[#d0d7de] px-3 py-2 text-[13px]">
          <span className="text-[#64748b]">
            {meta.total} quotation(s) · Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="px-2 py-1.5">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

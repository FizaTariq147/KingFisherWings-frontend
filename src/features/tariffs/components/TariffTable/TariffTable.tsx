import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { TARIFF_SERVICE_TYPE_LABELS } from '../../constants/tariff.constants';
import type { PaginationMeta, Tariff } from '../../types/tariff.types';
import { TariffActionMenu } from '../TariffActionMenu';
import { TariffStatusBadge } from '../TariffStatusBadge';

interface TariffTableProps {
  tariffs: Tariff[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingId?: string | null;
  onView: (t: Tariff) => void;
  onEdit: (t: Tariff) => void;
  onDuplicate: (t: Tariff) => void;
  onActivate: (t: Tariff) => void;
  onDeactivate: (t: Tariff) => void;
  onDelete: (t: Tariff) => void;
}

export function TariffTable({
  tariffs,
  isFetching,
  meta,
  onPage,
  pendingId,
  onView,
  onEdit,
  onDuplicate,
  onActivate,
  onDeactivate,
  onDelete,
}: TariffTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Service</TableHead>
            <TableHead>Charge</TableHead>
            <TableHead>Lane</TableHead>
            <TableHead>Sale</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tariffs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                No tariffs found
              </TableCell>
            </TableRow>
          ) : (
            tariffs.map((t) => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => onView(t)}>
                <TableCell>
                  {TARIFF_SERVICE_TYPE_LABELS[t.service_type] ?? t.service_type}
                </TableCell>
                <TableCell mono>{t.charge_code || t.charge_code_id.slice(0, 8)}</TableCell>
                <TableCell mono>
                  {(t.origin_port_code || '—') + ' → ' + (t.dest_port_code || '—')}
                </TableCell>
                <TableCell mono>
                  {t.currency_code} {t.sale_rate.toLocaleString()}
                </TableCell>
                <TableCell mono>
                  {t.currency_code} {t.cost_rate.toLocaleString()}
                </TableCell>
                <TableCell>
                  {t.valid_from}
                  {t.valid_to ? ` → ${t.valid_to}` : ''}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <TariffStatusBadge tariff={t} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <TariffActionMenu
                    tariff={t}
                    disabled={pendingId === t.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onDelete={onDelete}
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

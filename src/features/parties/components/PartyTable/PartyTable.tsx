import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { PARTY_TYPE_LABELS } from '../../constants/party.constants';
import type { PaginationMeta, Party } from '../../types/party.types';
import { PartyActionMenu } from '../PartyActionMenu';
import { PartyCreditBadge } from '../PartyCreditBadge';
import { PartyStatusBadge } from '../PartyStatusBadge';

interface PartyTableProps {
  parties: Party[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingActionId?: string | null;
  onView: (party: Party) => void;
  onEdit: (party: Party) => void;
  onActivate: (party: Party) => void;
  onDeactivate: (party: Party) => void;
  onCreditStatus: (party: Party) => void;
  onDelete: (party: Party) => void;
  emptyMessage?: string;
}

export function PartyTable({
  parties,
  isFetching,
  meta,
  onPage,
  pendingActionId,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onCreditStatus,
  onDelete,
  emptyMessage = 'No parties found',
}: PartyTableProps) {
  return (
    <div className="relative space-y-3">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[var(--color-primary-100)]">
          <div className="h-full w-1/3 bg-[var(--color-primary-500)] animate-pulse" />
        </div>
      )}
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            parties.map((party) => (
              <TableRow key={party.id}>
                <TableCell mono>{party.code || '—'}</TableCell>
                <TableCell>
                  <div className="font-medium text-[var(--color-neutral-800)]">{party.name}</div>
                  {party.short_name ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">{party.short_name}</div>
                  ) : null}
                </TableCell>
                <TableCell>{PARTY_TYPE_LABELS[party.party_type] ?? party.party_type}</TableCell>
                <TableCell mono>{party.country_code || '—'}</TableCell>
                <TableCell>
                  <PartyCreditBadge status={party.credit_status} />
                </TableCell>
                <TableCell>
                  <PartyStatusBadge party={party} />
                </TableCell>
                <TableCell>
                  <PartyActionMenu
                    party={party}
                    disabled={pendingActionId === party.id}
                    onView={onView}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onCreditStatus={onCreditStatus}
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

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
  ACCOUNT_GROUP_LABELS,
  ACCOUNT_TYPE_LABELS,
} from '../../constants/chartOfAccount.constants';
import type { ChartOfAccount } from '../../types/chartOfAccount.types';

interface ChartOfAccountTableProps {
  accounts: ChartOfAccount[];
  isFetching?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onView: (account: ChartOfAccount) => void;
  onEdit?: (account: ChartOfAccount) => void;
}

export function ChartOfAccountTable({
  accounts,
  isFetching,
  page,
  pageSize,
  total,
  onPage,
  onView,
  onEdit,
}: ChartOfAccountTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">{' '}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--color-neutral-400)] py-10">
                No accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((a) => (
              <TableRow key={a.id} className="cursor-pointer">
                <TableCell>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    onClick={() => onView(a)}
                  >
                    {a.account_code}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => onView(a)}
                  >
                    {a.account_name}
                  </button>
                  {a.parent_code ? (
                    <div className="text-xs text-[var(--color-neutral-400)]">
                      Parent: {a.parent_code}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{ACCOUNT_GROUP_LABELS[a.account_group] ?? a.account_group}</TableCell>
                <TableCell>{ACCOUNT_TYPE_LABELS[a.account_type] ?? a.account_type}</TableCell>
                <TableCell>
                  {[
                    a.is_header ? 'Header' : null,
                    a.is_postable !== false ? 'Postable' : 'Non-postable',
                    a.is_bank_account ? 'Bank' : null,
                    a.is_cash_account ? 'Cash' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.is_active !== false
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {a.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  {onEdit ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(a);
                      }}
                    >
                      Edit
                    </Button>
                  ) : (
                    <span className="text-xs text-[var(--color-neutral-400)]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-2 text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {page} of {totalPages} ({total} accounts)
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

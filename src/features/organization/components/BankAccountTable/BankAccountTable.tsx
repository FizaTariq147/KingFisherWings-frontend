import { AppFetchBar } from '@/components/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { PaginationMeta, TenantBankAccount } from '../../types/organization.types';

interface BankAccountTableProps {
  accounts: TenantBankAccount[];
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  pendingActionId?: string | null;
  onView: (account: TenantBankAccount) => void;
  onEdit: (account: TenantBankAccount) => void;
  onActivate: (account: TenantBankAccount) => void;
  onDeactivate: (account: TenantBankAccount) => void;
  onDelete: (account: TenantBankAccount) => void;
}

export function BankAccountTable({
  accounts,
  isFetching,
  meta,
  onPage,
  pendingActionId,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: BankAccountTableProps) {
  return (
    <div className="relative space-y-3">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Bank</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>IBAN</TableHead>
            <TableHead>SWIFT</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead className="w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-10">
                No bank accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => {
              const busy = pendingActionId === account.id;
              return (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="font-medium text-[var(--color-neutral-800)]">
                      {account.bank_name}
                    </div>
                  </TableCell>
                  <TableCell>{account.account_name || '—'}</TableCell>
                  <TableCell mono>{account.account_number || '—'}</TableCell>
                  <TableCell mono className="text-xs">
                    {account.iban || '—'}
                  </TableCell>
                  <TableCell mono>{account.swift_code || '—'}</TableCell>
                  <TableCell>{account.currency_code || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={account.is_active ? 'success' : 'neutral'} dot={false}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {account.is_default && (
                        <Badge variant="primary" dot={false}>
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        disabled={busy}
                        onClick={() => onView(account)}
                      >
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        disabled={busy}
                        onClick={() => onEdit(account)}
                      >
                        Edit
                      </Button>
                      {account.is_active ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={busy}
                          onClick={() => onDeactivate(account)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={busy}
                          onClick={() => onActivate(account)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-[var(--color-danger-700)]"
                        disabled={busy}
                        onClick={() => onDelete(account)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && onPage && (
        <div className="flex items-center justify-between text-sm text-[var(--color-neutral-500)]">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

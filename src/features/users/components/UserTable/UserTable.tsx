import { AppFetchBar } from '@/components/motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { PaginationMeta } from '../../types/user.types';
import type { UserSortField, UserSortOrder } from '../../constants/user.constants';
import type { User } from '../../types/user.types';
import { formatUserRole } from '../../utils/formatUserRole';
import { UserActionMenu } from '../UserActionMenu';
import { UserStatusBadge } from '../UserStatusBadge';
import { isSortableUserColumn, USER_TABLE_COLUMNS } from './UserTableColumns';

interface UserTableProps {
  users: User[];
  tenantId: string;
  isFetching?: boolean;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  sortBy?: UserSortField;
  order?: UserSortOrder;
  onSort?: (field: UserSortField) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onInvite?: (user: User) => void;
  pendingActionId?: string | null;
  emptyMessage?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function UserTable({
  users,
  isFetching,
  meta,
  onPage,
  sortBy,
  order,
  onSort,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onInvite,
  pendingActionId,
  emptyMessage = 'No users found',
  onEmptyAction,
  emptyActionLabel = 'Create user',
}: UserTableProps) {
  const navigate = useNavigate();

  const detailPath = (id: string) => `/admin/users/${id}`;
  const editPath = (id: string) => `/admin/users/${id}/edit`;

  return (
    <div className="relative">
      <AppFetchBar active={Boolean(isFetching)} className="absolute top-0 left-0 right-0 z-10" />
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {USER_TABLE_COLUMNS.map((col) => {
              const sortKey = isSortableUserColumn(col.key) ? col.key : null;
              return (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable && onSort && sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(sortKey)}
                      className="inline-flex items-center gap-1 hover:text-[var(--color-neutral-800)] transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown
                        size={12}
                        className={
                          sortBy === sortKey
                            ? 'text-[var(--color-primary-600)]'
                            : 'text-[var(--color-neutral-400)]'
                        }
                        style={
                          sortBy === sortKey && order === 'desc'
                            ? { transform: 'scaleY(-1)' }
                            : undefined
                        }
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <td
                colSpan={USER_TABLE_COLUMNS.length}
                className="px-4 py-12 text-center text-sm text-[var(--color-neutral-400)]"
              >
                <p>{emptyMessage}</p>
                {onEmptyAction && (
                  <button
                    type="button"
                    onClick={onEmptyAction}
                    className="mt-3 text-sm font-medium text-[var(--color-primary-600)] hover:underline"
                  >
                    {emptyActionLabel}
                  </button>
                )}
              </td>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <button
                  type="button"
                  onClick={() => navigate(detailPath(user.id))}
                  className="text-left"
                >
                  <p className="hover:text-[var(--color-primary-600)]">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)]">{user.phone || '—'}</p>
                </button>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatUserRole(user.role)}</TableCell>
              <TableCell>
                <UserStatusBadge user={user} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(user.last_login_at)}
              </TableCell>
              <TableCell className="text-right">
                <UserActionMenu
                  user={user}
                  disabled={pendingActionId === user.id}
                  onView={() => navigate(detailPath(user.id))}
                  onEdit={() => navigate(editPath(user.id))}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onInvite={onInvite}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && onPage && (
        <div className="flex items-center justify-between border-t border-[var(--color-neutral-100)] px-4 py-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
              className="px-3 py-1 text-xs rounded border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
              className="px-3 py-1 text-xs rounded border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Eye, Pencil, Ban, CircleCheck, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { AppAnimatedTableBody, AppFetchBar, AppLoadingState } from '@/components/motion';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

export type MasterListStatusFilter = 'all' | 'active' | 'inactive';

interface MasterListPageProps {
  title: string;
  columns: Column[];
  rows: Record<string, string>[];
  statuses?: Array<'ACTIVE' | 'INACTIVE'>;
  search?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: MasterListStatusFilter;
  onStatusFilterChange?: (value: MasterListStatusFilter) => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (value: 'asc' | 'desc') => void;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  total?: number;
  onPage?: (page: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  onAdd?: () => void;
  onView?: (index: number) => void;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  onToggleActive?: (index: number, nextActive: boolean) => void;
  pendingActionIndex?: number | null;
  supportsDelete?: boolean;
  /** Disable row enter animation (needed for large world catalogs). */
  animateRows?: boolean;
}

function ActionIconButton({
  label,
  onClick,
  disabled,
  tone = 'neutral',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'neutral' | 'primary' | 'danger';
  children: ReactNode;
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-[var(--color-danger-500)] hover:bg-[var(--color-danger-100)]'
      : tone === 'primary'
        ? 'text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]'
        : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        toneClass,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function MasterListPage({
  title,
  columns,
  rows,
  statuses,
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  sortOrder = 'asc',
  onSortOrderChange,
  page = 1,
  pageSize,
  totalPages = 1,
  total,
  onPage,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  emptyMessage = 'No records found',
  onAdd,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  pendingActionIndex,
  supportsDelete = true,
  animateRows = true,
}: MasterListPageProps) {
  const totalCount = total ?? rows.length;
  const limit = pageSize ?? Math.max(rows.length, 1);
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);
  const Body = animateRows ? AppAnimatedTableBody : TableBody;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            + Add New
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="h-9 w-full sm:flex-1 sm:min-w-[12rem] sm:max-w-md rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value as MasterListStatusFilter)}
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm bg-white"
            aria-label="Status filter"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange?.(e.target.value as 'asc' | 'desc')}
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm bg-white"
            aria-label="Sort order"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <Button variant="secondary" size="md" className="flex-1 sm:flex-none" type="button">
            Export
          </Button>
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {errorMessage || 'Failed to load records.'}
        </div>
      )}

      <Card padding="none">
        <AppFetchBar active={Boolean(isFetching && !isLoading)} />
        {isLoading && rows.length === 0 ? (
          <AppLoadingState />
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="whitespace-nowrap">
                  {col.label}
                </TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Body>
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-10 text-center text-sm text-[var(--color-neutral-400)]"
                >
                  {emptyMessage}
                </td>
              </TableRow>
            )}
            {rows.map((row, i) => {
              const active = (statuses?.[i] ?? 'ACTIVE') === 'ACTIVE';
              const pending = pendingActionIndex === i;
              return (
                <TableRow key={row.id ?? i} className={animateRows ? 'app-list-row' : undefined}>
                  {columns.map((col) => (
                    <TableCell key={col.key} mono={col.mono}>
                      {row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={active ? 'success' : 'neutral'}>
                      {active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {onView && (
                        <ActionIconButton
                          label="View"
                          disabled={pending}
                          onClick={() => onView(i)}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                      )}
                      {onEdit && (
                        <ActionIconButton
                          label="Edit"
                          tone="primary"
                          disabled={pending}
                          onClick={() => onEdit(i)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                      )}
                      {onToggleActive && (
                        <ActionIconButton
                          label={active ? 'Deactivate' : 'Activate'}
                          disabled={pending}
                          onClick={() => onToggleActive(i, !active)}
                        >
                          {active ? (
                            <Ban className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <CircleCheck className="h-4 w-4" aria-hidden="true" />
                          )}
                        </ActionIconButton>
                      )}
                      {supportsDelete && onDelete && (
                        <ActionIconButton
                          label="Delete"
                          tone="danger"
                          disabled={pending}
                          onClick={() => onDelete(i)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Body>
        </Table>
        )}
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--color-neutral-400)]">
        <span>
          {totalCount === 0
            ? 'Showing 0 of 0'
            : `Showing ${from}–${Math.min(to, totalCount)} of ${totalCount}`}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPage?.(page - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white"
          >
            {page}
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPage?.(page + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

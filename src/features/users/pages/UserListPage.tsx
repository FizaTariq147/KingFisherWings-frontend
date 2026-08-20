import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserConfirmModal } from '../components/UserConfirmModal';
import { UserFilters, type UserLifecycleFilter } from '../components/UserFilters/UserFilters';
import { UserTable } from '../components/UserTable';
import { UserTableSkeleton } from '../components/UserTableSkeleton';
import {
  DEFAULT_USER_LIST_ORDER,
  DEFAULT_USER_LIST_SORT,
  DEFAULT_USER_PAGE_SIZE,
} from '../constants/user.constants';
import type { UserRole, UserSortField, UserSortOrder } from '../constants/user.constants';
import { useUserConfirmState } from '../hooks/useUserConfirmState';
import { useUserTenantScope } from '../hooks/useUserTenantScope';
import {
  useUsers,
  useDeleteUser,
  useRestoreUser,
  useUpdateUserStatus,
} from '../hooks/useUsers';
import type { User } from '../types/user.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatUserLabel } from '../utils/userToFormValues';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function UserListPage() {
  const navigate = useNavigate();
  const { tenantId, sessionScoped, userPath } = useUserTenantScope();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserLifecycleFilter>('all');
  const [role, setRole] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<UserSortField>(DEFAULT_USER_LIST_SORT);
  const [order, setOrder] = useState<UserSortOrder>(DEFAULT_USER_LIST_ORDER);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { confirm, requestConfirm, closeConfirm } = useUserConfirmState();

  const debouncedSearch = useDebouncedValue(search, 300);
  const deleteUser = useDeleteUser();
  const updateUserStatus = useUpdateUserStatus();
  const restoreUser = useRestoreUser();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, role, sortBy, order, tenantId]);

  const listParams = {
    tenantId: tenantId ?? '',
    page,
    limit: DEFAULT_USER_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    lifecycle: status,
    role: role === 'all' ? undefined : role,
    sortBy,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers(listParams);

  const users = data?.users ?? [];
  const meta = data?.meta;
  const totalCount = meta?.total ?? 0;

  const handleSort = (field: UserSortField) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const scopeTenantId = tenantId || 'session';

  const runAction = async (user: User, action: () => Promise<unknown>) => {
    if (!tenantId && !sessionScoped) return;
    setActionError(null);
    setPendingActionId(user.id);
    try {
      await action();
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Action failed. Please try again.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleActivate = (user: User) =>
    runAction(user, () =>
      updateUserStatus.mutateAsync({
        tenantId: scopeTenantId,
        id: user.id,
        dto: { status: 'ACTIVE' },
      }),
    );

  const handleDeactivate = (user: User) => requestConfirm('deactivate', user);
  const handleDelete = (user: User) => requestConfirm('delete', user);
  const handleRestore = (user: User) => requestConfirm('restore', user);

  const handleInvite = (user: User) =>
    runAction(user, () => authService.inviteUser({ user_id: user.id, email: user.email }));

  const handleConfirmAction = async () => {
    if (!confirm || (!tenantId && !sessionScoped)) return;
    const { action, user } = confirm;

    const mutation =
      action === 'delete'
        ? () =>
            deleteUser.mutateAsync({
              tenantId: scopeTenantId,
              id: user.id,
              user,
            })
        : action === 'deactivate'
          ? () =>
              updateUserStatus.mutateAsync({
                tenantId: scopeTenantId,
                id: user.id,
                dto: { status: 'INACTIVE' },
              })
          : action === 'activate'
            ? () =>
                updateUserStatus.mutateAsync({
                  tenantId: scopeTenantId,
                  id: user.id,
                  dto: { status: 'ACTIVE' },
                })
            : () => restoreUser.mutateAsync({ tenantId: scopeTenantId, id: user.id });

    setActionError(null);
    setPendingActionId(user.id);
    try {
      await mutation();
      closeConfirm();
      if (action === 'delete') setStatus('deleted');
      if (action === 'restore') setStatus('all');
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Action failed. Please try again.');
    } finally {
      setPendingActionId(null);
    }
  };

  const listErrorMessage = isError ? getErrorMessage(error) || 'Failed to load users.' : null;

  if (!tenantId && !sessionScoped) {
    return (
      <Card className="p-6 text-sm text-[var(--color-neutral-500)]">
        Unable to resolve your tenant workspace from the current session. Sign in again as a Tenant
        Admin.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Users</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">
            {totalCount} user{totalCount === 1 ? '' : 's'}
            {status === 'deleted' ? ' deleted' : ''} in your tenant workspace
          </p>
        </div>
        <Button onClick={() => navigate(userPath('/new'))} className="w-full sm:w-auto">
          + New User
        </Button>
      </div>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        role={role}
        onRoleChange={setRole}
      />

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{listErrorMessage}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <Card padding="none">
          <UserTable
            users={users}
            tenantId={scopeTenantId}
            isFetching={isFetching}
            meta={!isError ? meta : undefined}
            onPage={setPage}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            pendingActionId={pendingActionId}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onInvite={handleInvite}
            emptyMessage={
              debouncedSearch || status !== 'all' || role !== 'all'
                ? status === 'deleted'
                  ? 'No deleted users found.'
                  : 'No users match your search or filters.'
                : 'No users in your tenant yet.'
            }
            onEmptyAction={
              !debouncedSearch && status === 'all' && role === 'all'
                ? () => navigate(userPath('/new'))
                : undefined
            }
            emptyActionLabel="+ New User"
          />
        </Card>
      )}

      {confirm && (
        <UserConfirmModal
          open
          action={confirm.action}
          userName={formatUserLabel(confirm.user)}
          isPending={pendingActionId === confirm.user.id}
          onConfirm={handleConfirmAction}
          onClose={closeConfirm}
        />
      )}
    </div>
  );
}

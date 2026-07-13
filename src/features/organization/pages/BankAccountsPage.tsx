import { useEffect, useState } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { BankAccountForm } from '../components/BankAccountForm/BankAccountForm';
import { BankAccountTable } from '../components/BankAccountTable/BankAccountTable';
import { DEFAULT_BANK_PAGE_SIZE } from '../constants/organization.constants';
import {
  useBankAccount,
  useBankAccounts,
  useCreateBankAccount,
  useDeleteBankAccount,
  useSetBankAccountActive,
  useUpdateBankAccount,
} from '../hooks/useBankAccounts';
import type { BankAccountFormValues, TenantBankAccount } from '../types/organization.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { bankAccountToFormValues } from '../utils/prepareOrganizationPayload';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type EditorMode = 'create' | 'edit' | 'view' | null;
type ConfirmAction = 'delete' | 'activate' | 'deactivate' | null;

export default function BankAccountsPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmTarget, setConfirmTarget] = useState<TenantBankAccount | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const createAccount = useCreateBankAccount();
  const deleteAccount = useDeleteBankAccount();
  const setActive = useSetBankAccountActive();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter, order]);

  const listParams = {
    page,
    limit: DEFAULT_BANK_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    is_active:
      activeFilter === 'all' ? undefined : activeFilter === 'active' ? true : false,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useBankAccounts(listParams);
  const accounts = data?.accounts ?? [];
  const meta = data?.meta;

  const { data: selectedAccount, isLoading: detailLoading } = useBankAccount(selectedId ?? '');
  const updateAccount = useUpdateBankAccount(selectedId ?? '');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(null), 2500);
  };

  const openCreate = () => {
    setSelectedId(null);
    setEditorMode('create');
    setActionError(null);
  };

  const openEdit = (account: TenantBankAccount) => {
    setSelectedId(account.id);
    setEditorMode('edit');
    setActionError(null);
  };

  const openView = (account: TenantBankAccount) => {
    setSelectedId(account.id);
    setEditorMode('view');
    setActionError(null);
  };

  const closeEditor = () => {
    setEditorMode(null);
    setSelectedId(null);
    setActionError(null);
  };

  const requestConfirm = (action: ConfirmAction, account: TenantBankAccount) => {
    setConfirmAction(action);
    setConfirmTarget(account);
    setActionError(null);
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setConfirmTarget(null);
  };

  const runConfirm = async () => {
    if (!confirmAction || !confirmTarget) return;
    setPendingActionId(confirmTarget.id);
    setActionError(null);
    try {
      if (confirmAction === 'delete') {
        await deleteAccount.mutateAsync(confirmTarget.id);
        showSuccess('Bank account deleted');
      } else if (confirmAction === 'activate') {
        await setActive.mutateAsync({ id: confirmTarget.id, is_active: true });
        showSuccess('Bank account activated');
      } else if (confirmAction === 'deactivate') {
        await setActive.mutateAsync({ id: confirmTarget.id, is_active: false });
        showSuccess('Bank account deactivated');
      }
      closeConfirm();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCreate = async (values: BankAccountFormValues) => {
    setActionError(null);
    try {
      await createAccount.mutateAsync(values);
      closeEditor();
      showSuccess('Bank account created');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (values: BankAccountFormValues) => {
    if (!selectedId) return;
    setActionError(null);
    try {
      await updateAccount.mutateAsync(values);
      closeEditor();
      showSuccess('Bank account updated');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const selectClass =
    'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-800)]">Bank Accounts</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Tenant organization bank accounts for payments and receipts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {successMessage && <Badge variant="success">{successMessage}</Badge>}
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add account
          </Button>
        </div>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Bank name, account, IBAN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">Status</label>
            <select
              className={selectClass}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">Sort</label>
            <select
              className={selectClass}
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </Card>

      {actionError && !editorMode && !confirmAction && (
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
          {actionError}
        </div>
      )}

      {isError ? (
        <Card>
          <div className="space-y-3 py-6 text-center">
            <p className="text-sm text-[var(--color-danger-700)]">
              {getErrorMessage(error) || 'Failed to load bank accounts.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <p className="py-8 text-center text-sm text-[var(--color-neutral-400)]">
            Loading bank accounts…
          </p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <BankAccountTable
            accounts={accounts}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingActionId={pendingActionId}
            onView={openView}
            onEdit={openEdit}
            onActivate={(a) => requestConfirm('activate', a)}
            onDeactivate={(a) => requestConfirm('deactivate', a)}
            onDelete={(a) => requestConfirm('delete', a)}
          />
        </Card>
      )}

      <Modal
        open={editorMode === 'create' || editorMode === 'edit' || editorMode === 'view'}
        onClose={closeEditor}
        title={
          editorMode === 'create'
            ? 'Add bank account'
            : editorMode === 'edit'
              ? 'Edit bank account'
              : 'Bank account details'
        }
        size="lg"
      >
        {actionError && editorMode && (
          <div
            role="alert"
            className="mb-4 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {actionError}
          </div>
        )}

        {editorMode === 'view' ? (
          detailLoading || !selectedAccount ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
          ) : (
            <div className="space-y-3 text-sm">
              {(
                [
                  ['Bank name', selectedAccount.bank_name],
                  ['Account name', selectedAccount.account_name],
                  ['Account number', selectedAccount.account_number],
                  ['IBAN', selectedAccount.iban || '—'],
                  ['SWIFT / BIC', selectedAccount.swift_code || '—'],
                  ['Currency', selectedAccount.currency_code],
                  ['Branch id', selectedAccount.branch_id || '—'],
                  ['Default', selectedAccount.is_default ? 'Yes' : 'No'],
                  ['Active', selectedAccount.is_active ? 'Yes' : 'No'],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-2">
                  <span className="text-[var(--color-neutral-400)]">{label}</span>
                  <span className="col-span-2 font-medium text-[var(--color-neutral-800)]">
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={closeEditor}>
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedAccount) openEdit(selectedAccount);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )
        ) : editorMode === 'edit' && (detailLoading || !selectedAccount) ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : (
          <BankAccountForm
            mode={editorMode === 'create' ? 'create' : 'edit'}
            defaultValues={
              editorMode === 'edit' && selectedAccount
                ? bankAccountToFormValues(selectedAccount)
                : undefined
            }
            isSubmitting={createAccount.isPending || updateAccount.isPending}
            onCancel={closeEditor}
            onSubmit={editorMode === 'create' ? handleCreate : handleUpdate}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(confirmAction && confirmTarget)}
        onClose={closeConfirm}
        title={
          confirmAction === 'delete'
            ? 'Delete bank account?'
            : confirmAction === 'activate'
              ? 'Activate bank account?'
              : 'Deactivate bank account?'
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmAction === 'delete' || confirmAction === 'deactivate' ? 'danger' : 'primary'}
              disabled={Boolean(pendingActionId)}
              onClick={runConfirm}
            >
              {pendingActionId
                ? 'Working…'
                : confirmAction === 'delete'
                  ? 'Delete'
                  : confirmAction === 'activate'
                    ? 'Activate'
                    : 'Deactivate'}
            </Button>
          </div>
        }
      >
        {actionError && confirmAction && (
          <p className="mb-3 text-sm text-[var(--color-danger-700)]">{actionError}</p>
        )}
        <p className="text-sm text-[var(--color-neutral-600)]">
          {confirmTarget
            ? confirmAction === 'delete'
              ? `${confirmTarget.bank_name} (${confirmTarget.account_number}) will be soft-deleted.`
              : confirmAction === 'activate'
                ? `${confirmTarget.bank_name} will be set active.`
                : `${confirmTarget.bank_name} will be set inactive.`
            : null}
        </p>
      </Modal>
    </div>
  );
}

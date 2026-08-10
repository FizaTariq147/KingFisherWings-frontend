import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Network, Plus, RefreshCw, Scale, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import { ChartOfAccountFilters } from '../components/ChartOfAccountFilters';
import { ChartOfAccountTable } from '../components/ChartOfAccountTable';
import {
  DEFAULT_COA_PAGE_SIZE,
  type AccountGroup,
  type AccountType,
} from '../constants/chartOfAccount.constants';
import {
  useChartOfAccounts,
  useSeedChartOfAccounts,
} from '../hooks/useChartOfAccounts';
import { canManageChartOfAccounts } from '../utils/coaPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AppListPanelBody } from '@/components/motion';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function ChartOfAccountListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [accountGroup, setAccountGroup] = useState<AccountGroup | 'all'>('all');
  const [accountType, setAccountType] = useState<AccountType | 'all'>('all');
  const [postable, setPostable] = useState<'all' | 'yes' | 'no'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canWriteCoa = canManageChartOfAccounts({
    permissions: user?.permissions,
    role: user?.role,
  });

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, accountGroup, accountType, postable, status]);

  const listParams = {
    search: debouncedSearch.trim() || undefined,
    account_group: accountGroup === 'all' ? undefined : accountGroup,
    account_type: accountType === 'all' ? undefined : accountType,
    is_postable: postable === 'all' ? undefined : postable === 'yes',
    is_active: status === 'all' ? undefined : status === 'active',
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useChartOfAccounts(listParams);
  const seed = useSeedChartOfAccounts();

  const allAccounts = data?.accounts ?? [];
  const total = allAccounts.length;
  const pageSize = DEFAULT_COA_PAGE_SIZE;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allAccounts.slice(start, start + pageSize);
  }, [allAccounts, page, pageSize]);

  const onSeed = async () => {
    setActionError(null);
    setActionMessage(null);
    try {
      const created = await seed.mutateAsync();
      setActionMessage(
        created.length
          ? `Seeded ${created.length} starter account(s).`
          : 'Seed completed (COA may already exist).',
      );
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Chart of Accounts
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            General ledger accounts — search, filter, maintain hierarchy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/tree`)}
          >
            <Network className="h-4 w-4" />
            Tree
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/trial-balance`)}
          >
            <Scale className="h-4 w-4" />
            Trial balance
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSeed}
            disabled={seed.isPending || !canWriteCoa}
            title={!canWriteCoa ? 'Requires gl.manage_coa' : undefined}
          >
            <Sprout className="h-4 w-4" />
            {seed.isPending ? 'Seeding…' : 'Seed defaults'}
          </Button>
          <Button
            type="button"
            onClick={() => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/new`)}
            disabled={!canWriteCoa}
            title={!canWriteCoa ? 'Requires gl.manage_coa' : undefined}
          >
            <Plus className="h-4 w-4" />
            New account
          </Button>
        </div>
      </div>

      {(actionMessage || actionError) && (
        <div
          role="alert"
          className="rounded-lg border px-3 py-2 text-sm"
          style={
            actionError
              ? {
                  background: 'var(--color-danger-100)',
                  borderColor: '#FECACA',
                  color: 'var(--color-danger-700)',
                }
              : {
                  background: 'var(--color-success-100, #ECFDF5)',
                  borderColor: '#A7F3D0',
                  color: 'var(--color-success-700, #047857)',
                }
          }
        >
          {actionError || actionMessage}
        </div>
      )}

      <Card className="p-4 space-y-4">
        <ChartOfAccountFilters
          search={search}
          onSearchChange={setSearch}
          accountGroup={accountGroup}
          onAccountGroupChange={setAccountGroup}
          accountType={accountType}
          onAccountTypeChange={setAccountType}
          postable={postable}
          onPostableChange={setPostable}
          status={status}
          onStatusChange={setStatus}
        />

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load chart of accounts.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <AppListPanelBody isLoading={isLoading} isFetching={isFetching}>
            <ChartOfAccountTable
              accounts={paged}
              isFetching={isFetching}
              page={page}
              pageSize={pageSize}
              total={total}
              onPage={setPage}
              onView={(a) => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${a.id}`)}
              onEdit={
                canWriteCoa
                  ? (a) => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${a.id}/edit`)
                  : undefined
              }
            />
          </AppListPanelBody>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeFilters } from '../components/ChequeFilters';
import { ChequeTable } from '../components/ChequeTable';
import {
  DEFAULT_CHEQUE_PAGE_SIZE,
  type ChequeSortKey,
  type ChequeStatus,
  type ChequeType,
} from '../constants/cheque.constants';
import { useCheques } from '../hooks/useGlCheques';
import type { GlCheque } from '../types/cheque.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function sortCheques(
  items: GlCheque[],
  key: ChequeSortKey,
  dir: 'asc' | 'desc',
): GlCheque[] {
  const mult = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    if (key === 'amount') return mult * (a.amount - b.amount);
    const av = String(a[key] ?? '');
    const bv = String(b[key] ?? '');
    return mult * av.localeCompare(bv);
  });
}

export default function ChequeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [chequeType, setChequeType] = useState<ChequeType | 'all'>('all');
  const [status, setStatus] = useState<ChequeStatus | 'all'>('all');
  const [isPdc, setIsPdc] = useState<'all' | 'yes' | 'no'>('all');
  const [dueBefore, setDueBefore] = useState('');
  const [partyId, setPartyId] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<ChequeSortKey>('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useDebouncedValue(search, 300);
  const partyValid = !partyId.trim() || isUuid(partyId.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, chequeType, status, isPdc, dueBefore, partyId]);

  const listParams = {
    cheque_type: chequeType === 'all' ? undefined : chequeType,
    status: status === 'all' ? undefined : status,
    is_pdc: isPdc === 'all' ? undefined : isPdc === 'yes',
    due_before: dueBefore.trim() || undefined,
    party_id: partyId.trim() && isUuid(partyId.trim()) ? partyId.trim() : undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useCheques(
    listParams,
  );

  const filtered = useMemo(() => {
    let items = data?.cheques ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (c) =>
          c.cheque_number.toLowerCase().includes(q) ||
          (c.party_name?.toLowerCase().includes(q) ?? false) ||
          (c.bank_name?.toLowerCase().includes(q) ?? false),
      );
    }
    return sortCheques(items, sortKey, sortDir);
  }, [data?.cheques, debouncedSearch, sortKey, sortDir]);

  const total = filtered.length;
  const pageSize = DEFAULT_CHEQUE_PAGE_SIZE;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleSort = (key: ChequeSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
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
            Cheques / PDC
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Register and track receivable, payable, and post-dated cheques.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`${CHEQUE_ROUTE_PREFIX}/reports/pdc-due`)}
          >
            PDC due report
          </Button>
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${CHEQUE_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Register cheque
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <ChequeFilters
          search={search}
          onSearchChange={setSearch}
          chequeType={chequeType}
          onChequeTypeChange={setChequeType}
          status={status}
          onStatusChange={setStatus}
          isPdc={isPdc}
          onIsPdcChange={setIsPdc}
          dueBefore={dueBefore}
          onDueBeforeChange={setDueBefore}
          partyId={partyId}
          onPartyIdChange={setPartyId}
        />

        {!partyValid ? (
          <p className="text-sm text-[var(--color-danger-600)]">Enter a valid party UUID.</p>
        ) : isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load cheques.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <ChequeTable
            cheques={paged}
            isFetching={isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onPage={setPage}
            onView={(c) => navigate(`${CHEQUE_ROUTE_PREFIX}/${c.id}`)}
          />
        )}
      </Card>
    </div>
  );
}

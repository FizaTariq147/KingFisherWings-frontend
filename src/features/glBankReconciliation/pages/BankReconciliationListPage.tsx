import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  BANK_RECON_STATUSES,
  BANK_RECON_STATUS_LABELS,
  type BankReconciliationStatus,
} from '../constants/bankReconciliation.constants';
import { BANK_RECON_ROUTE_PREFIX } from '../api/bankReconciliation.api';
import { useBankReconciliations } from '../hooks/useBankReconciliation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function BankReconciliationListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BankReconciliationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const params = useMemo(
    () => ({ status: status === 'all' ? undefined : status }),
    [status],
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useBankReconciliations(params);

  const filtered = useMemo(() => {
    const all = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.remarks?.toLowerCase().includes(q) ?? false) ||
        (r.gl_account_id?.toLowerCase().includes(q) ?? false),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Bank Reconciliation
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Draft, reconcile, and complete bank statement matching.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/gl/bank-transfers/new')}>
            New transfer
          </Button>
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${BANK_RECON_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Start reconciliation
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            placeholder="Search id/remarks/account…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as BankReconciliationStatus | 'all')}
          >
            <option value="all">All statuses</option>
            {BANK_RECON_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BANK_RECON_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {isError ? (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger-600)] py-6">
            <AlertCircle className="h-4 w-4" />
            {getErrorMessage(error)}
          </p>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-6">Loading…</p>
        ) : (
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Statement Date</TableHead>
                <TableHead>GL Account</TableHead>
                <TableHead>Statement Balance</TableHead>
                <TableHead>Computed Balance</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-[var(--color-neutral-400)]">
                    No reconciliations found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell mono>
                      <button
                        type="button"
                        className="hover:underline"
                        onClick={() => navigate(`${BANK_RECON_ROUTE_PREFIX}/${r.id}`)}
                      >
                        {r.id.slice(0, 8)}
                      </button>
                    </TableCell>
                    <TableCell>{r.statement_date || '—'}</TableCell>
                    <TableCell mono>{r.gl_account_id || '—'}</TableCell>
                    <TableCell mono>{Number(r.statement_balance ?? 0).toLocaleString()}</TableCell>
                    <TableCell mono>{Number(r.computed_balance ?? 0).toLocaleString()}</TableCell>
                    <TableCell mono>{Number(r.difference ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{BANK_RECON_STATUS_LABELS[r.status]}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

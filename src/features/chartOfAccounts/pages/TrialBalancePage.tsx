import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import { useTrialBalance } from '../hooks/useChartOfAccounts';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function TrialBalancePage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hideZero, setHideZero] = useState(true);

  const params = {
    from_date: fromDate.trim() || undefined,
    to_date: toDate.trim() || undefined,
    hide_zero: hideZero,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useTrialBalance(params);
  const lines = data?.lines ?? [];

  const totals = lines.reduce(
    (acc, line) => ({
      debit: acc.debit + (Number(line.debit ?? 0) || 0),
      credit: acc.credit + (Number(line.credit ?? 0) || 0),
    }),
    { debit: 0, credit: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate(CHART_OF_ACCOUNT_ROUTE_PREFIX)}
          >
            ← Chart of Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Trial balance</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Posted voucher lines + opening balances (GET /gl/accounts/reports/trial-balance).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Input
            label="From date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm h-9">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={hideZero}
              onChange={(e) => setHideZero(e.target.checked)}
            />
            Hide zero balances
          </label>
        </div>

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load trial balance.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[var(--color-neutral-400)] py-10"
                  >
                    No trial balance lines
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {lines.map((line, idx) => (
                    <TableRow key={line.account_id || `${line.account_code}-${idx}`}>
                      <TableCell mono>
                        {line.account_id ? (
                          <button
                            type="button"
                            className="text-left underline-offset-2 hover:underline"
                            onClick={() =>
                              navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${line.account_id}`)
                            }
                          >
                            {line.account_code || '—'}
                          </button>
                        ) : (
                          line.account_code || '—'
                        )}
                      </TableCell>
                      <TableCell>{line.account_name || '—'}</TableCell>
                      <TableCell>{line.account_group || '—'}</TableCell>
                      <TableCell mono>{Number(line.debit ?? 0).toLocaleString()}</TableCell>
                      <TableCell mono>{Number(line.credit ?? 0).toLocaleString()}</TableCell>
                      <TableCell mono>{Number(line.balance ?? 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold bg-[var(--color-neutral-50)]">
                    <TableCell colSpan={3}>Totals</TableCell>
                    <TableCell mono>{totals.debit.toLocaleString()}</TableCell>
                    <TableCell mono>{totals.credit.toLocaleString()}</TableCell>
                    <TableCell mono>
                      {(totals.debit - totals.credit).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

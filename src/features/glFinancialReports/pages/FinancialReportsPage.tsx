import { useMemo, useState } from 'react';
import { ReportsBackButton } from '@/features/reports/components/ReportsBackButton';
import { RefreshCw } from 'lucide-react';
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
import {
  useBalanceSheetReport,
  useCashFlowReport,
  useProfitAndLossReport,
  useTrialBalanceReport,
  useVatReturnReport,
} from '../hooks/useFinancialReports';

type ReportKind = 'trial-balance' | 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'vat-return';

export default function FinancialReportsPage() {
  const [kind, setKind] = useState<ReportKind>('trial-balance');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [asOf, setAsOf] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [hideZero, setHideZero] = useState(true);

  const common = useMemo(
    () => ({
      from_date: fromDate.trim() || undefined,
      to_date: toDate.trim() || undefined,
      as_of: asOf.trim() || undefined,
      company_id: companyId.trim() || undefined,
      hide_zero: hideZero,
    }),
    [fromDate, toDate, asOf, companyId, hideZero],
  );

  const trial = useTrialBalanceReport(common);
  const bs = useBalanceSheetReport(common);
  const pl = useProfitAndLossReport(common);
  const cf = useCashFlowReport(common);
  const vat = useVatReturnReport(
    { from_date: fromDate.trim(), to_date: toDate.trim(), company_id: companyId.trim() || undefined },
    kind === 'vat-return',
  );

  const active =
    kind === 'trial-balance' ? trial :
    kind === 'balance-sheet' ? bs :
    kind === 'profit-loss' ? pl :
    kind === 'cash-flow' ? cf : vat;

  const rows = active.data?.rows ?? [];
  const columns = Object.keys(rows[0] ?? {});

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div>
          <ReportsBackButton fallbackTo="/accounts" fallbackLabel="Back to Accounts" />
          <h2 className="text-sm font-semibold text-[var(--color-neutral-800)]">Financial Reports</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Trial balance, balance sheet, P&L, cash flow, and VAT return.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => active.refetch()} disabled={active.isFetching}>
          <RefreshCw className={`h-4 w-4 ${active.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as ReportKind)}
          >
            <option value="trial-balance">Trial Balance</option>
            <option value="balance-sheet">Balance Sheet</option>
            <option value="profit-loss">Profit & Loss</option>
            <option value="cash-flow">Cash Flow</option>
            <option value="vat-return">VAT Return</option>
          </select>
          <Input label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Input label="As-of date" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          <Input label="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
          <label className="text-sm flex items-center gap-2 h-9 mt-6">
            <input type="checkbox" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} />
            Hide zero
          </label>
        </div>
      </Card>

      <Card className="p-4">
        {active.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-8">Loading…</p>
        ) : active.isError ? (
          <p className="text-sm text-[var(--color-danger-600)] py-8">{(active.error as Error)?.message || 'Failed to load report'}</p>
        ) : columns.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-8">No rows returned.</p>
        ) : (
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((c) => (
                    <TableCell key={c} mono>
                      {String((row[c] as unknown) ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

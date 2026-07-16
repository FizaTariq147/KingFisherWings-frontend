import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useMisDashboard, useMisOperational, useMisProfitability } from '../hooks/useGlMis';
import type { MisGroupBy } from '../types/glMis.types';

function GenericTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = Object.keys(rows[0] ?? {});
  if (columns.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-400)]">No data</p>;
  }
  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((c) => (
            <TableHead key={c}>{c}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={idx}>
            {columns.map((c) => (
              <TableCell key={c} mono>{String((r[c] as unknown) ?? '—')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function GlMisDashboardPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [groupBy, setGroupBy] = useState<MisGroupBy>('customer');

  const params = useMemo(
    () => ({
      from_date: fromDate.trim() || undefined,
      to_date: toDate.trim() || undefined,
      company_id: companyId.trim() || undefined,
      branch_id: branchId.trim() || undefined,
    }),
    [fromDate, toDate, companyId, branchId],
  );

  const dashboard = useMisDashboard(params);
  const profitability = useMisProfitability({ ...params, group_by: groupBy });
  const operational = useMisOperational(params);

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
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">MIS Dashboard</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Management KPIs, profitability analytics, and operational metrics.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            dashboard.refetch();
            profitability.refetch();
            operational.refetch();
          }}
          disabled={dashboard.isFetching || profitability.isFetching || operational.isFetching}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Input label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Input label="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <Input label="Branch ID" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Profitability group</label>
          <select
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as MisGroupBy)}
          >
            <option value="customer">Customer</option>
            <option value="job_type">Job type</option>
            <option value="branch">Branch</option>
            <option value="salesperson">Salesperson</option>
          </select>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-medium text-[var(--color-neutral-800)]">Dashboard Widgets</h3>
        {dashboard.isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : <GenericTable rows={dashboard.data?.rows ?? []} />}
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-medium text-[var(--color-neutral-800)]">Profitability</h3>
        {profitability.isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : <GenericTable rows={profitability.data?.rows ?? []} />}
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-medium text-[var(--color-neutral-800)]">Operational KPIs</h3>
        {operational.isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : <GenericTable rows={operational.data?.rows ?? []} />}
      </Card>
    </div>
  );
}

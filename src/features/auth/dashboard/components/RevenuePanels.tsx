import { Link } from 'react-router-dom';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import { compactMoney, pickNumber, pickString } from '../utils/dashboardFormat';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthIndex(label: string): number | null {
  const n = Number(label);
  if (n >= 1 && n <= 12) return n - 1;
  const i = MONTHS.findIndex((m) => label.toLowerCase().startsWith(m.toLowerCase()));
  return i >= 0 ? i : null;
}

export function RevenueVsTargetPanel({
  monthlyRows,
  customerRows,
  isLoading,
  isError,
}: {
  monthlyRows: Record<string, unknown>[];
  customerRows: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
}) {
  const bars = MONTHS.slice(0, 8).map((label, idx) => {
    const row = monthlyRows.find((r) => {
      const raw =
        pickString(r, ['month', 'period', 'label', 'name', 'month_name']) ?? '';
      const mi = monthIndex(raw);
      return mi === idx || raw.toLowerCase() === label.toLowerCase();
    });
    return {
      label,
      value: row
        ? pickNumber(row, ['revenue', 'amount', 'actual', 'total', 'sales', 'value']) ?? 0
        : 0,
    };
  });
  const hasBars = bars.some((b) => b.value > 0);
  const max = Math.max(...bars.map((b) => b.value), 1);
  const total = bars.reduce((s, b) => s + b.value, 0);

  const customers = customerRows.slice(0, 5).map((row, i) => ({
    name: pickString(row, ['customer', 'customer_name', 'name', 'party', 'shipper', 'label']) || `Customer ${i + 1}`,
    amount: pickNumber(row, ['revenue', 'amount', 'total', 'sales', 'value']) ?? 0,
  }));
  const customerMax = Math.max(...customers.map((c) => c.amount), 1);

  return (
    <DashCard>
      <DashCardHeader
        title="Revenue vs target"
        subtitle="Period revenue from CRM / MIS"
        action={
          <div className="text-right">
            <p className="text-lg font-semibold text-[var(--color-neutral-900)]">{compactMoney(total)}</p>
            <p className="text-[10px] text-[var(--color-neutral-400)]">Gross billed</p>
          </div>
        }
      />
      {isLoading ? (
        <DashSkeleton className="h-36" />
      ) : isError ? (
        <DashEmpty>Unable to load revenue report.</DashEmpty>
      ) : !hasBars ? (
        <DashEmpty>No monthly revenue rows for this period.</DashEmpty>
      ) : (
        <div className="flex h-36 items-end gap-3">
          {bars.map((b, i) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-[var(--color-neutral-500)]">
                {b.value ? compactMoney(b.value) : ''}
              </span>
              <span
                className="w-full max-w-10 rounded-t-md"
                style={{
                  height: `${Math.max(6, Math.round((b.value / max) * 100))}%`,
                  background: i % 2 === 0 ? '#0A2942' : '#FF751F',
                }}
              />
              <span className="text-[10px] text-[var(--color-neutral-400)]">{b.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
          Top customers
        </p>
        {customers.length === 0 ? (
          <DashEmpty>No customer revenue breakdown for this period.</DashEmpty>
        ) : (
          <ul className="space-y-2">
            {customers.map((c, i) => (
              <li key={`${c.name}-${i}`} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: ['#0A2942', '#FF751F', '#2C557A', '#C7590F', '#1F8A57'][i % 5] }}
                />
                <span className="w-36 truncate text-sm text-[var(--color-neutral-700)]">{c.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                  <span
                    className="block h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${Math.round((c.amount / customerMax) * 100)}%` }}
                  />
                </span>
                <span className="w-16 text-right text-xs font-semibold">{compactMoney(c.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 text-right">
        <Link to="/sales/sales-dashboard" className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline">
          Open sales dashboard
        </Link>
      </div>
    </DashCard>
  );
}

export function TradeLanePanel({
  rows,
  isLoading,
  isError,
}: {
  rows: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <DashCard>
      <DashCardHeader
        title="Trade lane performance"
        subtitle="CRM trade lane report"
        action={
          <Link to="/sales/sales-dashboard" className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline">
            Full report
          </Link>
        }
      />
      {isLoading ? (
        <DashSkeleton className="h-32" />
      ) : isError ? (
        <DashEmpty>Unable to load trade lane report.</DashEmpty>
      ) : rows.length === 0 ? (
        <DashEmpty>No trade lane rows for this period.</DashEmpty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                <th className="pb-2 font-semibold">Lane</th>
                <th className="pb-2 font-semibold">Jobs</th>
                <th className="pb-2 font-semibold">Revenue</th>
                <th className="pb-2 font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row, i) => {
                const lane =
                  pickString(row, ['lane', 'trade_lane', 'route', 'name', 'origin_dest', 'label']) ||
                  [pickString(row, ['origin', 'pol', 'origin_port']), pickString(row, ['dest', 'pod', 'dest_port'])]
                    .filter(Boolean)
                    .join(' → ') ||
                  `Lane ${i + 1}`;
                const jobs = pickNumber(row, ['jobs', 'job_count', 'count', 'shipments', 'volume']);
                const revenue = pickNumber(row, ['revenue', 'amount', 'sales', 'total']);
                const margin = pickNumber(row, ['margin', 'gp_percent', 'gp', 'margin_percent']);
                return (
                  <tr key={`${lane}-${i}`} className="border-t border-[var(--color-neutral-100)]">
                    <td className="py-2.5 font-medium text-[var(--color-neutral-800)]">{lane}</td>
                    <td className="py-2.5 text-[var(--color-neutral-600)]">{jobs ?? '—'}</td>
                    <td className="py-2.5 font-semibold">{compactMoney(revenue)}</td>
                    <td className="py-2.5">
                      {margin == null ? (
                        '—'
                      ) : (
                        <span className={margin >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-danger-500)]'}>
                          {margin.toFixed(0)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  );
}

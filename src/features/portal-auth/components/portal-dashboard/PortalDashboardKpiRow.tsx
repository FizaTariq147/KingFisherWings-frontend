import { Link } from 'react-router-dom';
import { compactMoney } from '../../utils/portalDashboardFormat';

function MiniBars({ values, colors }: { values: number[]; colors: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-5 flex h-11 items-end gap-1.5">
      {values.map((v, i) => (
        <span
          key={`${i}-${v}`}
          className="w-2 rounded-sm"
          style={{
            height: `${Math.max(18, Math.round((v / max) * 100))}%`,
            background: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

function KpiCard({
  to,
  label,
  value,
  hint,
  meta,
  bars,
  barColors,
  loading,
}: {
  to: string;
  label: string;
  value: string | null;
  hint: string;
  meta?: string;
  bars: number[];
  barColors: string[];
  loading?: boolean;
}) {
  return (
    <Link to={to} className="block h-full">
      <article className="relative h-full rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
        {meta ? (
          <span className="absolute right-4 top-4 text-[11px] font-medium text-[#9AA8B5]">{meta}</span>
        ) : null}
        <p className="pr-12 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A98A6]">
          {label}
        </p>
        {loading || value == null ? (
          <div className="mt-3 h-8 w-20 animate-pulse rounded bg-[#EEF2F5]" />
        ) : (
          <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-[#0A2942]">
            {value}
          </p>
        )}
        <p className="mt-1.5 text-[12px] text-[#8A98A6]">{hint}</p>
        <MiniBars values={bars} colors={barColors} />
      </article>
    </Link>
  );
}

export function PortalDashboardKpiRow({
  activeShipments,
  shipmentTotal,
  pendingQuotes,
  outstanding,
  overdue,
  onTimePct,
  loading,
}: {
  activeShipments: number;
  shipmentTotal: number;
  pendingQuotes: number;
  outstanding: number;
  overdue: number;
  onTimePct: number | null;
  loading: boolean;
}) {
  const deliveryValue = onTimePct == null ? '—' : `${Math.round(onTimePct)}%`;
  const invoiceHint = overdue > 0 ? `${overdue} overdue` : 'across open invoices';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/portal/shipments"
        label="Active shipments"
        value={loading ? null : String(activeShipments)}
        hint={`of ${shipmentTotal} total jobs`}
        meta={activeShipments > 0 ? `+${Math.max(1, Math.min(activeShipments, 9))}` : undefined}
        bars={[3, 5, 4, 6, 5, 8, 7]}
        barColors={['#F5C89A', '#F0A45A', '#FF751F', '#E36A12', '#C7590F']}
        loading={loading}
      />
      <KpiCard
        to="/portal/quotes"
        label="Pending quotations"
        value={loading ? null : String(pendingQuotes)}
        hint="awaiting approval"
        meta={pendingQuotes > 0 ? `+${pendingQuotes} APPR` : undefined}
        bars={[4, 6, 5, 7, 6, 8]}
        barColors={['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB']}
        loading={loading}
      />
      <KpiCard
        to="/portal/invoices"
        label="Outstanding"
        value={loading ? null : compactMoney(outstanding)}
        hint={invoiceHint}
        meta="7 DAYS"
        bars={[4, 5, 6, 7, 8, 9]}
        barColors={['#86EFAC', '#4ADE80', '#22C55E', '#16A34A']}
        loading={loading}
      />
      <KpiCard
        to="/portal/shipments"
        label="On-time delivery"
        value={loading ? null : deliveryValue}
        hint={onTimePct == null ? 'last 90 days' : 'last 90 days'}
        meta="6 MONTHS"
        bars={[6, 7, 6, 8, 7, 9]}
        barColors={['#1F8A57', '#0A2942', '#2C557A', '#1F8A57']}
        loading={loading}
      />
    </div>
  );
}

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CreditCard, FileText, Wallet } from 'lucide-react';
import { formatVendorAmount } from '../../utils/vendorDashboardFormat';
import { cn } from '@/lib/utils';

function SegmentedBar({ colors }: { colors: string[] }) {
  return (
    <div className="mt-5 flex h-2.5 w-full gap-1">
      {colors.map((color, i) => (
        <span
          key={`${color}-${i}`}
          className="h-full flex-1 rounded-[3px]"
          style={{ background: color }}
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
  barColors,
  icon,
  tone = 'white',
  loading,
}: {
  to: string;
  label: string;
  value: string | null;
  hint: string;
  barColors: string[];
  icon: ReactNode;
  tone?: 'white' | 'peach';
  loading?: boolean;
}) {
  return (
    <Link to={to} className="block h-full">
      <article
        className={cn(
          'relative h-full rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]',
          tone === 'peach' ? 'bg-[#FFF1E6]' : 'bg-white',
        )}
      >
        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8EEF3] bg-white/70 text-[#9AA8B5]">
          {icon}
        </span>
        <p className="pr-12 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A98A6]">
          {label}
        </p>
        {loading || value == null ? (
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#EEF2F5]" />
        ) : (
          <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-[#0A2942]">
            {value}
          </p>
        )}
        <p className="mt-1.5 text-[12px] text-[#8A98A6]">{hint}</p>
        <SegmentedBar colors={barColors} />
      </article>
    </Link>
  );
}

export function VendorDashboardKpiRow({
  invoiceTotal,
  dueOpen,
  overdue,
  agingOutstanding,
  paid,
  loading,
}: {
  invoiceTotal: number;
  dueOpen: number;
  overdue: number;
  agingOutstanding: number;
  paid: number;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/vendor/invoices"
        label="Invoices"
        value={loading ? null : String(invoiceTotal)}
        hint="All purchase invoices"
        barColors={['#F8D4B0', '#F5C089', '#FF9A4A', '#FF8A2B', '#FF751F', '#E36A12']}
        icon={<FileText size={15} strokeWidth={1.8} />}
        loading={loading}
      />
      <KpiCard
        to="/vendor/schedule"
        label="Due / Open"
        value={loading ? null : String(dueOpen)}
        hint={`${overdue} overdue`}
        barColors={['#3B82F6', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8']}
        icon={<Calendar size={15} strokeWidth={1.8} />}
        loading={loading}
      />
      <KpiCard
        to="/vendor/credit"
        label="Aging outstanding"
        value={loading ? null : formatVendorAmount(agingOutstanding)}
        hint="From aging / invoice summary"
        barColors={['#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0F766E']}
        icon={<Wallet size={15} strokeWidth={1.8} />}
        loading={loading}
      />
      <KpiCard
        to="/vendor/invoices"
        label="Paid"
        value={loading ? null : String(paid)}
        hint="This cycle"
        barColors={['#F8D4B0', '#FF9A4A', '#FF8A2B', '#FF751F', '#E36A12', '#C7590F']}
        icon={<CreditCard size={15} strokeWidth={1.8} />}
        tone="peach"
        loading={loading}
      />
    </div>
  );
}

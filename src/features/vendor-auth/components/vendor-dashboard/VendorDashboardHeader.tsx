import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  firstName,
  formatVendorDashboardDate,
  type VendorDashboardPeriod,
} from '../../utils/vendorDashboardFormat';

const PERIODS: { id: VendorDashboardPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

export function VendorDashboardHeader({
  userName,
  email,
  partyName,
  period,
  onPeriodChange,
  onRefresh,
  refreshing,
}: {
  userName?: string;
  email?: string;
  partyName?: string;
  period: VendorDashboardPeriod;
  onPeriodChange: (period: VendorDashboardPeriod) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9AA8B5]">
          {formatVendorDashboardDate()}
        </p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[#0A2942]">
          Welcome, {firstName(userName, email)}
        </h1>
        <p className="mt-1.5 text-sm text-[#7A8A98]">
          {partyName
            ? `Accounts payable overview for ${partyName}`
            : 'Invoices, schedule, and aging for your vendor account.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-[#0A2942] px-4 text-xs font-medium text-white hover:bg-[#163E60] disabled:opacity-60"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/vendor/invoices"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FF751F] px-4 text-xs font-semibold text-white hover:bg-[#E36A12]"
          >
            Submit invoice
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className="inline-flex shrink-0 self-start rounded-full bg-white p-1 shadow-[0_8px_24px_rgba(10,41,66,0.06)]">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPeriodChange(item.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              period === item.id ? 'bg-[#0A2942] text-white' : 'text-[#5B6B7A] hover:bg-[#F4F7F9]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

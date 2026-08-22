import { Link } from 'react-router-dom';

import { ArrowRight, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

import { dashType } from '@/lib/dashboardTypography';

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

    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

      <div className="min-w-0">

        <p className={dashType.header.date}>{formatVendorDashboardDate()}</p>

        <h1 className={dashType.header.title}>Welcome, {firstName(userName, email)}</h1>

        <p className={dashType.header.subtitle}>

          {partyName

            ? `Accounts payable overview for ${partyName}`

            : 'Invoices, schedule, and aging for your vendor account.'}

        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">

          <button

            type="button"

            onClick={onRefresh}

            disabled={refreshing}

            className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"

          >

            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />

            Refresh

          </button>

          <Link

            to="/vendor/invoices"

            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-secondary)] px-4 text-xs font-semibold text-white hover:opacity-90"

          >

            Submit invoice

            <ArrowRight size={13} />

          </Link>

        </div>

      </div>

      <div className={cn(dashType.header.periodWrap, 'self-start lg:self-auto')}>

        {PERIODS.map((item) => (

          <button

            key={item.id}

            type="button"

            onClick={() => onPeriodChange(item.id)}

            className={cn(

              dashType.header.periodBtn,

              period === item.id ? dashType.header.periodBtnActive : dashType.header.periodBtnIdle,

            )}

          >

            {item.label}

          </button>

        ))}

      </div>

    </div>

  );

}


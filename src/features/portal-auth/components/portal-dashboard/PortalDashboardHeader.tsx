import { Link } from 'react-router-dom';

import { AlertCircle, FileClock, ShieldAlert } from 'lucide-react';

import type { PortalDashboardPeriod } from '../../utils/portalDashboardFormat';

import {

  formatPortalDate,

  greetingForHour,

  firstName,

} from '../../utils/portalDashboardFormat';

import { cn } from '@/lib/utils';

import { dashType } from '@/lib/dashboardTypography';



const PERIODS: { id: PortalDashboardPeriod; label: string }[] = [

  { id: 'today', label: 'Today' },

  { id: 'week', label: 'This week' },

  { id: 'month', label: 'This month' },

];



export function PortalDashboardHeader({

  userName,

  email,

  pendingQuotes,

  customsHolds,

  period,

  onPeriodChange,

}: {

  userName?: string;

  email?: string;

  pendingQuotes: number;

  customsHolds: number;

  period: PortalDashboardPeriod;

  onPeriodChange: (period: PortalDashboardPeriod) => void;

}) {

  const hour = new Date().getHours();

  const quoteBit =

    pendingQuotes > 0

      ? `${pendingQuotes} quotation${pendingQuotes === 1 ? '' : 's'} awaiting your approval`

      : 'No quotations awaiting approval';

  const customsBit =

    customsHolds > 0

      ? `${customsHolds} shipment${customsHolds === 1 ? '' : 's'} held at customs`

      : 'no shipments held at customs';



  return (

    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

      <div className="min-w-0">

        <p className={dashType.header.date}>{formatPortalDate()}</p>

        <h1 className={dashType.header.title}>

          {greetingForHour(hour)}, {firstName(userName, email)}

        </h1>

        <p className={dashType.header.subtitle}>

          {quoteBit} and {customsBit}.

        </p>

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



export function PortalDashboardAlertPills({

  customsHold,

  docsPending,

  invoicesOverdue,

}: {

  customsHold: number;

  docsPending: number;

  invoicesOverdue: number;

}) {

  return (

    <div className="flex flex-wrap gap-2">

      <AlertPill

        label="Held at customs"

        count={customsHold}

        tone="orange"

        to="/portal/shipments"

        Icon={ShieldAlert}

      />

      <AlertPill

        label={docsPending === 1 ? 'Document missing' : 'Documents missing'}

        count={docsPending}

        tone="rose"

        to="/portal/documents"

        Icon={FileClock}

      />

      <AlertPill

        label={invoicesOverdue === 1 ? 'Invoice overdue' : 'Invoices overdue'}

        count={invoicesOverdue}

        tone="peach"

        to="/portal/invoices"

        Icon={AlertCircle}

      />

    </div>

  );

}



function AlertPill({

  label,

  count,

  tone,

  to,

  Icon,

}: {

  label: string;

  count: number;

  tone: 'orange' | 'rose' | 'peach';

  to: string;

  Icon: typeof ShieldAlert;

}) {

  const tones = {

    orange: 'bg-[#FFF1E6] text-[#C7590F]',

    rose: 'bg-[#FCEBEC] text-[#C6303E]',

    peach: 'bg-[#FFF6ED] text-[#B7791F]',

  };



  return (

    <Link to={to} className={cn(dashType.alertPill.base, tones[tone])}>

      <Icon size={14} strokeWidth={2.25} className="shrink-0 opacity-90" aria-hidden="true" />

      {label}

      <span className={dashType.alertPill.count}>{count}</span>

    </Link>

  );

}


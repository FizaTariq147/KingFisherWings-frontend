import {
  CalendarClock,
  ClipboardList,
  FileText,
  HandCoins,
  Landmark,
  Receipt,
  Scale,
  ScrollText,
  User,
  Wallet,
} from 'lucide-react';

export const VENDOR_NAV = [
  { label: 'Home', to: '/vendor', Icon: ClipboardList },
  { label: 'Invoices', to: '/vendor/invoices', Icon: FileText },
  { label: 'Payments', to: '/vendor/payments', Icon: HandCoins },
  { label: 'Advances', to: '/vendor/advances', Icon: Landmark },
  { label: 'Credit notes', to: '/vendor/credit-notes', Icon: Receipt },
  { label: 'Schedule', to: '/vendor/schedule', Icon: CalendarClock },
  { label: 'Statement', to: '/vendor/credit', Icon: Wallet },
  { label: 'Payment requests', to: '/vendor/payment-requests', Icon: ScrollText },
  { label: 'Disputes', to: '/vendor/disputes', Icon: Scale },
  { label: 'TDS', to: '/vendor/tds', Icon: FileText },
  { label: 'Account', to: '/vendor/account', Icon: User },
] as const;

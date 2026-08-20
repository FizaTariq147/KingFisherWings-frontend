import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  FileText,
  HandCoins,
  Home,
  Landmark,
  Percent,
  Receipt,
  Scale,
  ScrollText,
  User,
  Wallet,
} from 'lucide-react';

export interface VendorNavIconStyle {
  bg: string;
  color: string;
}

export interface VendorNavItem {
  label: string;
  to: string;
  Icon: LucideIcon;
  iconStyle: VendorNavIconStyle;
}

export interface VendorNavSection {
  id: string;
  title: string;
  color: string;
  items: VendorNavItem[];
}

function navStyle(color: string): VendorNavIconStyle {
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return { color, bg: `rgba(${r}, ${g}, ${b}, 0.2)` };
}

export const VENDOR_NAV_SECTIONS: VendorNavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    color: '#FF751F',
    items: [{ label: 'Home', to: '/vendor', Icon: Home, iconStyle: navStyle('#FF751F') }],
  },
  {
    id: 'billing',
    title: 'Billing',
    color: '#A3E635',
    items: [
      { label: 'Invoices', to: '/vendor/invoices', Icon: FileText, iconStyle: navStyle('#059669') },
      { label: 'Payments', to: '/vendor/payments', Icon: HandCoins, iconStyle: navStyle('#CA8A04') },
      { label: 'Advances', to: '/vendor/advances', Icon: Landmark, iconStyle: navStyle('#818CF8') },
      { label: 'Credit notes', to: '/vendor/credit-notes', Icon: Receipt, iconStyle: navStyle('#22D3EE') },
      { label: 'Schedule', to: '/vendor/schedule', Icon: CalendarClock, iconStyle: navStyle('#60A5FA') },
      { label: 'Statement', to: '/vendor/credit', Icon: Wallet, iconStyle: navStyle('#DB2777') },
      { label: '% TDS', to: '/vendor/tds', Icon: Percent, iconStyle: navStyle('#14B8A6') },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    color: '#C4B5FD',
    items: [
      {
        label: 'Payment requests',
        to: '/vendor/payment-requests',
        Icon: ScrollText,
        iconStyle: navStyle('#FACC15'),
      },
      { label: 'Disputes', to: '/vendor/disputes', Icon: Scale, iconStyle: navStyle('#F43F5E') },
      { label: 'Account', to: '/vendor/account', Icon: User, iconStyle: navStyle('#06B6D4') },
    ],
  },
];

export const VENDOR_NAV = VENDOR_NAV_SECTIONS.flatMap((section) => section.items);

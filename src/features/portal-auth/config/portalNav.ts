import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  ClipboardList,
  CircleDollarSign,
  FileText,
  HandCoins,
  MessageSquare,
  Package,
  Receipt,
  Route,
  Scale,
  User,
  Wallet,
} from 'lucide-react';

export interface PortalNavIconStyle {
  bg: string;
  color: string;
}

export interface PortalNavItem {
  label: string;
  to: string;
  Icon: LucideIcon;
  iconStyle: PortalNavIconStyle;
}

export interface PortalNavSection {
  id: string;
  title: string;
  color: string;
  items: PortalNavItem[];
}

function navStyle(color: string): PortalNavIconStyle {
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return { color, bg: `rgba(${r}, ${g}, ${b}, 0.2)` };
}

export const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    color: '#FF751F',
    items: [
      { label: 'Dashboard', to: '/portal', Icon: ClipboardList, iconStyle: navStyle('#FF751F') },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    color: '#67E8F9',
    items: [
      { label: 'Book', to: '/portal/book', Icon: BookOpen, iconStyle: navStyle('#818CF8') },
      { label: 'Track', to: '/portal/track', Icon: Route, iconStyle: navStyle('#60A5FA') },
      { label: 'Shipments', to: '/portal/shipments', Icon: Package, iconStyle: navStyle('#14B8A6') },
      { label: 'Quotes', to: '/portal/quotes', Icon: Bell, iconStyle: navStyle('#FACC15') },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    color: '#A3E635',
    items: [
      { label: 'Invoices', to: '/portal/invoices', Icon: FileText, iconStyle: navStyle('#059669') },
      { label: 'Credit notes', to: '/portal/credit-notes', Icon: Receipt, iconStyle: navStyle('#22D3EE') },
      { label: 'Debit notes', to: '/portal/debit-notes', Icon: Receipt, iconStyle: navStyle('#9333EA') },
      { label: 'Payments', to: '/portal/payments', Icon: HandCoins, iconStyle: navStyle('#CA8A04') },
      { label: 'Credit', to: '/portal/credit', Icon: Wallet, iconStyle: navStyle('#DB2777') },
      {
        label: 'Credit requests',
        to: '/portal/credit-requests',
        Icon: CircleDollarSign,
        iconStyle: navStyle('#4ADE80'),
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    color: '#C4B5FD',
    items: [
      { label: 'Documents', to: '/portal/documents', Icon: FileText, iconStyle: navStyle('#64748B') },
      { label: 'Messages', to: '/portal/messages', Icon: MessageSquare, iconStyle: navStyle('#E879F9') },
      { label: 'Disputes', to: '/portal/disputes', Icon: Scale, iconStyle: navStyle('#F43F5E') },
      { label: 'Alerts', to: '/portal/alerts', Icon: Bell, iconStyle: navStyle('#FF751F') },
      { label: 'Account', to: '/portal/account', Icon: User, iconStyle: navStyle('#06B6D4') },
    ],
  },
];

export const PORTAL_FLAT_NAV = PORTAL_NAV_SECTIONS.flatMap((section) => section.items);

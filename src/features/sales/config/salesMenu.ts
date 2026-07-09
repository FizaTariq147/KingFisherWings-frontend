import {
  Phone,
  ArrowRight,
  ThumbsUp,
  DollarSign,
  Wallet,
  Gauge,
  ListChecks,
  IdCard,
  FileText,
} from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const salesMenu: MenuTile[] = [
  {
    id: 'call-sheet',
    title: 'Call Sheet',
    description: 'To create and view call sheet by salesman wise, customer wise and call sheet purpose by using this option.',
    icon: Phone,
    iconColor: 'bg-sky-500',
    path: '/sales/call-sheet',
  },
  {
    id: 'client-request-list',
    title: 'Client Request List',
    description: 'To view the organization list which created by the current user.',
    icon: ArrowRight,
    iconColor: 'bg-sky-500',
    path: '/sales/client-request-list',
  },
  {
    id: 'lead',
    title: 'Lead',
    description: 'To create and view leads by customer name wise, status wise and lead source, by using this option.',
    icon: ThumbsUp,
    iconColor: 'bg-emerald-500',
    path: '/sales/lead',
  },
  {
    id: 'rate-charges',
    title: 'Rate Charges',
    description: 'To maintain rate charges details such as owner, carrier, client, port details, currency rate and min / max currency rates.',
    icon: DollarSign,
    iconColor: 'bg-emerald-500',
    path: '/sales/rate-charges',
  },
  {
    id: 'sales-budget',
    title: 'Sales Budget',
    description: 'To maintain sales budget for a year such as salesperson wise, amount with foreign currencies and etc..',
    icon: Wallet,
    iconColor: 'bg-lime-500',
    path: '/sales/sales-budget',
  },
  {
    id: 'sales-dashboard',
    title: 'Sales Dashboard',
    description: 'This dashboard will show each customer wise performance.',
    icon: Gauge,
    iconColor: 'bg-yellow-500',
    path: '/sales/sales-dashboard',
  },
  {
    id: 'shipments-list-sales',
    title: 'Shipments List-Sales',
    description: 'The list of users can view based on mapped Employee users list.',
    icon: ListChecks,
    iconColor: 'bg-amber-500',
    path: '/sales/shipments-list',
  },
  {
    id: 'visiting-card-list-report',
    title: 'Visiting Card List Report',
    description: 'The Visiting Card Scanner enables users to scan business card images using AI-based data extraction. The extracted contact information is automatically captured and saved against the',
    icon: IdCard,
    iconColor: 'bg-orange-600',
    path: '/sales/visiting-card-list',
  },
];

// Rendered separately with a distinct centered layout, same pattern as Reports - Quotation
export const reportsSalesTile: MenuTile = {
  id: 'reports-sales',
  title: 'Reports - Sales',
  description: 'To view sales man call history, Sales man wise profitability and all sales related report by using this option.',
  icon: FileText,
  iconColor: 'bg-sky-500',
  path: '/sales/reports',
};
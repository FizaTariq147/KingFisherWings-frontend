import { FileText, AlertTriangle, Receipt, ShoppingCart, HandCoins } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

/** Finance hub — modules only; create actions live on each list page. */
export const financeMenu: MenuTile[] = [
  {
    id: 'all-invoices',
    title: 'All Invoices',
    description: 'List and filter customer invoices by status, type, party, and date.',
    icon: FileText,
    iconColor: 'bg-sky-500',
    path: '/invoices',
  },
  {
    id: 'overdue-invoices',
    title: 'Overdue',
    description: 'Invoices past due date with outstanding balance.',
    icon: AlertTriangle,
    iconColor: 'bg-amber-500',
    path: '/invoices/overdue',
  },
  {
    id: 'all-purchase-invoices',
    title: 'All Purchase Invoices',
    description: 'List and filter vendor purchase invoices by status, type, and date.',
    icon: ShoppingCart,
    iconColor: 'bg-indigo-500',
    path: '/purchase-invoices',
  },
  {
    id: 'all-credit-notes',
    title: 'All Credit Notes',
    description: 'List and filter credit notes by status, type, and date.',
    icon: Receipt,
    iconColor: 'bg-teal-500',
    path: '/credit-notes',
  },
  {
    id: 'all-payment-requests',
    title: 'Payment Requests',
    description: 'Create, approve, reject, and mark payment requests as paid.',
    icon: HandCoins,
    iconColor: 'bg-orange-500',
    path: '/payment-requests',
  },
];

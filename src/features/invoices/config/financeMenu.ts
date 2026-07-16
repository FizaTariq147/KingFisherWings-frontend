import { FileText, AlertTriangle, Plus, Receipt, ShoppingCart, HandCoins } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

/** Finance hub — AR/AP documents. GL lives under Accounts. */
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
    id: 'new-invoice',
    title: 'New Invoice',
    description: 'Create a draft customer invoice.',
    icon: Plus,
    iconColor: 'bg-emerald-500',
    path: '/invoices/new',
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
    id: 'new-purchase-invoice',
    title: 'New Purchase Invoice',
    description: 'Create a draft purchase invoice for a supplier.',
    icon: Plus,
    iconColor: 'bg-violet-500',
    path: '/purchase-invoices/new',
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
    id: 'new-credit-note',
    title: 'New Credit Note',
    description: 'Create a credit note against a posted customer invoice.',
    icon: Plus,
    iconColor: 'bg-cyan-500',
    path: '/credit-notes/new',
  },
  {
    id: 'all-payment-requests',
    title: 'Payment Requests',
    description: 'Create, approve, reject, and mark payment requests as paid.',
    icon: HandCoins,
    iconColor: 'bg-orange-500',
    path: '/payment-requests',
  },
  {
    id: 'new-payment-request',
    title: 'New Payment Request',
    description: 'Request a payment against a party (optional invoice/job).',
    icon: Plus,
    iconColor: 'bg-amber-500',
    path: '/payment-requests/new',
  },
];

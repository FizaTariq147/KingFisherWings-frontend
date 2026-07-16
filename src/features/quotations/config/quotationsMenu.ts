import { Copy, Image, ArrowUpDown, FileText } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const quotationsMenu: MenuTile[] = [
  {
    id: 'all-quotations',
    title: 'All Quotations',
    description: 'To view all the quotation details such as segment wise, service wise and quotation status by using this option.',
    icon: Copy,
    iconColor: 'bg-sky-500',
    path: '/quotations/all',
  },
  {
    id: 'online-quote',
    title: 'Online Quote',
    description: 'Tariff auto-calc online quote widget (POST /quotations/online-quote).',
    icon: FileText,
    iconColor: 'bg-violet-500',
    path: '/quotations/online-quote',
  },
  {
    id: 'online-tariff-master',
    title: 'Online Tariff Master',
    description: 'To maintain quote charges with sale cost and charges details',
    icon: Image,
    iconColor: 'bg-sky-500',
    path: '/quotations/tariff-master',
  },
  {
    id: 'zip-distance-master',
    title: 'Zip Distance Master',
    description: 'To maintain zip distances between the locations.',
    icon: ArrowUpDown,
    iconColor: 'bg-emerald-500',
    path: '/quotations/zip-distance-master',
  },
];

// Rendered separately with a distinct centered layout
export const reportsQuotationTile: MenuTile = {
  id: 'reports-quotation',
  title: 'Reports - Quotation',
  description: 'To view all reports in quotation module',
  icon: FileText,
  iconColor: 'bg-sky-500',
  path: '/quotations/reports',
};
import { FileText, MessageCircle, DatabaseBackup, Gauge, User, Users, FileBarChart } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const managementMenu: MenuTile[] = [
  {
    id: 'all-jobs-mis',
    title: 'All Jobs-MIS',
    description: 'To view all the job list by report segment wise, job no wise, sales man wise and costing details.',
    icon: FileText,
    iconColor: 'bg-sky-500',
    path: '/management/all-jobs-mis',
  },
  {
    id: 'complaints',
    title: 'Complaints',
    description: 'To manage all the complaints registered by users',
    icon: MessageCircle,
    iconColor: 'bg-sky-500',
    path: '/management/complaints',
  },
  {
    id: 'data-backup-export',
    title: 'Data Backup Export',
    description: 'To Download a Backup of Master data and Transactions in Excel / CSV formats.',
    icon: DatabaseBackup,
    iconColor: 'bg-emerald-500',
    path: '/management/data-backup-export',
  },
  {
    id: 'management-dashboard',
    title: 'Management Dashboard',
    description: 'To view dashboard sales wise (Services), GP wise (Sales, Customer, Salesperson, Origin, Port) with graphical representation model.',
    icon: Gauge,
    iconColor: 'bg-emerald-500',
    path: '/management/management-dashboard',
  },
  {
    id: 'management-dashboard-reports',
    title: 'Management Dashboard Reports',
    description: 'To view Open Job Status, Open Leads, Open Enquiry Report, Invoice Status Report, Daily Job Summary, Current Month GP Statistics (Pie-Chart), Pending Claims,Accounts Receivable',
    icon: Gauge,
    iconColor: 'bg-emerald-500',
    path: '/management/management-dashboard/reports',
  },
  {
    id: 'user-access',
    title: 'User Access',
    description: 'To provide module access to the users',
    icon: User,
    iconColor: 'bg-yellow-500',
    path: '/management/user-access',
  },
  {
    id: 'user-wise-performance',
    title: 'User wise performance',
    description: 'To view each and every user wise performance, Like All Enquiry, Quotation, Shipments, Jobs and voucher creation by every individual active users.',
    icon: Users,
    iconColor: 'bg-yellow-500',
    path: '/management/user-wise-performance',
  },
];

// Rendered separately with the centered layout, same pattern as other Reports tiles
export const reportsMisTile: MenuTile = {
  id: 'reports-mis',
  title: 'Reports - MIS',
  description: 'To view profitability by customer wise salesman wise, trade lane wise and view all the jobs list by using this option.',
  icon: FileBarChart,
  iconColor: 'bg-sky-500',
  path: '/management/reports',
};
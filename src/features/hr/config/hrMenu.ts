import { UserCog, UserCheck, CreditCard, Upload, User } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const hrMenu: MenuTile[] = [
  {
    id: 'employee-master',
    title: 'Employee Master',
    description: 'To maintain employees details such as employee name, Designation, Address, Contacts, Roles, Personal details and etc.',
    icon: UserCog,
    iconColor: 'bg-sky-500',
    path: '/hr/employee-master',
  },
  {
    id: 'leave-request',
    title: 'Leave Request',
    description: "A request for your supervisor's assistance in helping you to negotiate the leave of absence process with senior management and / or your",
    icon: UserCheck,
    iconColor: 'bg-sky-500',
    path: '/hr/leave-request',
  },
  {
    id: 'pay-roll',
    title: 'Pay Roll',
    description: 'To maintain employees payroll details such as salaries, bonus, working days, payment mode and etc.',
    icon: CreditCard,
    iconColor: 'bg-emerald-500',
    path: '/hr/pay-roll',
  },
  {
    id: 'salary-upload-payroll',
    title: 'Salary Upload - Payroll',
    description: 'User can upload the salary thru CSV file, based on the configured header.',
    icon: Upload,
    iconColor: 'bg-emerald-500',
    path: '/hr/salary-upload',
  },
];

// Rendered separately with the centered layout, same pattern as Reports - Quotation / Reports - Sales
export const reportsHrTile: MenuTile = {
  id: 'reports-hr',
  title: 'Reports - HR',
  description: 'To view employees documents verification, total working hours and timesheet reports.',
  icon: User,
  iconColor: 'bg-sky-500',
  path: '/hr/reports',
};
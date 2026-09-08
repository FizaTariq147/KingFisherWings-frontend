import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Calculator,
  ClipboardList,
  Eye,
  FileText,
  Headphones,
  Shield,
  ShoppingCart,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from 'lucide-react';
import type { UserRole } from './user.constants';
import { ASSIGNABLE_USER_ROLES } from './user.constants';

export const USER_WIZARD_STEPS = [
  { key: 'role', label: 'Role' },
  { key: 'details', label: 'User Details' },
  { key: 'permissions', label: 'Permissions' },
] as const;

export type UserRoleCardStyle = {
  icon: LucideIcon;
  circleClass: string;
  hoverClass: string;
};

const DEFAULT_ROLE_STYLE: UserRoleCardStyle = {
  icon: Briefcase,
  circleClass: 'bg-neutral-500',
  hoverClass: 'hover:bg-neutral-50 hover:border-neutral-300',
};

export const USER_ROLE_CARD_STYLES: Partial<Record<UserRole, UserRoleCardStyle>> = {
  BRANCH_MANAGER: {
    icon: Shield,
    circleClass: 'bg-indigo-600',
    hoverClass: 'hover:bg-indigo-50 hover:border-indigo-300',
  },
  FINANCE_MANAGER: {
    icon: Calculator,
    circleClass: 'bg-emerald-700',
    hoverClass: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
  ACCOUNTANT: {
    icon: Calculator,
    circleClass: 'bg-emerald-600',
    hoverClass: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
  SALES_MANAGER: {
    icon: ShoppingCart,
    circleClass: 'bg-sky-700',
    hoverClass: 'hover:bg-sky-50 hover:border-sky-300',
  },
  SALES_EXECUTIVE: {
    icon: ShoppingCart,
    circleClass: 'bg-sky-600',
    hoverClass: 'hover:bg-sky-50 hover:border-sky-300',
  },
  OPERATIONS_MANAGER: {
    icon: ClipboardList,
    circleClass: 'bg-amber-700',
    hoverClass: 'hover:bg-amber-50 hover:border-amber-300',
  },
  OPERATIONS_EXECUTIVE: {
    icon: ClipboardList,
    circleClass: 'bg-amber-600',
    hoverClass: 'hover:bg-amber-50 hover:border-amber-300',
  },
  WAREHOUSE_STAFF: {
    icon: Warehouse,
    circleClass: 'bg-slate-600',
    hoverClass: 'hover:bg-slate-50 hover:border-slate-300',
  },
  HR_MANAGER: {
    icon: Users,
    circleClass: 'bg-violet-600',
    hoverClass: 'hover:bg-violet-50 hover:border-violet-300',
  },
  CUSTOMER: {
    icon: UserCheck,
    circleClass: 'bg-teal-600',
    hoverClass: 'hover:bg-teal-50 hover:border-teal-300',
  },
  AGENT: {
    icon: Briefcase,
    circleClass: 'bg-cyan-700',
    hoverClass: 'hover:bg-cyan-50 hover:border-cyan-300',
  },
  READ_ONLY: {
    icon: Eye,
    circleClass: 'bg-neutral-500',
    hoverClass: 'hover:bg-neutral-50 hover:border-neutral-300',
  },
  DOCUMENTATION: {
    icon: FileText,
    circleClass: 'bg-orange-600',
    hoverClass: 'hover:bg-orange-50 hover:border-orange-300',
  },
  CUSTOMER_SUPPORT: {
    icon: Headphones,
    circleClass: 'bg-pink-600',
    hoverClass: 'hover:bg-pink-50 hover:border-pink-300',
  },
  DRIVER: {
    icon: Truck,
    circleClass: 'bg-lime-700',
    hoverClass: 'hover:bg-lime-50 hover:border-lime-300',
  },
};

export function getUserRoleCardStyle(role: UserRole): UserRoleCardStyle {
  return USER_ROLE_CARD_STYLES[role] ?? DEFAULT_ROLE_STYLE;
}

export const USER_WIZARD_ROLES = ASSIGNABLE_USER_ROLES;

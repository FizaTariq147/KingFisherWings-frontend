import { Building2, KeyRound, Ruler, Shield, UserCircle, MonitorSmartphone, Webhook } from 'lucide-react';
import type { MenuTile } from '@/features/customers/types/menu.types';

/** Settings hub — account, security, and workspace configuration. */
export const settingsMenu: MenuTile[] = [
  {
    id: 'my-profile',
    title: 'My Profile',
    description: 'View account details and preferred country / locale settings.',
    icon: UserCircle,
    iconColor: 'bg-sky-600',
    path: '/profile',
  },
  {
    id: 'sessions',
    title: 'Active Sessions',
    description: 'Review and revoke devices signed in to your account.',
    icon: MonitorSmartphone,
    iconColor: 'bg-indigo-600',
    path: '/settings/sessions',
  },
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'Update your sign-in password for this workspace.',
    icon: KeyRound,
    iconColor: 'bg-amber-600',
    path: '/change-password',
  },
  {
    id: 'login-security',
    title: 'Login Security',
    description: 'Configure IP, MAC, and office-hours restrictions per user.',
    icon: Shield,
    iconColor: 'bg-rose-600',
    path: '/settings/login-security',
  },
  {
    id: 'public-api',
    title: 'Public API',
    description: 'API keys, webhooks, and billing for external /api/v1 clients.',
    icon: Webhook,
    iconColor: 'bg-violet-600',
    path: '/settings/public-api',
  },
  {
    id: 'tools',
    title: 'Unit converters',
    description: 'Length, weight, liquid, CBM, and volume tools.',
    icon: Ruler,
    iconColor: 'bg-teal-600',
    path: '/settings/tools',
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Tenant profile, bank accounts, and document number formats.',
    icon: Building2,
    iconColor: 'bg-teal-600',
    path: '/organization',
  },
];

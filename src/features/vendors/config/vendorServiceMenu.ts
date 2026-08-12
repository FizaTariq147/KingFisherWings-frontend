import { Scale, Users } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const vendorServiceMenu: MenuTile[] = [
  {
    id: 'vendor-admin-disputes',
    title: 'Vendor Disputes',
    description: 'Review and resolve disputes raised from the Vendor Payment Portal.',
    icon: Scale,
    iconColor: 'bg-rose-500',
    path: '/vendor-admin/disputes',
  },
  {
    id: 'vendor-portal-users',
    title: 'Vendor Portal Users',
    description: 'Tenant-wide list of vendor portal logins (invite from party detail).',
    icon: Users,
    iconColor: 'bg-violet-500',
    path: '/vendor-users',
  },
];

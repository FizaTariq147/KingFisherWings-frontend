import { Navigate, useParams } from 'react-router-dom';
import { FileText, Inbox, MessageSquare, Package } from 'lucide-react';
import { ModuleMenuShell } from '@/components/widgets/ModuleMenuShell';
import type { MenuTile } from '@/features/customers/types/menu.types';
import {
  departmentByKey,
  departmentChildPaths,
  type DepartmentNavKey,
} from '../config/departmentNav';

const TILE_META = {
  jobs: {
    id: 'jobs',
    title: 'Jobs',
    description: 'Open and manage jobs for this department.',
    icon: Package,
    iconColor: 'bg-sky-500',
  },
  quotations: {
    id: 'quotations',
    title: 'Quotations',
    description: 'Quotations filtered to this department’s job types.',
    icon: MessageSquare,
    iconColor: 'bg-indigo-500',
  },
  enquiries: {
    id: 'enquiries',
    title: 'Enquiries',
    description: 'CRM enquiries for this department’s service types.',
    icon: Inbox,
    iconColor: 'bg-violet-500',
  },
  shipments: {
    id: 'shipments',
    title: 'Shipments',
    description: 'Shipments linked to this department’s modes.',
    icon: FileText,
    iconColor: 'bg-emerald-500',
  },
} as const;

export default function DepartmentHubPage() {
  const { deptKey = '' } = useParams<{ deptKey: string }>();
  const dept = departmentByKey(deptKey);

  if (!dept || dept.useNativeMenu) {
    return <Navigate to={dept?.hubPath || '/dashboard'} replace />;
  }

  const paths = departmentChildPaths(dept);
  const tiles: MenuTile[] = [
    { ...TILE_META.jobs, path: paths.jobs },
    { ...TILE_META.shipments, path: paths.shipments },
    { ...TILE_META.enquiries, path: paths.enquiries },
    { ...TILE_META.quotations, path: paths.quotations },
  ];

  return (
    <ModuleMenuShell
      title={dept.label}
      tiles={tiles}
      viewStorageKey={`department-hub:${dept.key as DepartmentNavKey}`}
      className="bg-white"
    />
  );
}

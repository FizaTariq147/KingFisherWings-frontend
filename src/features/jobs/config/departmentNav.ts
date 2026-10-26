import type { JobType } from '../constants/job.constants';

/**
 * Operations departments shown in the sidebar.
 * Clicking a department (except NVOCC) opens a tile hub for Jobs / Quotations /
 * Enquiries / Shipments scoped to that mode. NVOCC keeps its own module menu.
 */
export type DepartmentNavKey =
  | 'air-export'
  | 'air-import'
  | 'sea-export'
  | 'sea-import'
  | 'road-freight'
  | 'customs-clearance'
  | 'nvocc';

export type DepartmentNavDef = {
  key: DepartmentNavKey;
  label: string;
  /** Sidebar / hub entry path. */
  hubPath: string;
  /** Job list route. */
  jobsPath: string;
  jobTypes: JobType[];
  /** Primary type when list APIs accept a single job_type / service_type. */
  primaryType: JobType;
  /** When true, sidebar opens the existing NVOCC module menu (not the 4-tile hub). */
  useNativeMenu?: boolean;
};

export const DEPARTMENT_NAV: DepartmentNavDef[] = [
  {
    key: 'air-export',
    label: 'Air Export',
    hubPath: '/departments/air-export',
    jobsPath: '/jobs/air-export',
    jobTypes: ['AIR_EXPORT'],
    primaryType: 'AIR_EXPORT',
  },
  {
    key: 'air-import',
    label: 'Air Import',
    hubPath: '/departments/air-import',
    jobsPath: '/jobs/air-import',
    jobTypes: ['AIR_IMPORT'],
    primaryType: 'AIR_IMPORT',
  },
  {
    key: 'sea-export',
    label: 'Sea Export',
    hubPath: '/departments/sea-export',
    jobsPath: '/jobs/sea-export',
    jobTypes: ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT'],
    primaryType: 'SEA_FCL_EXPORT',
  },
  {
    key: 'sea-import',
    label: 'Sea Import',
    hubPath: '/departments/sea-import',
    jobsPath: '/jobs/sea-import',
    jobTypes: ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT'],
    primaryType: 'SEA_FCL_IMPORT',
  },
  {
    key: 'road-freight',
    label: 'Road Freight',
    hubPath: '/departments/road-freight',
    jobsPath: '/jobs/road-freight',
    jobTypes: ['ROAD_FREIGHT', 'LAND', 'COURIER'],
    primaryType: 'ROAD_FREIGHT',
  },
  {
    key: 'customs-clearance',
    label: 'Customs Clearance',
    hubPath: '/departments/customs-clearance',
    jobsPath: '/jobs/customs-clearance',
    jobTypes: ['CUSTOMS_CLEARANCE'],
    primaryType: 'CUSTOMS_CLEARANCE',
  },
  {
    key: 'nvocc',
    label: 'NVOCC',
    hubPath: '/nvocc',
    jobsPath: '/nvocc/all-jobs',
    jobTypes: ['NVOCC_EXPORT', 'NVOCC_IMPORT'],
    primaryType: 'NVOCC_EXPORT',
    useNativeMenu: true,
  },
];

/** Departments that use the shared 4-tile hub (excludes NVOCC). */
export const DEPARTMENT_HUB_KEYS = DEPARTMENT_NAV.filter((d) => !d.useNativeMenu).map(
  (d) => d.key,
);

export function departmentByKey(key: string | null | undefined): DepartmentNavDef | undefined {
  if (!key) return undefined;
  return DEPARTMENT_NAV.find((d) => d.key === key);
}

export function departmentChildPaths(dept: DepartmentNavDef) {
  const q = `dept=${encodeURIComponent(dept.key)}`;
  return {
    jobs: dept.jobsPath,
    quotations: `/quotations/all?${q}`,
    enquiries: `/sales/enquiries?${q}`,
    shipments: `/operations/shipments?${q}`,
  };
}

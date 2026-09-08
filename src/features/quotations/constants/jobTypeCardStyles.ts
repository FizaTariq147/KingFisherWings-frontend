import type { LucideIcon } from 'lucide-react';
import { Globe, Plane, Ship, Truck, Warehouse, Package, Briefcase } from 'lucide-react';
import type { JobType } from './quotation.constants';

/** Short card labels (FRESA-style) — API values remain JOB_TYPES enums. */
export const JOB_TYPE_CARD_LABELS: Record<JobType, string> = {
  AIR_EXPORT: 'Air Export',
  AIR_IMPORT: 'Air Import',
  SEA_FCL_EXPORT: 'FCL Export',
  SEA_FCL_IMPORT: 'FCL Import',
  SEA_LCL_EXPORT: 'LCL Export',
  SEA_LCL_IMPORT: 'LCL Import',
  LAND: 'Land',
  COURIER: 'Courier',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  NVOCC_EXPORT: 'NVOCC Export',
  NVOCC_IMPORT: 'NVOCC Import',
  SERVICE_JOB: 'Service Job',
  WAREHOUSE: 'Warehouse',
};

export type JobTypeCardStyle = {
  icon: LucideIcon;
  /** Tailwind-safe background for the icon circle */
  circleClass: string;
  hoverClass: string;
};

export const JOB_TYPE_CARD_STYLES: Record<JobType, JobTypeCardStyle> = {
  AIR_EXPORT: {
    icon: Plane,
    circleClass: 'bg-sky-600',
    hoverClass: 'hover:bg-sky-50 hover:border-sky-300',
  },
  AIR_IMPORT: {
    icon: Plane,
    circleClass: 'bg-teal-600',
    hoverClass: 'hover:bg-teal-50 hover:border-teal-300',
  },
  CUSTOMS_CLEARANCE: {
    icon: Briefcase,
    circleClass: 'bg-cyan-700',
    hoverClass: 'hover:bg-cyan-50 hover:border-cyan-300',
  },
  SEA_FCL_EXPORT: {
    icon: Ship,
    circleClass: 'bg-emerald-600',
    hoverClass: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
  SEA_FCL_IMPORT: {
    icon: Ship,
    circleClass: 'bg-lime-700',
    hoverClass: 'hover:bg-lime-50 hover:border-lime-300',
  },
  SEA_LCL_EXPORT: {
    icon: Package,
    circleClass: 'bg-yellow-500',
    hoverClass: 'hover:bg-yellow-50 hover:border-yellow-300',
  },
  SEA_LCL_IMPORT: {
    icon: Package,
    circleClass: 'bg-amber-600',
    hoverClass: 'hover:bg-amber-50 hover:border-amber-300',
  },
  NVOCC_EXPORT: {
    icon: Ship,
    circleClass: 'bg-orange-500',
    hoverClass: 'hover:bg-orange-50 hover:border-orange-300',
  },
  NVOCC_IMPORT: {
    icon: Ship,
    circleClass: 'bg-orange-700',
    hoverClass: 'hover:bg-orange-50 hover:border-orange-400',
  },
  SERVICE_JOB: {
    icon: Globe,
    circleClass: 'bg-rose-600',
    hoverClass: 'hover:bg-rose-50 hover:border-rose-300',
  },
  LAND: {
    icon: Truck,
    circleClass: 'bg-violet-500',
    hoverClass: 'hover:bg-violet-50 hover:border-violet-300',
  },
  COURIER: {
    icon: Truck,
    circleClass: 'bg-purple-700',
    hoverClass: 'hover:bg-purple-50 hover:border-purple-300',
  },
  WAREHOUSE: {
    icon: Warehouse,
    circleClass: 'bg-slate-600',
    hoverClass: 'hover:bg-slate-50 hover:border-slate-300',
  },
};

export const QUOTATION_WIZARD_STEPS = [
  { key: 'create', label: 'Create Quotation' },
  { key: 'ports', label: 'Port Details' },
  { key: 'consignment', label: 'Container / Consignment' },
] as const;

export type QuotationWizardStepKey = (typeof QUOTATION_WIZARD_STEPS)[number]['key'];

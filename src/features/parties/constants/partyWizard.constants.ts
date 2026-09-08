import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Globe,
  Plane,
  Ship,
  Truck,
  Warehouse,
  Users,
  Briefcase,
  Package,
  Handshake,
} from 'lucide-react';
import type { PartyType } from './party.constants';

export const PARTY_WIZARD_STEPS = [
  { key: 'type', label: 'Party Type' },
  { key: 'details', label: 'Party Details' },
  { key: 'credit', label: 'Credit & Settings' },
] as const;

export type PartyTypeCardStyle = {
  icon: LucideIcon;
  circleClass: string;
  hoverClass: string;
};

export const PARTY_TYPE_CARD_STYLES: Record<PartyType, PartyTypeCardStyle> = {
  CUSTOMER: {
    icon: Users,
    circleClass: 'bg-sky-600',
    hoverClass: 'hover:bg-sky-50 hover:border-sky-300',
  },
  AGENT: {
    icon: Handshake,
    circleClass: 'bg-teal-600',
    hoverClass: 'hover:bg-teal-50 hover:border-teal-300',
  },
  AIRLINE: {
    icon: Plane,
    circleClass: 'bg-blue-600',
    hoverClass: 'hover:bg-blue-50 hover:border-blue-300',
  },
  SHIPPING_LINE: {
    icon: Ship,
    circleClass: 'bg-emerald-600',
    hoverClass: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
  TRUCKER: {
    icon: Truck,
    circleClass: 'bg-amber-600',
    hoverClass: 'hover:bg-amber-50 hover:border-amber-300',
  },
  CUSTOMS_BROKER: {
    icon: Briefcase,
    circleClass: 'bg-cyan-700',
    hoverClass: 'hover:bg-cyan-50 hover:border-cyan-300',
  },
  CFS_PORT_AGENT: {
    icon: Package,
    circleClass: 'bg-lime-700',
    hoverClass: 'hover:bg-lime-50 hover:border-lime-300',
  },
  WAREHOUSE: {
    icon: Warehouse,
    circleClass: 'bg-slate-600',
    hoverClass: 'hover:bg-slate-50 hover:border-slate-300',
  },
  SUPPLIER: {
    icon: Building2,
    circleClass: 'bg-orange-500',
    hoverClass: 'hover:bg-orange-50 hover:border-orange-300',
  },
  VENDOR: {
    icon: Building2,
    circleClass: 'bg-orange-700',
    hoverClass: 'hover:bg-orange-50 hover:border-orange-400',
  },
  OVERSEAS_AGENT: {
    icon: Globe,
    circleClass: 'bg-violet-600',
    hoverClass: 'hover:bg-violet-50 hover:border-violet-300',
  },
  OTHER: {
    icon: Briefcase,
    circleClass: 'bg-neutral-500',
    hoverClass: 'hover:bg-neutral-50 hover:border-neutral-300',
  },
};

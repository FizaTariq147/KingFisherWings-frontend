import {
  Package,
  Settings,
  ClipboardList,
  PackagePlus,
  PackageMinus,
  Boxes,
  Calculator,
} from 'lucide-react';
import type { MenuTile } from '@/features/customers/types/menu.types';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';

export const wmsMenu: MenuTile[] = [
  {
    id: 'wms-settings',
    title: 'WMS Settings',
    description: 'Valuation method, default free days, storage rate, and currency.',
    icon: Settings,
    iconColor: 'bg-slate-500',
    path: `${WMS_ROUTE_PREFIX}/settings`,
  },
  {
    id: 'wms-items',
    title: 'WMS Items',
    description: 'SKU master with codes, UOM, and low-stock thresholds.',
    icon: Package,
    iconColor: 'bg-cyan-500',
    path: `${WMS_ROUTE_PREFIX}/items`,
  },
  {
    id: 'wms-asn',
    title: 'WMS ASN',
    description: 'Advance shipment notices for expected inbound stock.',
    icon: ClipboardList,
    iconColor: 'bg-sky-500',
    path: `${WMS_ROUTE_PREFIX}/asns`,
  },
  {
    id: 'wms-grn',
    title: 'WMS GRN',
    description: 'Goods received notes to post inbound stock to lots.',
    icon: PackagePlus,
    iconColor: 'bg-emerald-500',
    path: `${WMS_ROUTE_PREFIX}/grns`,
  },
  {
    id: 'wms-gdo',
    title: 'WMS GDO',
    description: 'Goods dispatch orders to consume stock FIFO or LIFO.',
    icon: PackageMinus,
    iconColor: 'bg-orange-500',
    path: `${WMS_ROUTE_PREFIX}/gdos`,
  },
  {
    id: 'wms-stock',
    title: 'WMS Stock',
    description: 'On-hand, movements, low stock, lot aging, adjustments, transfers.',
    icon: Boxes,
    iconColor: 'bg-violet-500',
    path: `${WMS_ROUTE_PREFIX}/stock`,
  },
  {
    id: 'wms-storage',
    title: 'WMS Storage',
    description: 'Calculate storage charges and create draft invoices.',
    icon: Calculator,
    iconColor: 'bg-amber-500',
    path: `${WMS_ROUTE_PREFIX}/storage`,
  },
];

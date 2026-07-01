import { lazy, type ComponentType } from 'react'
import type { WidgetId, FinancialVisibility } from '@/types/homepage.types'

export interface WidgetMeta {
  id:          WidgetId
  label:       string
  /** If true, widget is hidden unless matching financialVisibility flag is true */
  financial?:  keyof FinancialVisibility
  Component:   ComponentType
}

// Lazy-load each widget so they don't block the initial dashboard render
const WIDGET_REGISTRY: Record<WidgetId, WidgetMeta> = {
  open_jobs: {
    id: 'open_jobs', label: 'Open Jobs',
    Component: lazy(() => import('../widgets/OpenJobsWidget.tsx')),
  },
  pending_quotations: {
    id: 'pending_quotations', label: 'Pending Quotations',
    Component: lazy(() => import('../widgets/PendingQuotationsWidget.tsx')),
  },
  revenue_mtd: {
    id: 'revenue_mtd', label: 'Revenue MTD',
    financial: 'canSeeRevenue',
    Component: lazy(() => import('../widgets/RevenueMTDWidget.tsx')),
  },
  gp_mtd: {
    id: 'gp_mtd', label: 'GP MTD',
    financial: 'canSeeGP',
    Component: lazy(() => import('../widgets/RevenueMTDWidget.tsx')),
  },
  ar_balance: {
    id: 'ar_balance', label: 'AR Balance',
    financial: 'canSeeARBalance',
    Component: lazy(() => import('../widgets/RevenueMTDWidget.tsx')),
  },
  ap_balance: {
    id: 'ap_balance', label: 'AP Balance',
    financial: 'canSeeAPBalance',
    Component: lazy(() => import('../widgets/RevenueMTDWidget.tsx')),
  },
  shipments_by_mode: {
    id: 'shipments_by_mode', label: 'Shipments by Mode',
    Component: lazy(() => import('../widgets/ShipmentsByModeWidget.tsx')),
  },
  upcoming_etds: {
    id: 'upcoming_etds', label: 'Upcoming ETDs',
    Component: lazy(() => import('../widgets/UpcomingEtdsWidget.tsx')),
  },
  pending_tasks: {
    id: 'pending_tasks', label: 'Pending Tasks',
    Component: lazy(() => import('../widgets/PendingTasksWidget.tsx')),
  },
  recent_jobs: {
    id: 'recent_jobs', label: 'Recent Jobs',
    Component: lazy(() => import('../widgets/RecentJobsWidget.tsx')),
  },
}

export function getWidgetMeta(id: WidgetId): WidgetMeta | undefined {
  return WIDGET_REGISTRY[id]
}
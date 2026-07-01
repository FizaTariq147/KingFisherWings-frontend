import type { HomepageConfig } from '@/types/homepage.types'

export const DEFAULT_HOMEPAGE_CONFIG: Omit<HomepageConfig, 'userId'> = {
  columns: 3,
  financialVisibility: {
    canSeeRevenue:   false,
    canSeeGP:        false,
    canSeeARBalance: false,
    canSeeAPBalance: false,
  },
  widgets: [
    { id: 'open_jobs',           visible: true,  position: 0, size: 'half' },
    { id: 'pending_quotations',  visible: true,  position: 1, size: 'half' },
    { id: 'revenue_mtd',         visible: false, position: 2, size: 'half' },
    { id: 'gp_mtd',              visible: false, position: 3, size: 'half' },
    { id: 'ar_balance',          visible: false, position: 4, size: 'half' },
    { id: 'ap_balance',          visible: false, position: 5, size: 'half' },
    { id: 'shipments_by_mode',   visible: true,  position: 6, size: 'full' },
    { id: 'upcoming_etds',       visible: true,  position: 7, size: 'half' },
    { id: 'pending_tasks',       visible: true,  position: 8, size: 'half' },
    { id: 'recent_jobs',         visible: true,  position: 9, size: 'full' },
  ],
}
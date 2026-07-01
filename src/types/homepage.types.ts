// ── Widget identifiers — must match backend enum exactly ──────────────────
export type WidgetId =
  | 'open_jobs'
  | 'pending_quotations'
  | 'revenue_mtd'
  | 'gp_mtd'
  | 'ar_balance'
  | 'ap_balance'
  | 'shipments_by_mode'
  | 'upcoming_etds'
  | 'pending_tasks'
  | 'recent_jobs'

// Controls which financial widgets are visible (mirrors auth permissions)
export interface FinancialVisibility {
  canSeeRevenue:    boolean
  canSeeGP:         boolean
  canSeeARBalance:  boolean
  canSeeAPBalance:  boolean
}

export interface WidgetConfig {
  id:       WidgetId
  visible:  boolean
  position: number   // 0-based order in the grid
  /** Optional: 'half' = col-span-1, 'full' = col-span-2. Defaults to 'half' */
  size?:    'half' | 'full'
}

export interface HomepageConfig {
  userId:             string
  columns:            2 | 3 | 4
  widgets:            WidgetConfig[]
  financialVisibility: FinancialVisibility
}

// Shape returned by GET /users/:id/homepage-config
export interface HomepageConfigResponse {
  config: HomepageConfig | null   // null = use default
}

// Shape sent by PATCH /users/:id/homepage-config
export interface HomepageConfigPayload {
  columns?: HomepageConfig['columns']
  widgets?: WidgetConfig[]
}
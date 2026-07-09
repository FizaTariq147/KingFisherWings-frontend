/**
 * Maps URL path segments → human-readable breadcrumb labels.
 *
 * Rules:
 * - Keys are individual path segments (lowercase, no slashes)
 * - Dynamic segments (e.g. :id) are resolved at runtime via
 *   routeLabelResolvers below — static labels here act as fallback
 * - Unmapped segments are title-cased automatically
 */
export const ROUTE_LABELS: Record<string, string> = {
  // ── Top-level ────────────────────────────────────────────────────────
  dashboard:     'Dashboard',
  customers:     'Customers',
  quotations:    'Quotations',
  documentation: 'Documentation',
  finance:       'Finance',
  nvocc:         'NVOCC',
  hr:            'HR & Payroll',
  masters:       'Masters',
  reports:       'Reports',
  settings:      'Settings',
  notifications: 'Notifications',
  profile:       'My Profile',

  // ── Jobs ─────────────────────────────────────────────────────────────
  jobs:          'Jobs',
  'air-export':  'Air Export',
  'sea-export':  'Sea Export',
  'sea-import':  'Sea Import',
  new:           'New',

  // ── Sub-routes ────────────────────────────────────────────────────────
  invoices:      'Invoices',
  wms:           'WMS',
  employees:     'Employees',
  leave:         'Leave Calendar',
  airlines:      'Airlines',
  users:         'Users',
}

/**
 * Async resolvers for dynamic segments (`:id`, `:jobId`, etc.).
 * Each key is the **preceding static segment** (e.g. 'customers' for /customers/:id).
 * Return null to fall back to the raw segment value.
 */
export type SegmentResolver = (segment: string) => Promise<string | null>

export const ROUTE_LABEL_RESOLVERS: Record<string, SegmentResolver> = {
  customers:  async (_id) => {
    // e.g. fetch customer name by id — replace with real API call
    // const { data } = await axiosInstance.get(`/api/customers/${_id}`)
    // return data.name
    return null   // falls back to raw id until implemented
  },
  quotations: async (_id) => null,
  jobs:       async (_id) => null,
  invoices:   async (_id) => null,
  employees:  async (_id) => null,
}
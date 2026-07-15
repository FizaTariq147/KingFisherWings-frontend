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
  parties:       'Parties',
  organization:  'Organization',
  quotations:    'Quotations',
  all:           'All Quotations',
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
  overdue:       'Overdue',

  // ── Sub-routes ────────────────────────────────────────────────────────
  invoices:      'Invoices',
  'purchase-invoices': 'Purchase Invoices',
  'credit-notes': 'Credit Notes',
  'payment-requests': 'Payment Requests',
  wms:           'WMS',

  employees:     'Employees',
  leave:         'Leave Calendar',
  airlines:      'Airlines',
  'awb-stock-master': 'AWB Stock',
  users:         'Users',
  'bank-accounts': 'Bank Accounts',
  'number-formats': 'Number Formats',
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
  parties: async (_id) => null,
  quotations: async (_id) => null,
  jobs:       async (_id) => null,
  invoices:   async (_id) => null,
  'purchase-invoices': async (_id) => null,
  'credit-notes': async (_id) => null,
  'payment-requests': async (_id) => null,
  employees:  async (_id) => null,
}
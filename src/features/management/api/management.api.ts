export const MANAGEMENT_API = {
  misDashboard: '/gl/mis/dashboard',
  misOperational: '/gl/mis/operational',
  misProfitability: '/gl/mis/profitability',
  arAging: '/gl/ar/aging',
  apAging: '/gl/ap/aging',
  invoicesOverdue: '/invoices/reports/overdue',
  partiesExport: '/parties/export',
  portalAdminDisputes: '/portal-admin/disputes',
  organizationProfile: '/organization/profile',
} as const;

export const MANAGEMENT_DISPUTE_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const;

export type ManagementDisputeStatus = (typeof MANAGEMENT_DISPUTE_STATUSES)[number];

/** Maps Management Dashboard Reports tile ids → backend sources. */
export const MANAGEMENT_REPORT_SOURCES = {
  'open-leads': { source: 'crm', report: 'lead_pipeline' },
  'pending-claims': { source: 'disputes' },
  'daily-job-summary': { source: 'crm', report: 'enquiry_conversion' },
  'gp-statistics': { source: 'mis', endpoint: 'profitability', group_by: 'salesperson' },
  'open-enquiry-report': { source: 'crm', report: 'enquiry_conversion' },
  'invoice-status-report': { source: 'invoices', endpoint: 'overdue' },
  'accounts-receivable-report': { source: 'gl', endpoint: 'ar-aging' },
  'accounts-payable-report': { source: 'gl', endpoint: 'ap-aging' },
  'open-job-status': { source: 'mis', endpoint: 'operational' },
  'job-summary-report': { source: 'crm', report: 'trade_lane' },
} as const;

export type ManagementReportId = keyof typeof MANAGEMENT_REPORT_SOURCES;

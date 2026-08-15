import type { SavedReportType } from '@/features/glSavedReports/constants/savedReport.constants';

export interface ManagementDateParams {
  from_date?: string;
  to_date?: string;
  branch_id?: string;
}

export interface ManagementReportParams extends ManagementDateParams {
  salesperson_id?: string;
  customer_id?: string;
}

export interface ManagementComplaintRow {
  id: string;
  name: string;
  category: string;
  status: string;
  invoiceNumber?: string;
  partyName?: string;
  createdAt?: string;
  description?: string;
}

export interface ManagementBackupHistoryRow {
  id: string;
  name: string;
  reportType?: string;
  createdAt?: string;
  shared?: boolean;
}

export interface ManagementPerformanceRow {
  id: string;
  userName: string;
  email: string;
  role?: string;
  metrics: Record<string, string | number>;
}

export interface ManagementChartPoint {
  month: string;
  [series: string]: string | number;
}

/** Combined payload from parallel MIS / CRM / quotation dashboard sources. */
export interface ManagementDashboardPayload {
  misDashboard: unknown;
  misDashboardRows: Record<string, unknown>[];
  misOperationalRows: Record<string, unknown>[];
  misProfitabilityRows: Record<string, unknown>[];
  crmServiceType: unknown;
  crmEnquiryConversion: unknown;
  quotationAnalytics: unknown;
}

export type BackupExportKind = SavedReportType | 'PARTIES_EXPORT';

export interface BackupItemConfig {
  label: string;
  kind: BackupExportKind;
}

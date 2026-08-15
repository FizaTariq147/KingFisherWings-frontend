import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { organizationService } from '@/features/organization/services/organization.service';
import { savedReportService } from '@/features/glSavedReports/services/savedReport.service';
import { arApAgingService } from '@/features/arApAging/services/arApAging.service';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { portalAdminInboxService } from '@/features/portal-admin-inbox/services/portalAdminInbox.service';
import { userService } from '@/features/users/services/user.service';
import { crmDashboardService } from '@/features/crm/services/crmDashboard.service';
import { crmEnquiriesService } from '@/features/crm/services/crmEnquiries.service';
import { jobService } from '@/features/jobs/services/job.service';
import { glMisService } from '@/features/glMisDashboard/services/glMis.service';
import { quotationService } from '@/features/quotations/services/quotation.service';
import type { ManagementDashboardPayload } from '../types/management.types';
import { useAuthStore } from '@/store/authStore';
import { MANAGEMENT_API, MANAGEMENT_REPORT_SOURCES, type ManagementReportId } from '../api/management.api';
import type { ManagementDateParams, ManagementReportParams } from '../types/management.types';
import { backupKindForLabel } from '../constants/managementBackup.constants';
import {
  countRecordsByUser,
  extractPerformanceReportRows,
  mapDisputeToComplaint,
  mapPerformanceRows,
  mapUserToRow,
} from '../utils/normalizeManagement';
import type { SavedReportType } from '@/features/glSavedReports/constants/savedReport.constants';

function queryParams(params: ManagementDateParams): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.from_date?.trim()) q.from_date = params.from_date.trim();
  if (params.to_date?.trim()) q.to_date = params.to_date.trim();
  if (params.branch_id?.trim()) q.branch_id = params.branch_id.trim();
  return q;
}

function crmDateParams(params: ManagementReportParams) {
  return {
    from: params.from_date,
    to: params.to_date,
    salesperson_id: params.salesperson_id,
  };
}

function agingParams(params: ManagementReportParams) {
  return {
    as_of: params.to_date?.trim() || new Date().toISOString().slice(0, 10),
    party_id: params.customer_id?.trim() || undefined,
  };
}

export const managementService = {
  async listComplaints(status?: string) {
    const items = await portalAdminInboxService.listDisputes();
    const rows = items.map(mapDisputeToComplaint);
    if (!status || status === 'All') return rows;
    return rows.filter((x) => x.status.toUpperCase() === status.toUpperCase());
  },

  async listUsers(search?: string) {
    const result = await userService.list({
      tenantId: '',
      page: 1,
      limit: 100,
      search: search?.trim() || undefined,
      lifecycle: 'active',
      order: 'asc',
      sortBy: 'first_name',
    });
    return result.users.map(mapUserToRow);
  },

  async getSubscriptionKey() {
    try {
      const profile = await organizationService.getProfile();
      const tenantId = useAuthStore.getState().user?.tenantId;
      return profile.display_name || profile.name || tenantId || profile.id || '';
    } catch {
      return useAuthStore.getState().user?.tenantId || '';
    }
  },

  async listBackupHistory() {
    const items = await savedReportService.list();
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      reportType: item.report_type,
      createdAt: item.created_at,
      shared: item.is_shared,
    }));
  },

  async requestBackup(labels: string[]) {
    const created = [];
    for (const label of labels) {
      const cfg = labels.length === 1 ? label : label;
      const reportType = backupKindForLabel(cfg);
      if (reportType === 'PARTIES_EXPORT') {
        const res = await withGatewayRetry(() =>
          axiosInstance.get(MANAGEMENT_API.partiesExport, { responseType: 'blob' }),
        );
        triggerBlobDownload(res.data as Blob, 'parties-export.csv');
        continue;
      }
      const saved = await savedReportService.create({
        name: `Backup — ${label}`,
        report_type: reportType as SavedReportType,
        filters: {},
        is_shared: false,
      });
      created.push(saved);
    }
    return created;
  },

  async loadDashboardCharts(params: ManagementDateParams = {}): Promise<ManagementDashboardPayload> {
    const qp = queryParams(params);
    const crmParams = crmDateParams(params);
    const analyticsParams = {
      from_date: params.from_date,
      to_date: params.to_date,
      branch_id: params.branch_id,
    };

    const [
      misDashboard,
      misOperational,
      misProfitability,
      crmServiceType,
      crmEnquiryConversion,
      quotationAnalytics,
    ] = await Promise.all([
      glMisService.dashboard(qp).catch(() => ({ rows: [] as Record<string, unknown>[], raw: null })),
      glMisService.operational(qp).catch(() => ({ rows: [] as Record<string, unknown>[], raw: null })),
      glMisService
        .profitability({ ...qp, group_by: 'job_type' })
        .catch(() => ({ rows: [] as Record<string, unknown>[], raw: null })),
      crmDashboardService
        .report({ type: 'service_type', ...crmParams })
        .catch(() => null),
      crmDashboardService
        .report({ type: 'enquiry_conversion', ...crmParams })
        .catch(() => null),
      quotationService.reportAnalytics(analyticsParams).catch(() => null),
    ]);

    return {
      misDashboard: misDashboard.raw,
      misDashboardRows: misDashboard.rows,
      misOperationalRows: misOperational.rows,
      misProfitabilityRows: misProfitability.rows,
      crmServiceType,
      crmEnquiryConversion,
      quotationAnalytics,
    };
  },

  async runReport(id: ManagementReportId, params: ManagementReportParams = {}) {
    const cfg = MANAGEMENT_REPORT_SOURCES[id];
    if (cfg.source === 'crm') {
      return crmDashboardService.report({ type: cfg.report, ...crmDateParams(params) });
    }
    if (cfg.source === 'disputes') {
      const items = await portalAdminInboxService.listDisputes();
      const pending = items.filter((item) => {
        const status = String(item.status ?? '').toUpperCase();
        return status === 'OPEN' || status === 'UNDER_REVIEW' || status === 'PENDING';
      });
      return pending.map(mapDisputeToComplaint);
    }
    if (cfg.source === 'invoices') {
      let invoices = await invoiceService.listOverdue();
      if (params.customer_id?.trim()) {
        const customerId = params.customer_id.trim();
        invoices = invoices.filter(
          (inv) => inv.party_id === customerId || inv.party_name?.toLowerCase().includes(customerId.toLowerCase()),
        );
      }
      return invoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        party_name: inv.party_name,
        status: inv.status,
        total_amount: inv.total_amount,
        outstanding_balance: inv.outstanding_balance,
        due_date: inv.due_date,
        currency_code: inv.currency_code,
      }));
    }
    if (cfg.source === 'gl') {
      const agingQuery = agingParams(params);
      const result =
        cfg.endpoint === 'ar-aging'
          ? await arApAgingService.getArAging(agingQuery)
          : await arApAgingService.getApAging(agingQuery);
      return result.lines;
    }
    if (cfg.endpoint === 'operational') {
      return (await glMisService.operational(queryParams(params))).raw;
    }
    return (
      await glMisService.profitability({
        ...queryParams(params),
        group_by: cfg.group_by ?? 'customer',
      })
    ).raw;
  },

  async loadUserPerformance(params: ManagementDateParams = {}) {
    const crmParams = crmDateParams(params);
    const listParams = {
      page: 1,
      limit: 500,
      from_date: params.from_date,
      to_date: params.to_date,
    };

    const [
      usersResult,
      callLogReport,
      topSalesmenReport,
      salesmanRevenueReport,
      enquiriesResult,
      quotationsResult,
      jobsResult,
    ] = await Promise.all([
      userService.list({
        tenantId: '',
        page: 1,
        limit: 200,
        lifecycle: 'active',
        order: 'asc',
        sortBy: 'first_name',
      }),
      crmDashboardService.report({ type: 'call_log_summary', ...crmParams }).catch(() => null),
      crmDashboardService.report({ type: 'top_salesmen', ...crmParams }).catch(() => null),
      crmDashboardService.report({ type: 'salesman_revenue', ...crmParams }).catch(() => null),
      crmEnquiriesService.list({ page: 1, limit: 500 }).catch(() => ({
        items: [] as Record<string, unknown>[],
        meta: { page: 1, limit: 500, total: 0, totalPages: 1 },
      })),
      quotationService.list(listParams).catch(() => ({
        quotations: [] as Array<Record<string, unknown>>,
        meta: { page: 1, limit: 500, total: 0, totalPages: 1 },
      })),
      jobService.list(listParams).catch(() => ({
        jobs: [] as Array<Record<string, unknown>>,
        meta: { page: 1, limit: 500, total: 0, totalPages: 1 },
      })),
    ]);

    const reportRows = [
      ...extractPerformanceReportRows(callLogReport),
      ...extractPerformanceReportRows(topSalesmenReport),
      ...extractPerformanceReportRows(salesmanRevenueReport),
    ];

    const enquiryCounts = countRecordsByUser(
      enquiriesResult.items as Record<string, unknown>[],
      'salesperson_id',
      params,
      'created_at',
    );
    const quotationCounts = countRecordsByUser(
      quotationsResult.quotations as Record<string, unknown>[],
      'salesperson_id',
      params,
      'created_at',
    );
    const jobCounts = countRecordsByUser(
      jobsResult.jobs as Record<string, unknown>[],
      'salesperson_id',
      params,
      'created_at',
    );

    const countMetricsByUser = new Map<string, Record<string, number>>();
    for (const user of usersResult.users) {
      countMetricsByUser.set(user.id, {
        Enquiries: enquiryCounts.get(user.id) ?? 0,
        Quotations: quotationCounts.get(user.id) ?? 0,
        Jobs: jobCounts.get(user.id) ?? 0,
        Shipments: jobCounts.get(user.id) ?? 0,
      });
    }

    return mapPerformanceRows(usersResult.users, reportRows, countMetricsByUser);
  },

  async loadProfitabilityReport(params: ManagementDateParams = {}, groupBy: 'customer' | 'job_type' | 'branch' | 'salesperson' = 'customer') {
    return (
      await glMisService.profitability({
        ...queryParams(params),
        group_by: groupBy,
      })
    ).raw;
  },
};

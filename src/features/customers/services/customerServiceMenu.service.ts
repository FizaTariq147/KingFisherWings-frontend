import { crmEnquiriesService } from '@/features/crm/services/crmEnquiries.service';
import { portalAdminService } from '@/features/portal-admin/services/portalAdmin.service';
import { portalAdminInboxService } from '@/features/portal-admin-inbox/services/portalAdminInbox.service';
import { resolveDateRangePreset } from '@/features/management/utils/managementFilters';
import { CUSTOMER_API_PAGE_LIMIT, fetchAllJobsForCustomerFilters } from '../utils/customerServiceApi';
import { mapJobsToSailingRows } from '../utils/normalizeCustomerService';

export type CustomerServiceMenuStatKey =
  | 'portal-inbox'
  | 'portal-users'
  | 'all-shipments'
  | 'enquiry-sheet'
  | 'pricing-dashboard'
  | 'sailing-schedule'
  | 'shipment-agent-edi'
  | 'shipment-costing-search'
  | 'shipment-tracking';

export type CustomerServiceMenuStats = Partial<Record<CustomerServiceMenuStatKey, number>>;

function isOpenDispute(status: string | undefined): boolean {
  const normalized = (status ?? '').toUpperCase();
  return normalized !== 'RESOLVED' && normalized !== 'REJECTED';
}

function isPendingCreditRequest(status: string | undefined): boolean {
  const normalized = (status ?? 'PENDING').toUpperCase();
  return normalized === 'PENDING' || normalized === 'OPEN' || normalized === 'SUBMITTED';
}

export const customerServiceMenuService = {
  async loadStats(): Promise<CustomerServiceMenuStats> {
    const range = resolveDateRangePreset('this_month');
    const dateParams = {
      from_date: range?.from_date,
      to_date: range?.to_date,
    };

    const [
      jobsPack,
      enquiriesResult,
      openEnquiriesResult,
      portalUsers,
      messagesResult,
      disputes,
      creditRequests,
    ] = await Promise.all([
      fetchAllJobsForCustomerFilters({ ...dateParams, limit: CUSTOMER_API_PAGE_LIMIT }).catch(() => ({
        jobs: [],
        listParams: {},
      })),
      crmEnquiriesService.list({ page: 1, limit: 1 }).catch(() => null),
      crmEnquiriesService.list({ page: 1, limit: 1, status: 'NEW' }).catch(() => null),
      portalAdminService.listTenantUsers().catch(() => [] as Awaited<ReturnType<typeof portalAdminService.listTenantUsers>>),
      portalAdminInboxService.listMessages({ page: 1, limit: 1, unread_only: true }).catch(() => null),
      portalAdminInboxService.listDisputes().catch(() => []),
      portalAdminInboxService.listCreditRequests().catch(() => []),
    ]);

    const jobs = jobsPack.jobs;
    const jobTotal = jobs.length;
    const agentCount = jobs.filter((job) => Boolean(job.agent_id)).length;
    const sailingCount = mapJobsToSailingRows(jobs).length;

    const unreadMessages =
      messagesResult?.meta?.total ??
      messagesResult?.items.filter((message) => !message.isRead).length ??
      0;
    const openDisputes = disputes.filter((dispute) => isOpenDispute(dispute.status)).length;
    const pendingCredit = creditRequests.filter((request) => isPendingCreditRequest(request.status)).length;

    return {
      'portal-inbox': unreadMessages + openDisputes + pendingCredit,
      'portal-users': portalUsers.length,
      'all-shipments': jobTotal,
      'enquiry-sheet': enquiriesResult?.meta?.total ?? enquiriesResult?.items.length ?? 0,
      'pricing-dashboard': openEnquiriesResult?.meta?.total ?? openEnquiriesResult?.items.length ?? 0,
      'sailing-schedule': sailingCount,
      'shipment-agent-edi': agentCount,
      'shipment-costing-search': jobTotal,
      'shipment-tracking': jobTotal,
    };
  },
};

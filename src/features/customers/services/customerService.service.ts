import { jobService } from '@/features/jobs/services/job.service';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { isUuid } from '@/lib/isUuid';
import type {
  CustomerCostingDetail,
  CustomerEnquiryFilters,
  CustomerEnquiryRow,
  CustomerPricingFilters,
  CustomerPricingPayload,
  CustomerSailingRow,
  CustomerShipmentFilters,
  CustomerShipmentRow,
  CustomerTrackingRow,
} from '../types/customerService.types';
import {
  CUSTOMER_API_PAGE_LIMIT,
  fetchAllEnquiriesForCustomerFilters,
  fetchAllJobsForCustomerFilters,
  isAllFilterValue,
} from '../utils/customerServiceApi';
import {
  applyEnquiryFilters,
  applyJobFilters,
  mapEnquiryToRow,
  mapJobCosting,
  mapJobsToSailingRows,
  mapJobToShipmentRow,
  mapJobToTrackingRow,
  mapQuotationAnalytics,
} from '../utils/normalizeCustomerService';
import {
  enrichEnquiriesWithDisplayNames,
  enrichEnquiryRowsWithDisplayNames,
  enrichJobsWithDisplayNames,
} from '../utils/resolveCustomerDisplayNames';

async function fetchFilteredJobs(filters: CustomerShipmentFilters) {
  const { jobs } = await fetchAllJobsForCustomerFilters(filters);
  const enriched = await enrichJobsWithDisplayNames(jobs);
  return applyJobFilters(enriched, filters);
}

async function mapEnquiryResults(items: Awaited<ReturnType<typeof fetchAllEnquiriesForCustomerFilters>>) {
  const enriched = await enrichEnquiriesWithDisplayNames(items);
  const rows = enriched.map(mapEnquiryToRow);
  return enrichEnquiryRowsWithDisplayNames(rows);
}

export const customerServiceService = {
  async listShipments(filters: CustomerShipmentFilters): Promise<CustomerShipmentRow[]> {
    const jobs = await fetchFilteredJobs(filters);
    return jobs.map(mapJobToShipmentRow);
  },

  async listAgentEdiShipments(filters: CustomerShipmentFilters): Promise<CustomerShipmentRow[]> {
    const jobs = await fetchFilteredJobs({ ...filters, agent_only: true });
    return jobs.map(mapJobToShipmentRow);
  },

  async listTracking(filters: CustomerShipmentFilters): Promise<CustomerTrackingRow[]> {
    const jobs = await fetchFilteredJobs(filters);
    return jobs.map(mapJobToTrackingRow);
  },

  async listSailingSchedule(filters: CustomerShipmentFilters): Promise<CustomerSailingRow[]> {
    const jobs = await fetchFilteredJobs({ ...filters, use_etd_dates: true });
    return mapJobsToSailingRows(jobs);
  },

  async listCostingShipments(filters: CustomerShipmentFilters): Promise<CustomerShipmentRow[]> {
    return this.listShipments(filters);
  },

  async loadJobCosting(jobId: string): Promise<CustomerCostingDetail> {
    const [job, pnl] = await Promise.all([
      jobService.getById(jobId),
      jobService.getPnl(jobId).catch(() => undefined),
    ]);
    const [enriched] = await enrichJobsWithDisplayNames([job]);
    return mapJobCosting(enriched, pnl);
  },

  async listEnquiries(filters: CustomerEnquiryFilters): Promise<CustomerEnquiryRow[]> {
    const items = await fetchAllEnquiriesForCustomerFilters(filters);
    const rows = await mapEnquiryResults(items);
    return applyEnquiryFilters(rows, filters);
  },

  async loadPricingDashboard(filters: CustomerPricingFilters): Promise<CustomerPricingPayload> {
    const [enquiryItems, analytics] = await Promise.all([
      fetchAllEnquiriesForCustomerFilters({
        ...filters,
        status: 'NEW',
        limit: CUSTOMER_API_PAGE_LIMIT,
      }),
      quotationService.reportAnalytics({
        from_date: filters.from_date,
        to_date: filters.to_date,
        branch_id:
          !isAllFilterValue(filters.branch_id) && isUuid(filters.branch_id!)
            ? filters.branch_id
            : undefined,
        salesperson_id:
          !isAllFilterValue(filters.salesperson_id) && isUuid(filters.salesperson_id!)
            ? filters.salesperson_id
            : undefined,
      }),
    ]);

    const openEnquiries = applyEnquiryFilters(await mapEnquiryResults(enquiryItems), filters);
    return {
      openEnquiries,
      quotationStats: mapQuotationAnalytics(analytics),
      rawAnalytics: analytics,
    };
  },
};

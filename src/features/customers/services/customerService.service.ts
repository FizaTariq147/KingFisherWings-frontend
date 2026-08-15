import { crmEnquiriesService } from '@/features/crm/services/crmEnquiries.service';
import type { EnquiryStatus } from '@/features/crm/constants/crm.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobListParams } from '@/features/jobs/types/job.types';
import { quotationService } from '@/features/quotations/services/quotation.service';
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
  applyEnquiryFilters,
  applyJobFilters,
  mapEnquiryToRow,
  mapJobCosting,
  mapJobsToSailingRows,
  mapJobToShipmentRow,
  mapJobToTrackingRow,
  mapQuotationAnalytics,
} from '../utils/normalizeCustomerService';

function isAll(value: string | undefined): boolean {
  return !value || value === 'All' || value === '-Select-';
}

function toJobListParams(filters: CustomerShipmentFilters): JobListParams {
  const params: JobListParams = {
    page: 1,
    limit: filters.limit ?? 200,
    order: 'desc',
    from_date: filters.from_date,
    to_date: filters.to_date,
  };
  if (!isAll(filters.branch_id)) params.branch_id = filters.branch_id;
  if (!isAll(filters.salesperson_id)) params.salesperson_id = filters.salesperson_id;
  if (!isAll(filters.origin)) params.origin_port_id = filters.origin;
  if (!isAll(filters.destination)) params.dest_port_id = filters.destination;
  if (!isAll(filters.status)) params.status = filters.status as JobListParams['status'];
  if (!isAll(filters.job_type)) params.job_type = filters.job_type as JobListParams['job_type'];
  if (filters.shipment_no?.trim()) params.search = filters.shipment_no.trim();
  else if (filters.job_no?.trim()) params.search = filters.job_no.trim();
  else if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.sailing_no?.trim()) params.voyage_number = filters.sailing_no.trim();
  return params;
}

async function fetchFilteredJobs(filters: CustomerShipmentFilters) {
  const result = await jobService.list(toJobListParams(filters));
  return applyJobFilters(result.jobs, filters);
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
    return mapJobCosting(job, pnl);
  },

  async listEnquiries(filters: CustomerEnquiryFilters): Promise<CustomerEnquiryRow[]> {
    const result = await crmEnquiriesService.list({
      page: 1,
      limit: filters.limit ?? 200,
      status: !isAll(filters.status) ? (filters.status as EnquiryStatus) : undefined,
      salesperson_id: !isAll(filters.salesperson_id) ? filters.salesperson_id : undefined,
    });
    const rows = result.items.map(mapEnquiryToRow);
    return applyEnquiryFilters(rows, filters);
  },

  async loadPricingDashboard(filters: CustomerPricingFilters): Promise<CustomerPricingPayload> {
    const [enquiries, analytics] = await Promise.all([
      crmEnquiriesService.list({
        page: 1,
        limit: filters.limit ?? 200,
        status: 'NEW',
        salesperson_id: !isAll(filters.salesperson_id) ? filters.salesperson_id : undefined,
      }),
      quotationService.reportAnalytics({
        from_date: filters.from_date,
        to_date: filters.to_date,
        branch_id: !isAll(filters.branch_id) ? filters.branch_id : undefined,
      }),
    ]);

    const openEnquiries = applyEnquiryFilters(enquiries.items.map(mapEnquiryToRow), filters);
    return {
      openEnquiries,
      quotationStats: mapQuotationAnalytics(analytics),
      rawAnalytics: analytics,
    };
  },
};

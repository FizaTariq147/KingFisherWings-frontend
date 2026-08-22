import { isUuid } from '@/lib/isUuid';
import { crmEnquiriesService } from '@/features/crm/services/crmEnquiries.service';
import type { EnquiryListParams } from '@/features/crm/types/crm.types';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import type { CustomerEnquiryFilters, CustomerShipmentFilters } from '../types/customerService.types';

/** Backend max for `GET /jobs` and `GET /crm/enquiries` (OpenAPI). */
export const CUSTOMER_API_PAGE_LIMIT = 100;

/** Safety cap — up to 1,000 rows per screen. */
export const CUSTOMER_API_MAX_PAGES = 10;

function isAll(value: string | undefined): boolean {
  return !value || value === 'All' || value === '-Select-';
}

function optionalUuid(value: string | undefined): string | undefined {
  if (isAll(value)) return undefined;
  const trimmed = value!.trim();
  return isUuid(trimmed) ? trimmed : undefined;
}

function firstSearchTerm(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function toJobListParams(filters: CustomerShipmentFilters): JobListParams {
  const params: JobListParams = {
    page: 1,
    limit: Math.min(filters.limit ?? CUSTOMER_API_PAGE_LIMIT, CUSTOMER_API_PAGE_LIMIT),
    order: 'desc',
  };

  // ETD views apply date range client-side against job ETD.
  if (!filters.use_etd_dates) {
    params.from_date = filters.from_date;
    params.to_date = filters.to_date;
  }

  const branchId = optionalUuid(filters.branch_id);
  if (branchId) params.branch_id = branchId;

  const salespersonId = optionalUuid(filters.salesperson_id);
  if (salespersonId) params.salesperson_id = salespersonId;

  const originPortId = optionalUuid(filters.origin) ?? optionalUuid(filters.pol);
  if (originPortId) params.origin_port_id = originPortId;

  const destPortId = optionalUuid(filters.destination) ?? optionalUuid(filters.pod);
  if (destPortId) params.dest_port_id = destPortId;

  const shipperId = optionalUuid(filters.shipper_id) ?? optionalUuid(filters.client);
  if (shipperId) params.shipper_id = shipperId;

  if (!isAll(filters.status)) params.status = filters.status as JobListParams['status'];
  if (!isAll(filters.job_type)) params.job_type = filters.job_type as JobListParams['job_type'];

  const vesselId = optionalUuid(filters.vessel_name);
  if (vesselId) params.vessel_id = vesselId;

  const carrierId = optionalUuid(filters.carrier);
  if (carrierId) params.shipping_line_id = carrierId;

  if (filters.sailing_no?.trim()) params.voyage_number = filters.sailing_no.trim();

  const search = firstSearchTerm(filters.shipment_no, filters.job_no, filters.search, filters.hbl, filters.mbl);
  if (search) params.search = search;

  return params;
}

export function toEnquiryListParams(filters: CustomerEnquiryFilters): EnquiryListParams {
  return {
    page: 1,
    limit: Math.min(filters.limit ?? CUSTOMER_API_PAGE_LIMIT, CUSTOMER_API_PAGE_LIMIT),
    status: !isAll(filters.status) ? (filters.status as EnquiryListParams['status']) : undefined,
    salesperson_id: optionalUuid(filters.salesperson_id),
  };
}

export async function fetchAllJobsForCustomerFilters(
  filters: CustomerShipmentFilters,
): Promise<{ jobs: Job[]; listParams: JobListParams }> {
  const listParams = toJobListParams(filters);
  const first = await jobService.list({ ...listParams, page: 1 });
  const jobs = [...first.jobs];
  const totalPages = Math.min(first.meta.totalPages, CUSTOMER_API_MAX_PAGES);

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await jobService.list({ ...listParams, page });
    jobs.push(...next.jobs);
  }

  return { jobs, listParams };
}

export async function fetchAllEnquiriesForCustomerFilters(filters: CustomerEnquiryFilters) {
  const listParams = toEnquiryListParams(filters);
  const first = await crmEnquiriesService.list({ ...listParams, page: 1 });
  const items = [...first.items];
  const totalPages = Math.min(first.meta.totalPages, CUSTOMER_API_MAX_PAGES);

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await crmEnquiriesService.list({ ...listParams, page });
    items.push(...next.items);
  }

  return items;
}

export function isAllFilterValue(value: string | undefined): boolean {
  return isAll(value);
}

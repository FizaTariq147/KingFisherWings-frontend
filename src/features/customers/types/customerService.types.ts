import type { JobStatus, JobType } from '@/features/jobs/constants/job.constants';
import type { EnquiryStatus } from '@/features/crm/constants/crm.constants';

export interface CustomerDateParams {
  from_date?: string;
  to_date?: string;
}

export interface CustomerShipmentFilters extends CustomerDateParams {
  branch_id?: string;
  client?: string;
  salesperson_id?: string;
  department?: string;
  origin?: string;
  destination?: string;
  shipment_no?: string;
  hbl?: string;
  mawb?: string;
  job_no?: string;
  mbl?: string;
  shipper_id?: string;
  consignee_id?: string;
  created_user?: string;
  status?: string;
  job_type?: string;
  search?: string;
  limit?: number;
  /** Agent EDI — only jobs with an assigned agent. */
  agent_only?: boolean;
  /** Sailing schedule filters */
  carrier?: string;
  vessel_name?: string;
  sailing_no?: string;
  pol?: string;
  pod?: string;
  /** When true, apply from/to against job ETD instead of created date. */
  use_etd_dates?: boolean;
}

export interface CustomerEnquiryFilters extends CustomerDateParams {
  branch_id?: string;
  client?: string;
  salesperson_id?: string;
  department?: string;
  origin?: string;
  destination?: string;
  enquiry_no?: string;
  created_user?: string;
  status?: string;
  search?: string;
  limit?: number;
}

export interface CustomerPricingFilters extends CustomerEnquiryFilters {
  tab: 'open_enquiries' | 'quotation_stats';
}

export interface CustomerShipmentRow {
  id: string;
  shipmentNo: string;
  jobNo: string;
  client: string;
  origin: string;
  destination: string;
  branch: string;
  status: string;
  shipmentDate: string;
  hbl: string;
  mbl: string;
  salesPerson: string;
  type: string;
  etd: string;
  eta: string;
  agentId: string;
}

export interface CustomerTrackingRow extends CustomerShipmentRow {
  currentMilestone: string;
  milestoneDate: string;
}

export interface CustomerSailingRow {
  id: string;
  carrier: string;
  vessel: string;
  sailingNo: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  jobCount: number;
}

export interface CustomerEnquiryRow {
  id: string;
  enquiryNo: string;
  client: string;
  origin: string;
  destination: string;
  serviceType: string;
  status: EnquiryStatus | string;
  salesPerson: string;
  createdAt: string;
  currency: string;
}

export interface CustomerCostingLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  exchangeRate: number;
  lineTotal: number;
  isCost: boolean;
}

export interface CustomerCostingDetail {
  shipmentNo: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  currency: string;
  saleLines: CustomerCostingLine[];
  costLines: CustomerCostingLine[];
}

export interface CustomerPricingPayload {
  openEnquiries: CustomerEnquiryRow[];
  quotationStats: Array<{ status: string; count: number }>;
  rawAnalytics: unknown;
}

export type CustomerJobStatusFilter = JobStatus | 'All';
export type CustomerJobTypeFilter = JobType | 'All';

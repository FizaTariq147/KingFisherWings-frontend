import type { Enquiry } from '@/features/crm/types/crm.types';
import type { Job, JobCharge } from '@/features/jobs/types/job.types';
import { crmLabel } from '@/features/crm/constants/crm.constants';
import { JOB_STATUS_LABELS } from '@/features/jobs/constants/job.constants';
import type {
  CustomerCostingDetail,
  CustomerCostingLine,
  CustomerEnquiryFilters,
  CustomerEnquiryRow,
  CustomerPricingPayload,
  CustomerSailingRow,
  CustomerShipmentFilters,
  CustomerShipmentRow,
  CustomerTrackingRow,
} from '../types/customerService.types';
import { isWithinDateRange } from '@/features/management/utils/managementFilters';

export function jobHbl(job: Job): string {
  return job.sea_fcl_details?.hbl_number || job.air_details?.hawb_number || '';
}

export function jobMbl(job: Job): string {
  return job.sea_fcl_details?.mbl_number || job.air_details?.mawb_number || '';
}

export function jobEtd(job: Job): string {
  return job.etd || job.sea_fcl_details?.etd || '';
}

export function jobEta(job: Job): string {
  return job.eta || job.sea_fcl_details?.eta || '';
}

export function mapJobToShipmentRow(job: Job): CustomerShipmentRow {
  return {
    id: job.id,
    shipmentNo: job.job_number || job.id.slice(0, 8),
    jobNo: job.job_number || '—',
    client: job.shipper_name || job.shipper_id || '—',
    origin: job.origin_port_code || job.origin_port_id || '—',
    destination: job.dest_port_code || job.dest_port_id || '—',
    branch: job.branch_id || '—',
    status: JOB_STATUS_LABELS[job.status] || job.status,
    shipmentDate: job.created_at?.slice(0, 10) || '—',
    hbl: jobHbl(job) || '—',
    mbl: jobMbl(job) || '—',
    salesPerson: job.salesperson_id || '—',
    type: job.job_type.replaceAll('_', ' '),
    etd: jobEtd(job) || '—',
    eta: jobEta(job) || '—',
    agentId: job.agent_id || '',
  };
}

export function mapJobToTrackingRow(job: Job): CustomerTrackingRow {
  const milestones = job.milestones ?? [];
  const open = milestones.find((m) => !m.is_completed);
  const latest = open ?? milestones[milestones.length - 1];
  return {
    ...mapJobToShipmentRow(job),
    currentMilestone: latest?.milestone || job.status.replaceAll('_', ' '),
    milestoneDate: latest?.actual_date || latest?.planned_date || job.updated_at?.slice(0, 10) || '—',
  };
}

export function mapJobsToSailingRows(jobs: Job[]): CustomerSailingRow[] {
  const map = new Map<string, CustomerSailingRow & { jobIds: Set<string> }>();

  for (const job of jobs) {
    const etd = jobEtd(job);
    if (!etd) continue;
    const vessel = String(job.sea_fcl_details?.vessel_id || '—');
    const sailingNo = String(job.sea_fcl_details?.voyage_number || '—');
    const key = `${vessel}|${sailingNo}|${etd}`;
    const existing = map.get(key);
    if (existing) {
      existing.jobIds.add(job.id);
      existing.jobCount = existing.jobIds.size;
      continue;
    }
    map.set(key, {
      id: key,
      carrier: job.sea_fcl_details?.shipping_line_id || '—',
      vessel,
      sailingNo,
      pol: job.origin_port_code || job.origin_port_id || '—',
      pod: job.dest_port_code || job.dest_port_id || '—',
      etd,
      eta: jobEta(job) || '—',
      jobCount: 1,
      jobIds: new Set([job.id]),
    });
  }

  return [...map.values()].map(({ jobIds: _jobIds, ...row }) => row);
}

export function mapEnquiryToRow(enquiry: Enquiry): CustomerEnquiryRow {
  const raw = enquiry as Record<string, unknown>;
  const enquiryNo =
    String(raw.enquiry_number ?? raw.enquiryNumber ?? raw.reference_number ?? enquiry.id.slice(0, 8));
  const partyName = String(raw.party_name ?? raw.partyName ?? raw.company_name ?? '');
  return {
    id: enquiry.id,
    enquiryNo,
    client: partyName || enquiry.party_id || enquiry.lead_id || '—',
    origin: String(raw.origin_port_code ?? enquiry.origin_port_id ?? '—'),
    destination: String(raw.dest_port_code ?? enquiry.dest_port_id ?? '—'),
    serviceType: crmLabel(enquiry.service_type),
    status: enquiry.status,
    salesPerson: enquiry.salesperson_id || '—',
    createdAt: enquiry.created_at?.slice(0, 10) || '—',
    currency: enquiry.currency_code || '—',
  };
}

function mapChargeLine(charge: JobCharge): CustomerCostingLine {
  const qty = charge.quantity ?? 1;
  const rate = charge.exchange_rate ?? 1;
  const lineTotal = charge.line_total ?? qty * charge.unit_price * rate;
  return {
    id: charge.id,
    description: charge.description || charge.charge_code || 'Charge',
    quantity: qty,
    unitPrice: charge.unit_price,
    currency: charge.currency_code,
    exchangeRate: rate,
    lineTotal,
    isCost: Boolean(charge.is_cost),
  };
}

export function mapJobCosting(job: Job, pnl?: { revenue?: number; cost?: number; gross_profit?: number; currency_code?: string }): CustomerCostingDetail {
  const charges = (job.charges ?? []).map(mapChargeLine);
  const saleLines = charges.filter((c) => !c.isCost);
  const costLines = charges.filter((c) => c.isCost);
  const revenue = pnl?.revenue ?? saleLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const cost = pnl?.cost ?? costLines.reduce((sum, line) => sum + line.lineTotal, 0);
  return {
    shipmentNo: job.job_number || job.id.slice(0, 8),
    revenue,
    cost,
    grossProfit: pnl?.gross_profit ?? revenue - cost,
    currency: pnl?.currency_code || saleLines[0]?.currency || costLines[0]?.currency || 'USD',
    saleLines,
    costLines,
  };
}

function includesTerm(value: string | undefined, term: string): boolean {
  if (!term.trim()) return true;
  return (value || '').toLowerCase().includes(term.trim().toLowerCase());
}

function isAll(value: string | undefined): boolean {
  return !value || value === 'All' || value === '-Select-';
}

export function applyJobFilters(jobs: Job[], filters: CustomerShipmentFilters): Job[] {
  return jobs.filter((job) => {
    if (filters.agent_only && !job.agent_id) return false;
    if (filters.use_etd_dates) {
      if (!isWithinDateRange(jobEtd(job), filters.from_date, filters.to_date)) return false;
    } else if (!isWithinDateRange(job.created_at, filters.from_date, filters.to_date)) {
      return false;
    }
    if (!isAll(filters.branch_id) && job.branch_id !== filters.branch_id) return false;
    if (!isAll(filters.salesperson_id) && job.salesperson_id !== filters.salesperson_id) return false;
    if (!isAll(filters.origin) && job.origin_port_id !== filters.origin && job.origin_port_code !== filters.origin) {
      return false;
    }
    if (!isAll(filters.destination) && job.dest_port_id !== filters.destination && job.dest_port_code !== filters.destination) {
      return false;
    }
    if (!isAll(filters.status) && job.status !== filters.status) return false;
    if (!isAll(filters.job_type) && job.job_type !== filters.job_type) return false;
    if (!isAll(filters.client) && !includesTerm(job.shipper_name, filters.client!) && job.shipper_id !== filters.client) {
      return false;
    }
    if (filters.department?.trim() && !includesTerm(job.department_id, filters.department)) return false;
    if (filters.shipment_no?.trim() && !includesTerm(job.job_number, filters.shipment_no)) return false;
    if (filters.job_no?.trim() && !includesTerm(job.job_number, filters.job_no)) return false;
    if (filters.hbl?.trim() && !includesTerm(jobHbl(job), filters.hbl)) return false;
    if (filters.mbl?.trim() && !includesTerm(jobMbl(job), filters.mbl)) return false;
    if (filters.mawb?.trim() && !includesTerm(job.air_details?.mawb_number, filters.mawb)) return false;
    if (filters.shipper_id?.trim() && job.shipper_id !== filters.shipper_id) return false;
    if (filters.consignee_id?.trim() && job.consignee_id !== filters.consignee_id) return false;
    if (filters.created_user?.trim() && !includesTerm(job.ops_user_id, filters.created_user)) return false;
    if (filters.carrier?.trim() && !includesTerm(job.sea_fcl_details?.shipping_line_id, filters.carrier)) return false;
    if (filters.vessel_name?.trim() && !includesTerm(job.sea_fcl_details?.vessel_id, filters.vessel_name)) return false;
    if (filters.sailing_no?.trim() && !includesTerm(job.sea_fcl_details?.voyage_number, filters.sailing_no)) return false;
    if (filters.pol?.trim() && job.origin_port_id !== filters.pol && job.origin_port_code !== filters.pol) return false;
    if (filters.pod?.trim() && job.dest_port_id !== filters.pod && job.dest_port_code !== filters.pod) return false;
    if (filters.search?.trim()) {
      const haystack = [
        job.job_number,
        job.shipper_name,
        jobHbl(job),
        jobMbl(job),
        job.status,
        job.job_type,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(filters.search.trim().toLowerCase())) return false;
    }
    return true;
  });
}

export function applyEnquiryFilters(rows: CustomerEnquiryRow[], filters: CustomerEnquiryFilters): CustomerEnquiryRow[] {
  return rows.filter((row) => {
    if (!isWithinDateRange(row.createdAt, filters.from_date, filters.to_date)) return false;
    if (!isAll(filters.status) && row.status !== filters.status) return false;
    if (!isAll(filters.salesperson_id) && row.salesPerson !== filters.salesperson_id) return false;
    if (filters.enquiry_no?.trim() && !includesTerm(row.enquiryNo, filters.enquiry_no)) return false;
    if (!isAll(filters.client) && !includesTerm(row.client, filters.client!)) return false;
    if (filters.created_user?.trim() && !includesTerm(row.salesPerson, filters.created_user)) return false;
    if (filters.search?.trim()) {
      const haystack = [row.enquiryNo, row.client, row.serviceType, row.status, row.origin, row.destination]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(filters.search.trim().toLowerCase())) return false;
    }
    return true;
  });
}

function extractRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['rows', 'items', 'data', 'statistics', 'by_status', 'status_breakdown']) {
      if (Array.isArray(record[key])) {
        return record[key] as Record<string, unknown>[];
      }
    }
  }
  return [];
}

export function mapQuotationAnalytics(data: unknown): CustomerPricingPayload['quotationStats'] {
  const rows = extractRows(data);
  if (rows.length) {
    return rows.map((row) => ({
      status: String(row.status ?? row.label ?? row.name ?? 'Unknown'),
      count: Number(row.count ?? row.value ?? row.total ?? 0),
    }));
  }
  if (data && typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'number')
      .map(([status, count]) => ({ status: crmLabel(status), count: Number(count) }));
  }
  return [];
}

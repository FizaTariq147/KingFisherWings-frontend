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
import { isUuid } from '@/lib/isUuid';

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

function displayLabel(name: string | undefined): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return '—';
}

function portDisplay(code: string | undefined): string {
  const trimmed = code?.trim();
  if (trimmed && !isUuid(trimmed)) return trimmed;
  return '—';
}

export function mapJobToShipmentRow(job: Job): CustomerShipmentRow {
  return {
    id: job.id,
    jobType: job.job_type,
    shipmentNo: job.job_number || job.id.slice(0, 8),
    jobNo: job.job_number || '—',
    client: displayLabel(job.shipper_name),
    origin: portDisplay(job.origin_port_code),
    destination: portDisplay(job.dest_port_code),
    branch: displayLabel(job.branch_name),
    status: JOB_STATUS_LABELS[job.status] || job.status,
    shipmentDate: job.created_at?.slice(0, 10) || '—',
    hbl: jobHbl(job) || '—',
    mbl: jobMbl(job) || '—',
    salesPerson: displayLabel(job.salesperson_name),
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
    const vesselKey = job.sea_fcl_details?.vessel_id || 'unknown';
    const vessel = job.sea_fcl_details?.vessel_name || '—';
    const carrier = job.sea_fcl_details?.shipping_line_name || '—';
    const sailingNo = String(job.sea_fcl_details?.voyage_number || '—');
    const key = `${vesselKey}|${sailingNo}|${etd}`;
    const existing = map.get(key);
    if (existing) {
      existing.jobIds.add(job.id);
      existing.jobCount = existing.jobIds.size;
      continue;
    }
    map.set(key, {
      id: key,
      carrier,
      vessel,
      sailingNo,
      pol: portDisplay(job.origin_port_code),
      pod: portDisplay(job.dest_port_code),
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
  const partyName = String(raw.party_name ?? raw.partyName ?? raw.company_name ?? '').trim();
  const leadName = String(raw.lead_name ?? raw.leadName ?? '').trim();
  const salespersonName = String(raw.salesperson_name ?? raw.salespersonName ?? '').trim();
  const clientName = partyName || leadName;
  return {
    id: enquiry.id,
    enquiryNo,
    client: clientName && !isUuid(clientName) ? clientName : '—',
    partyId: enquiry.party_id,
    leadId: enquiry.lead_id,
    originPortId: enquiry.origin_port_id,
    destPortId: enquiry.dest_port_id,
    origin: String(raw.origin_port_code ?? raw.originPortCode ?? '—'),
    destination: String(raw.dest_port_code ?? raw.destPortCode ?? '—'),
    serviceType: crmLabel(enquiry.service_type),
    status: enquiry.status,
    salesPerson: salespersonName || '—',
    salesPersonId: enquiry.salesperson_id,
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
    }

    // Text / non-API filters only — list params are handled by GET /jobs.
    if (!isAll(filters.client) && !isUuid(filters.client!) && !includesTerm(job.shipper_name, filters.client!)) {
      return false;
    }
    if (filters.department?.trim()) {
      if (isUuid(filters.department)) {
        if (job.department_id !== filters.department) return false;
      } else if (!includesTerm(job.department_id, filters.department)) {
        return false;
      }
    }
    if (filters.consignee_id?.trim() && job.consignee_id !== filters.consignee_id) return false;
    if (filters.hbl?.trim() && !includesTerm(jobHbl(job), filters.hbl)) return false;
    if (filters.mbl?.trim() && !includesTerm(jobMbl(job), filters.mbl)) return false;
    if (filters.mawb?.trim() && !includesTerm(job.air_details?.mawb_number, filters.mawb)) return false;
    if (filters.created_user?.trim()) {
      if (isUuid(filters.created_user)) {
        if (job.ops_user_id !== filters.created_user && job.salesperson_id !== filters.created_user) {
          return false;
        }
      } else if (!includesTerm(job.ops_user_id, filters.created_user)) {
        return false;
      }
    }

    if (filters.carrier?.trim() && !isUuid(filters.carrier) && !includesTerm(job.sea_fcl_details?.shipping_line_id, filters.carrier)) {
      return false;
    }
    if (filters.vessel_name?.trim() && !isUuid(filters.vessel_name) && !includesTerm(job.sea_fcl_details?.vessel_id, filters.vessel_name)) {
      return false;
    }
    if (filters.pol?.trim() && !isUuid(filters.pol) && job.origin_port_id !== filters.pol && job.origin_port_code !== filters.pol) {
      return false;
    }
    if (filters.pod?.trim() && !isUuid(filters.pod) && job.dest_port_id !== filters.pod && job.dest_port_code !== filters.pod) {
      return false;
    }

    if (!isAll(filters.origin)) {
      const origin = filters.origin ?? '';
      if (isUuid(origin)) {
        if (job.origin_port_id !== origin) return false;
      } else if (job.origin_port_id !== origin && job.origin_port_code !== origin) {
        return false;
      }
    }
    if (!isAll(filters.destination)) {
      const destination = filters.destination ?? '';
      if (isUuid(destination)) {
        if (job.dest_port_id !== destination) return false;
      } else if (job.dest_port_id !== destination && job.dest_port_code !== destination) {
        return false;
      }
    }

    return true;
  });
}

export function applyEnquiryFilters(rows: CustomerEnquiryRow[], filters: CustomerEnquiryFilters): CustomerEnquiryRow[] {
  return rows.filter((row) => {
    if (!isWithinDateRange(row.createdAt, filters.from_date, filters.to_date)) return false;
    if (!isAll(filters.status) && row.status !== filters.status) return false;
    if (!isAll(filters.salesperson_id)) {
      const matchesName = row.salesPerson === filters.salesperson_id;
      const matchesId = row.salesPersonId === filters.salesperson_id;
      if (!matchesName && !matchesId) return false;
    }
    if (filters.enquiry_no?.trim() && !includesTerm(row.enquiryNo, filters.enquiry_no)) return false;
    if (!isAll(filters.client) && !includesTerm(row.client, filters.client!)) return false;
    if (!isAll(filters.origin)) {
      if (isUuid(filters.origin!)) {
        if (row.originPortId !== filters.origin) return false;
      } else if (!includesTerm(row.origin, filters.origin!)) {
        return false;
      }
    }
    if (!isAll(filters.destination)) {
      if (isUuid(filters.destination!)) {
        if (row.destPortId !== filters.destination) return false;
      } else if (!includesTerm(row.destination, filters.destination!)) {
        return false;
      }
    }
    if (filters.created_user?.trim()) {
      if (isUuid(filters.created_user)) {
        if (row.salesPersonId !== filters.created_user) return false;
      } else if (!includesTerm(row.salesPerson, filters.created_user)) {
        return false;
      }
    }
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function mapQuotationAnalytics(data: unknown): CustomerPricingPayload['quotationStats'] {
  const record = asRecord(data);
  if (record) {
    const byStatus = asRecord(record.by_status) ?? asRecord(record.byStatus);
    if (byStatus) {
      return Object.entries(byStatus)
        .filter(([, value]) => typeof value === 'number')
        .map(([status, count]) => ({ status: crmLabel(status), count: Number(count) }));
    }
  }

  const rows = extractRows(data);
  if (rows.length) {
    return rows.map((row) => ({
      status: String(row.status ?? row.label ?? row.name ?? 'Unknown'),
      count: Number(row.count ?? row.value ?? row.total ?? 0),
    }));
  }
  if (record) {
    return Object.entries(record)
      .filter(([, value]) => typeof value === 'number')
      .map(([status, count]) => ({ status: crmLabel(status), count: Number(count) }));
  }
  return [];
}

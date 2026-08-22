import type { Job, JobCharge, JobListParams, JobMilestone, JobNote } from '../types/job.types';
import type { JobStatus, JobType } from '../constants/job.constants';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value).trim();
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return fallback;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function pickPortCode(value: unknown): string {
  const nested = asRecord(value);
  if (!nested) return '';
  return pickString(nested, 'code', 'port_code', 'portCode', 'iata_code', 'unlocode');
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

export function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.jobs) && nested.jobs) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

export function normalizePaginationMeta(
  raw: unknown,
  fallbackTotal: number,
  params: JobListParams,
): { page: number; limit: number; total: number; totalPages: number } {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

function normalizeCharge(raw: unknown): JobCharge | null {
  const r = asRecord(raw);
  if (!r || !r.id) return null;
  return {
    id: str(r.id),
    charge_code_id: pickString(r, 'charge_code_id', 'chargeCodeId'),
    charge_code: pickString(r, 'charge_code', 'chargeCode'),
    description: pickString(r, 'description'),
    quantity: num(r.quantity),
    unit_price: num(r.unit_price ?? r.unitPrice) ?? 0,
    currency_code: pickString(r, 'currency_code', 'currencyCode').toUpperCase() || 'AED',
    exchange_rate: num(r.exchange_rate ?? r.exchangeRate),
    tax_rate_id: pickString(r, 'tax_rate_id', 'taxRateId') || undefined,
    is_cost: bool(r.is_cost ?? r.isCost),
    is_billable: bool(r.is_billable ?? r.isBillable, true),
    party_id: pickString(r, 'party_id', 'partyId') || undefined,
    line_total: num(r.line_total ?? r.lineTotal),
  };
}

function normalizeMilestone(raw: unknown): JobMilestone | null {
  const r = asRecord(raw);
  if (!r || !r.id) return null;
  return {
    id: str(r.id),
    milestone: pickString(r, 'milestone', 'name'),
    planned_date: pickString(r, 'planned_date', 'plannedDate') || undefined,
    actual_date: pickString(r, 'actual_date', 'actualDate') || undefined,
    is_completed: Boolean(r.actual_date ?? r.actualDate),
  };
}

function normalizeNote(raw: unknown): JobNote | null {
  const r = asRecord(raw);
  if (!r || !r.id) return null;
  return {
    id: str(r.id),
    note: pickString(r, 'note', 'content'),
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
    updated_at: pickString(r, 'updated_at', 'updatedAt') || undefined,
  };
}

function pickRelationName(value: unknown): string | undefined {
  const nested = asRecord(value);
  if (!nested) return undefined;
  return (
    pickString(nested, 'name', 'full_name', 'fullName', 'company_name', 'companyName', 'party_name', 'partyName', 'display_name', 'displayName') ||
    undefined
  );
}

export function normalizeJob(raw: unknown): Job | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;

  const chargesRaw = r.charges ?? r.charge_lines;
  const milestonesRaw = r.milestones;
  const notesRaw = r.notes_list ?? r.job_notes ?? r.notes;
  const houseRaw = r.house_jobs ?? r.houseJobs;

  const charges = Array.isArray(chargesRaw)
    ? chargesRaw.map(normalizeCharge).filter((c): c is JobCharge => Boolean(c))
    : undefined;
  const milestones = Array.isArray(milestonesRaw)
    ? milestonesRaw.map(normalizeMilestone).filter((m): m is JobMilestone => Boolean(m))
    : undefined;
  const notesList = Array.isArray(notesRaw)
    ? notesRaw.map(normalizeNote).filter((n): n is JobNote => Boolean(n))
    : undefined;
  const houseJobs = Array.isArray(houseRaw)
    ? houseRaw.map(normalizeJob).filter((j): j is Job => Boolean(j))
    : undefined;

  const air = asRecord(r.air_details ?? r.airDetails);
  const sea = asRecord(r.sea_fcl_details ?? r.seaFclDetails);

  return {
    id: str(r.id),
    job_number: pickString(r, 'job_number', 'jobNumber') || undefined,
    job_type: pickString(r, 'job_type', 'jobType') as JobType,
    status: (pickString(r, 'status') || 'ENQUIRY') as JobStatus,
    company_id: pickString(r, 'company_id', 'companyId') || undefined,
    branch_id: pickString(r, 'branch_id', 'branchId') || undefined,
    department_id: pickString(r, 'department_id', 'departmentId') || undefined,
    parent_job_id: pickString(r, 'parent_job_id', 'parentJobId') || undefined,
    shipper_id: pickString(r, 'shipper_id', 'shipperId'),
    shipper_name:
      pickString(r, 'shipper_name', 'shipperName') ||
      pickRelationName(r.shipper ?? r.shipper_party ?? r.shipperParty) ||
      undefined,
    consignee_id: pickString(r, 'consignee_id', 'consigneeId') || undefined,
    consignee_name:
      pickString(r, 'consignee_name', 'consigneeName') ||
      pickRelationName(r.consignee ?? r.consignee_party ?? r.consigneeParty) ||
      undefined,
    agent_id: pickString(r, 'agent_id', 'agentId') || undefined,
    agent_name:
      pickString(r, 'agent_name', 'agentName') ||
      pickRelationName(r.agent ?? r.agent_party ?? r.agentParty) ||
      undefined,
    salesperson_id: pickString(r, 'salesperson_id', 'salespersonId') || undefined,
    salesperson_name:
      pickString(r, 'salesperson_name', 'salespersonName') ||
      pickRelationName(r.salesperson ?? r.sales_person ?? r.salesPerson) ||
      undefined,
    branch_name:
      pickString(r, 'branch_name', 'branchName') || pickRelationName(r.branch) || undefined,
    ops_user_id: pickString(r, 'ops_user_id', 'opsUserId') || undefined,
    origin_port_id: pickString(r, 'origin_port_id', 'originPortId') || undefined,
    dest_port_id: pickString(r, 'dest_port_id', 'destPortId') || undefined,
    origin_port_code:
      pickString(r, 'origin_port_code', 'originPortCode') ||
      pickPortCode(r.origin_port ?? r.originPort) ||
      pickPortCode(sea?.port_of_loading ?? sea?.portOfLoading) ||
      undefined,
    dest_port_code:
      pickString(r, 'dest_port_code', 'destPortCode') ||
      pickPortCode(r.dest_port ?? r.destPort) ||
      pickPortCode(sea?.port_of_discharge ?? sea?.portOfDischarge) ||
      undefined,
    commodity: pickString(r, 'commodity') || undefined,
    hs_code: pickString(r, 'hs_code', 'hsCode') || undefined,
    gross_weight: num(r.gross_weight ?? r.grossWeight),
    chargeable_weight: num(r.chargeable_weight ?? r.chargeableWeight),
    volume_cbm: num(r.volume_cbm ?? r.volumeCbm),
    pieces: num(r.pieces),
    container_type_id: pickString(r, 'container_type_id', 'containerTypeId') || undefined,
    container_count: num(r.container_count ?? r.containerCount),
    incoterms: pickString(r, 'incoterms') || undefined,
    is_dg: bool(r.is_dg ?? r.isDg),
    dg_class: pickString(r, 'dg_class', 'dgClass') || undefined,
    notes: pickString(r, 'notes') || undefined,
    customer_remarks: pickString(r, 'customer_remarks', 'customerRemarks') || undefined,
    tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
    etd: pickString(r, 'etd') || undefined,
    eta: pickString(r, 'eta') || undefined,
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
    updated_at: pickString(r, 'updated_at', 'updatedAt') || undefined,
    air_details: air
      ? {
          airline_id: pickString(air, 'airline_id', 'airlineId') || undefined,
          origin_airport_id: pickString(air, 'origin_airport_id', 'originAirportId') || undefined,
          dest_airport_id: pickString(air, 'dest_airport_id', 'destAirportId') || undefined,
          hawb_number: pickString(air, 'hawb_number', 'hawbNumber') || undefined,
          mawb_number: pickString(air, 'mawb_number', 'mawbNumber') || undefined,
          flight_number: pickString(air, 'flight_number', 'flightNumber') || undefined,
          awb_type: pickString(air, 'awb_type', 'awbType') || undefined,
          freight_type: pickString(air, 'freight_type', 'freightType') || undefined,
          conversion_factor: num(air.conversion_factor ?? air.conversionFactor),
        }
      : undefined,
    sea_fcl_details: sea
      ? {
          shipping_line_id: pickString(sea, 'shipping_line_id', 'shippingLineId') || undefined,
          vessel_id: pickString(sea, 'vessel_id', 'vesselId') || undefined,
          voyage_number: pickString(sea, 'voyage_number', 'voyageNumber') || undefined,
          booking_reference: pickString(sea, 'booking_reference', 'bookingReference') || undefined,
          hbl_number: pickString(sea, 'hbl_number', 'hblNumber') || undefined,
          mbl_number: pickString(sea, 'mbl_number', 'mblNumber') || undefined,
          etd: pickString(sea, 'etd') || undefined,
          eta: pickString(sea, 'eta') || undefined,
          port_of_loading_id: pickString(sea, 'port_of_loading_id', 'portOfLoadingId') || undefined,
          port_of_discharge_id:
            pickString(sea, 'port_of_discharge_id', 'portOfDischargeId') || undefined,
        }
      : undefined,
    charges,
    milestones,
    notes_list: notesList,
    house_jobs: houseJobs,
  };
}

export function normalizeJobs(items: unknown[]): Job[] {
  return items.map(normalizeJob).filter((j): j is Job => Boolean(j));
}

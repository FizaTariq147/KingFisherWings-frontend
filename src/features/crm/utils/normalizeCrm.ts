import type { Budget, CallLog, Campaign, CampaignTemplate, DashboardOverview, Enquiry, FollowUp, Lead, Subscriber } from '../types/crm.types';
import { asRecord } from './crmUnwrap';

const string = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null) return String(record[key]);
  return '';
};
const optional = (record: Record<string, unknown>, ...keys: string[]) => string(record, ...keys) || undefined;
const base = (raw: unknown) => {
  const r = asRecord(raw);
  if (!r) return null;
  return { r, id: string(r, 'id', 'uuid', '_id'), created_at: optional(r, 'created_at', 'createdAt'), updated_at: optional(r, 'updated_at', 'updatedAt') };
};

export function normalizeLead(raw: unknown): Lead | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, created_at: b.created_at, updated_at: b.updated_at, company_name: string(b.r, 'company_name', 'companyName'), contact_name: string(b.r, 'contact_name', 'contactName'), email: optional(b.r, 'email'), phone: optional(b.r, 'phone'), potential_volume: optional(b.r, 'potential_volume', 'potentialVolume'), service_requirements: optional(b.r, 'service_requirements', 'serviceRequirements'), source: optional(b.r, 'source') as Lead['source'], status: (string(b.r, 'status') || 'NEW') as Lead['status'], assigned_salesperson_id: optional(b.r, 'assigned_salesperson_id', 'assignedSalespersonId'), priority: optional(b.r, 'priority') as Lead['priority'], tags: Array.isArray(b.r.tags) ? b.r.tags.map(String) : [], notes: optional(b.r, 'notes'), lost_reason: optional(b.r, 'lost_reason', 'lostReason') };
}
export function normalizeCallLog(raw: unknown): CallLog | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, date_time: string(b.r, 'date_time', 'dateTime'), contact_person: string(b.r, 'contact_person', 'contactPerson'), call_type: string(b.r, 'call_type', 'callType') as CallLog['call_type'], purpose: string(b.r, 'purpose') as CallLog['purpose'], discussion_summary: string(b.r, 'discussion_summary', 'discussionSummary'), outcome: string(b.r, 'outcome') as CallLog['outcome'], lead_id: optional(b.r, 'lead_id'), party_id: optional(b.r, 'party_id'), salesperson_id: optional(b.r, 'salesperson_id'), next_action: optional(b.r, 'next_action'), next_followup_date: optional(b.r, 'next_followup_date'), duration_minutes: Number(b.r.duration_minutes) || undefined };
}
export function normalizeFollowUp(raw: unknown): FollowUp | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, due_date: string(b.r, 'due_date', 'dueDate'), subject: string(b.r, 'subject'), status: (string(b.r, 'status') || 'PENDING') as FollowUp['status'], lead_id: optional(b.r, 'lead_id'), party_id: optional(b.r, 'party_id'), enquiry_id: optional(b.r, 'enquiry_id'), notes: optional(b.r, 'notes'), owner_id: optional(b.r, 'owner_id') };
}
function normalizeEnquiryActions(raw: unknown): Enquiry['actions'] {
  const r = asRecord(raw);
  if (!r) return undefined;
  const flag = (...keys: string[]): boolean | undefined => {
    for (const key of keys) {
      const v = r[key];
      if (typeof v === 'boolean') return v;
      if (v === 'true' || v === 1 || v === '1') return true;
      if (v === 'false' || v === 0 || v === '0') return false;
    }
    return undefined;
  };
  return {
    can_generate_quotation: flag(
      'can_generate_quotation',
      'canGenerateQuotation',
      'generate_quotation',
    ),
    can_convert_to_quote: flag(
      'can_convert_to_quote',
      'canConvertToQuote',
      'convert_to_quote',
      'convert',
    ),
    can_generate_shipment: flag(
      'can_generate_shipment',
      'canGenerateShipment',
      'generate_shipment',
    ),
    can_generate_job: flag('can_generate_job', 'canGenerateJob', 'generate_job'),
    can_cancel: flag('can_cancel', 'canCancel', 'cancel'),
    can_copy: flag('can_copy', 'canCopy', 'copy'),
    raw: r,
  };
}

export function normalizeEnquiry(raw: unknown): Enquiry | null {
  const b = base(raw); if (!b || !b.id) return null;
  const party = asRecord(b.r.party);
  const lead = asRecord(b.r.lead);
  const salesperson = asRecord(b.r.salesperson ?? b.r.sales_person);
  const quotation = asRecord(b.r.quotation);
  const shipment = asRecord(b.r.shipment);
  const job = asRecord(b.r.job);
  const partyName = party ? string(party, 'name', 'company_name', 'companyName') : '';
  const leadName = lead ? string(lead, 'company_name', 'companyName', 'contact_name', 'contactName') : '';
  const salespersonName = salesperson
    ? string(salesperson, 'full_name', 'fullName', 'name') ||
      [string(salesperson, 'first_name', 'firstName'), string(salesperson, 'last_name', 'lastName')].filter(Boolean).join(' ')
    : '';
  const originPort = asRecord(b.r.origin_port ?? b.r.originPort);
  const destPort = asRecord(b.r.dest_port ?? b.r.destPort);
  const porPort = asRecord(b.r.por_port ?? b.r.porPort);
  const carrier = asRecord(b.r.carrier);
  const num = (...keys: string[]) => {
    for (const key of keys) {
      const v = b.r[key];
      if (v === undefined || v === null || v === '') continue;
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return undefined;
  };
  const chargesRaw = b.r.charges;
  const charges = Array.isArray(chargesRaw)
    ? chargesRaw
        .map((line) => {
          const lr = asRecord(line);
          if (!lr) return null;
          const description = string(lr, 'description');
          const amount = Number(lr.amount);
          if (!description || !Number.isFinite(amount)) return null;
          return {
            party_id: optional(lr, 'party_id', 'partyId'),
            department_id: optional(lr, 'department_id', 'departmentId'),
            charge_code_id: optional(lr, 'charge_code_id', 'chargeCodeId'),
            description,
            quantity: Number(lr.quantity) || undefined,
            unit_price: Number(lr.unit_price ?? lr.unitPrice) || undefined,
            amount,
            currency_code: optional(lr, 'currency_code', 'currencyCode'),
            is_cost: typeof lr.is_cost === 'boolean' ? lr.is_cost : undefined,
          };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
    : undefined;

  return {
    ...b.r,
    id: b.id,
    created_at: b.created_at,
    updated_at: b.updated_at,
    party_name: partyName || optional(b.r, 'party_name', 'partyName'),
    lead_name: leadName || optional(b.r, 'lead_name', 'leadName'),
    salesperson_name: salespersonName || optional(b.r, 'salesperson_name', 'salespersonName'),
    enquiry_number: optional(b.r, 'enquiry_number', 'enquiryNumber', 'enquiry_no', 'enquiryNo', 'reference'),
    service_type: string(b.r, 'service_type', 'serviceType') as Enquiry['service_type'],
    currency_code: string(b.r, 'currency_code', 'currencyCode'),
    status: (string(b.r, 'status') || 'NEW') as Enquiry['status'],
    lead_id: optional(b.r, 'lead_id', 'leadId'),
    party_id: optional(b.r, 'party_id', 'partyId') || (party ? optional(party, 'id') : undefined),
    salesperson_id: optional(b.r, 'salesperson_id', 'salespersonId'),
    sales_coordinator_id: optional(b.r, 'sales_coordinator_id', 'salesCoordinatorId'),
    price_coordinator_id: optional(b.r, 'price_coordinator_id', 'priceCoordinatorId'),
    company_id: optional(b.r, 'company_id', 'companyId'),
    branch_id: optional(b.r, 'branch_id', 'branchId'),
    department_id: optional(b.r, 'department_id', 'departmentId'),
    enquiry_date: optional(b.r, 'enquiry_date', 'enquiryDate'),
    shipper_id: optional(b.r, 'shipper_id', 'shipperId'),
    consignee_id: optional(b.r, 'consignee_id', 'consigneeId'),
    shipper_address: optional(b.r, 'shipper_address', 'shipperAddress'),
    consignee_address: optional(b.r, 'consignee_address', 'consigneeAddress'),
    customer_address: optional(b.r, 'customer_address', 'customerAddress'),
    origin_port_id: optional(b.r, 'origin_port_id', 'originPortId'),
    dest_port_id: optional(b.r, 'dest_port_id', 'destPortId'),
    por_port_id: optional(b.r, 'por_port_id', 'porPortId'),
    origin_port_name:
      optional(b.r, 'origin_port_name', 'originPortName') ||
      (originPort ? string(originPort, 'name', 'code') : undefined),
    dest_port_name:
      optional(b.r, 'dest_port_name', 'destPortName') ||
      (destPort ? string(destPort, 'name', 'code') : undefined),
    por_port_name:
      optional(b.r, 'por_port_name', 'porPortName') ||
      (porPort ? string(porPort, 'name', 'code') : undefined),
    etd: optional(b.r, 'etd'),
    eta: optional(b.r, 'eta'),
    payable_at: optional(b.r, 'payable_at', 'payableAt'),
    dispatch_at: optional(b.r, 'dispatch_at', 'dispatchAt'),
    carrier_id: optional(b.r, 'carrier_id', 'carrierId'),
    carrier_name:
      optional(b.r, 'carrier_name', 'carrierName') ||
      (carrier ? string(carrier, 'name') : undefined),
    voyage_number: optional(b.r, 'voyage_number', 'voyageNumber'),
    vessel_name: optional(b.r, 'vessel_name', 'vesselName'),
    unit_price: num('unit_price', 'unitPrice'),
    gross_weight: num('gross_weight', 'grossWeight'),
    chargeable_weight: num('chargeable_weight', 'chargeableWeight'),
    net_weight: num('net_weight', 'netWeight'),
    weight_unit: optional(b.r, 'weight_unit', 'weightUnit'),
    volume_cbm: num('volume_cbm', 'volumeCbm'),
    cbm_unit: optional(b.r, 'cbm_unit', 'cbmUnit'),
    hs_code: optional(b.r, 'hs_code', 'hsCode'),
    pieces: num('pieces'),
    container_type_id: optional(b.r, 'container_type_id', 'containerTypeId'),
    container_count: num('container_count', 'containerCount'),
    cargo_details: optional(b.r, 'cargo_details', 'cargoDetails'),
    commodity: optional(b.r, 'commodity'),
    incoterms: optional(b.r, 'incoterms'),
    special_requirements: optional(b.r, 'special_requirements', 'specialRequirements'),
    charges,
    quotation_id:
      optional(b.r, 'quotation_id', 'quotationId') ||
      (quotation ? optional(quotation, 'id') : undefined),
    shipment_id:
      optional(b.r, 'shipment_id', 'shipmentId') ||
      (shipment ? optional(shipment, 'id') : undefined),
    job_id:
      optional(b.r, 'job_id', 'jobId') ||
      (job ? optional(job, 'id') : undefined),
    actions: normalizeEnquiryActions(
      b.r.actions ?? b.r.action_flags ?? b.r.actionFlags ?? b.r.available_actions,
    ),
  };
}
export function normalizeBudget(raw: unknown): Budget | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, salesperson_id: string(b.r, 'salesperson_id'), period_type: string(b.r, 'period_type') as Budget['period_type'], period_start: string(b.r, 'period_start'), target_amount: Number(b.r.target_amount ?? 0), job_type: optional(b.r, 'job_type') as Budget['job_type'], target_volume: Number(b.r.target_volume) || undefined, actual_amount: Number(b.r.actual_amount) || undefined };
}
export function normalizeSubscriber(raw: unknown): Subscriber | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, email: string(b.r, 'email'), full_name: optional(b.r, 'full_name'), party_id: optional(b.r, 'party_id'), country_code: optional(b.r, 'country_code'), tags: Array.isArray(b.r.tags) ? b.r.tags.map(String) : [], unsubscribed_at: optional(b.r, 'unsubscribed_at'), is_subscribed: typeof b.r.is_subscribed === 'boolean' ? b.r.is_subscribed : undefined };
}
export function normalizeTemplate(raw: unknown): CampaignTemplate | null {
  const b = base(raw); if (!b || !b.id) return null;
  return { ...b.r, id: b.id, name: string(b.r, 'name'), subject: string(b.r, 'subject'), body: string(b.r, 'body') };
}
export function normalizeCampaign(raw: unknown): Campaign | null {
  const t = normalizeTemplate(raw); const r = asRecord(raw); if (!t || !r) return null;
  return { ...t, scheduled_at: optional(r, 'scheduled_at'), status: optional(r, 'status'), filter_party_type: optional(r, 'filter_party_type'), filter_country: optional(r, 'filter_country') };
}

export function normalizeDashboard(raw: unknown): DashboardOverview {
  const r = asRecord(raw) ?? {};
  const data = asRecord(r.data) ?? r;
  const common = ['total_leads', 'qualified_leads', 'open_enquiries', 'quotes_created', 'won_leads', 'pending_follow_ups', 'overdue_follow_ups', 'revenue', 'budget', 'conversion_rate'];
  const metrics = common.filter((key) => data[key] !== undefined).map((key) => ({ label: key, value: typeof data[key] === 'number' || typeof data[key] === 'string' ? data[key] as number | string : 0 }));
  if (!metrics.length) Object.entries(data).forEach(([label, value]) => { if (typeof value === 'number' || typeof value === 'string') metrics.push({ label, value }); });
  return { metrics, raw: data };
}

export const normalizeMany = <T>(items: unknown[], fn: (raw: unknown) => T | null) => items.map(fn).filter((item): item is T => item !== null);

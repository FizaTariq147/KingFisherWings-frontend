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
export function normalizeEnquiry(raw: unknown): Enquiry | null {
  const b = base(raw); if (!b || !b.id) return null;
  const party = asRecord(b.r.party);
  const lead = asRecord(b.r.lead);
  const salesperson = asRecord(b.r.salesperson ?? b.r.sales_person);
  const partyName = party ? string(party, 'name', 'company_name', 'companyName') : '';
  const leadName = lead ? string(lead, 'company_name', 'companyName', 'contact_name', 'contactName') : '';
  const salespersonName = salesperson
    ? string(salesperson, 'full_name', 'fullName', 'name') ||
      [string(salesperson, 'first_name', 'firstName'), string(salesperson, 'last_name', 'lastName')].filter(Boolean).join(' ')
    : '';
  return {
    ...b.r,
    id: b.id,
    created_at: b.created_at,
    updated_at: b.updated_at,
    party_name: partyName || optional(b.r, 'party_name', 'partyName'),
    lead_name: leadName || optional(b.r, 'lead_name', 'leadName'),
    salesperson_name: salespersonName || optional(b.r, 'salesperson_name', 'salespersonName'),
    service_type: string(b.r, 'service_type', 'serviceType') as Enquiry['service_type'],
    currency_code: string(b.r, 'currency_code', 'currencyCode'),
    status: (string(b.r, 'status') || 'NEW') as Enquiry['status'],
    lead_id: optional(b.r, 'lead_id'),
    party_id: optional(b.r, 'party_id'),
    salesperson_id: optional(b.r, 'salesperson_id'),
    origin_port_id: optional(b.r, 'origin_port_id'),
    dest_port_id: optional(b.r, 'dest_port_id'),
    cargo_details: optional(b.r, 'cargo_details'),
    incoterms: optional(b.r, 'incoterms'),
    special_requirements: optional(b.r, 'special_requirements'),
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

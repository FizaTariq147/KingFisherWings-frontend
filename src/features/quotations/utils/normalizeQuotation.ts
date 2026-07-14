import { isUuid } from '@/lib/isUuid';
import {
  JOB_TYPES,
  QUOTATION_STATUSES,
  type JobType,
  type QuotationStatus,
} from '../constants/quotation.constants';
import type { Quotation, QuotationLine } from '../types/quotation.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function normalizeStatus(value: unknown): QuotationStatus {
  const raw = String(value ?? 'DRAFT').trim().toUpperCase();
  return (QUOTATION_STATUSES as readonly string[]).includes(raw)
    ? (raw as QuotationStatus)
    : 'DRAFT';
}

function normalizeJobType(value: unknown): JobType {
  const raw = String(value ?? 'SEA_FCL_EXPORT').trim().toUpperCase();
  return (JOB_TYPES as readonly string[]).includes(raw)
    ? (raw as JobType)
    : 'SEA_FCL_EXPORT';
}

export function normalizeQuotationLine(raw: unknown): QuotationLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;
  const charge_code_id = str(r.charge_code_id) ?? '';
  const description = str(r.description) ?? '';
  return {
    id,
    quotation_id: str(r.quotation_id),
    charge_code_id,
    charge_code: str(r.charge_code) ?? str(r.charge_code_code),
    description,
    unit: str(r.unit),
    quantity: num(r.quantity) ?? 1,
    unit_price: num(r.unit_price) ?? 0,
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate) ?? 1,
    tax_rate_id: str(r.tax_rate_id),
    tax_percent: num(r.tax_percent) ?? num(r.tax_rate),
    tax_amount: num(r.tax_amount),
    line_total: num(r.line_total) ?? num(r.amount) ?? num(r.total),
    is_cost: bool(r.is_cost) ?? false,
    supplier_id: str(r.supplier_id),
    sort_order: num(r.sort_order) ?? 0,
  };
}

export function normalizeQuotationLines(raw: unknown): QuotationLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeQuotationLine).filter((l): l is QuotationLine => Boolean(l));
}

export function normalizeQuotation(raw: unknown): Quotation | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;

  const customer_id = str(r.customer_id) ?? '';
  const nestedCustomer = asRecord(r.customer);
  const nestedOrigin = asRecord(r.origin_port) ?? asRecord(r.origin);
  const nestedDest = asRecord(r.dest_port) ?? asRecord(r.destination);
  const nestedSales = asRecord(r.salesperson);
  const nestedCarrier = asRecord(r.carrier);

  const linesRaw =
    r.lines ?? r.charge_lines ?? r.quotation_lines ?? asRecord(r.data)?.lines;

  return {
    id,
    quotation_number: str(r.quotation_number) ?? str(r.quote_no) ?? str(r.quote_number),
    quote_no: str(r.quote_no) ?? str(r.quotation_number),
    status: normalizeStatus(r.status),
    company_id: str(r.company_id),
    job_type: normalizeJobType(r.job_type),
    customer_id,
    customer_name:
      str(r.customer_name) ??
      str(nestedCustomer?.name) ??
      str(nestedCustomer?.party_name),
    salesperson_id: str(r.salesperson_id),
    salesperson_name:
      str(r.salesperson_name) ??
      ([str(nestedSales?.first_name), str(nestedSales?.last_name)].filter(Boolean).join(' ') ||
        str(nestedSales?.name)),
    branch_id: str(r.branch_id),
    department_id: str(r.department_id),
    carrier_id: str(r.carrier_id),
    carrier_name: str(r.carrier_name) ?? str(nestedCarrier?.name),
    origin_port_id: str(r.origin_port_id),
    dest_port_id: str(r.dest_port_id),
    origin_port_code: str(r.origin_port_code) ?? str(nestedOrigin?.code) ?? str(nestedOrigin?.unlocode),
    dest_port_code: str(r.dest_port_code) ?? str(nestedDest?.code) ?? str(nestedDest?.unlocode),
    origin_port_name: str(r.origin_port_name) ?? str(nestedOrigin?.name),
    dest_port_name: str(r.dest_port_name) ?? str(nestedDest?.name),
    incoterm: str(r.incoterm),
    commodity: str(r.commodity),
    hs_code: str(r.hs_code),
    gross_weight: num(r.gross_weight),
    chargeable_weight: num(r.chargeable_weight),
    volume_cbm: num(r.volume_cbm),
    pieces: num(r.pieces),
    container_count: num(r.container_count),
    container_type_id: str(r.container_type_id),
    is_dg: bool(r.is_dg) ?? false,
    dg_class: str(r.dg_class),
    special_requirements: str(r.special_requirements),
    carrier_preference: str(r.carrier_preference),
    routing_notes: str(r.routing_notes),
    remarks: str(r.remarks),
    internal_notes: str(r.internal_notes),
    transit_time_days: num(r.transit_time_days),
    valid_until: str(r.valid_until),
    quotation_date: str(r.quotation_date) ?? str(r.created_at)?.slice(0, 10),
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate) ?? 1,
    discount_percent: num(r.discount_percent),
    discount_amount: num(r.discount_amount),
    subtotal: num(r.subtotal),
    tax_total: num(r.tax_total),
    total_amount: num(r.total_amount) ?? num(r.total) ?? num(r.grand_total),
    cost_total: num(r.cost_total),
    revenue_total: num(r.revenue_total),
    gp_amount: num(r.gp_amount),
    gp_percent: num(r.gp_percent),
    contact_name: str(r.contact_name),
    contact_email: str(r.contact_email),
    contact_phone: str(r.contact_phone),
    lost_reason: str(r.lost_reason),
    lost_notes: str(r.lost_notes),
    parent_quotation_id: str(r.parent_quotation_id),
    revision_number: num(r.revision_number),
    job_id: str(r.job_id),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    created_by: str(r.created_by),
    lines: normalizeQuotationLines(linesRaw),
    status_history: Array.isArray(r.status_history)
      ? (r.status_history as Quotation['status_history'])
      : undefined,
    approvals: Array.isArray(r.approvals) ? (r.approvals as Quotation['approvals']) : undefined,
  };
}

export function normalizeQuotations(raw: unknown): Quotation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeQuotation).filter((q): q is Quotation => Boolean(q));
}

export function quotationDisplayNumber(q: Pick<Quotation, 'quotation_number' | 'quote_no' | 'id'>): string {
  return q.quotation_number || q.quote_no || q.id.slice(0, 8);
}

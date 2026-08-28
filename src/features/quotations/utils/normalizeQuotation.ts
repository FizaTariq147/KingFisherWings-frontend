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

function pickStr(r: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = str(r[key]);
    if (v) return v;
  }
  return undefined;
}

function pickPortCode(port: Record<string, unknown> | null): string | undefined {
  if (!port) return undefined;
  return (
    pickStr(port, 'code', 'un_locode', 'unLocode', 'unlocode', 'port_code', 'portCode') ||
    undefined
  );
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
  const nestedCustomer =
    asRecord(r.customer) ?? asRecord(r.customer_party) ?? asRecord(r.party);
  const nestedCompany = asRecord(r.company);
  const nestedOrigin =
    asRecord(r.origin_port) ?? asRecord(r.origin) ?? asRecord(r.originPort);
  const nestedDest =
    asRecord(r.dest_port) ?? asRecord(r.destination) ?? asRecord(r.destPort);
  const nestedSales = asRecord(r.salesperson);
  const nestedCarrier = asRecord(r.carrier);

  const linesRaw =
    r.lines ?? r.charge_lines ?? r.quotation_lines ?? asRecord(r.data)?.lines;

  return {
    id,
    quotation_number: str(r.quotation_number) ?? str(r.quote_no) ?? str(r.quote_number),
    quote_no: str(r.quote_no) ?? str(r.quotation_number),
    status: normalizeStatus(r.status),
    company_id:
      pickStr(r, 'company_id', 'companyId') ?? pickStr(nestedCompany ?? {}, 'id'),
    job_type: normalizeJobType(r.job_type),
    customer_id,
    customer_name:
      pickStr(r, 'customer_name', 'customerName') ??
      pickStr(nestedCustomer ?? {}, 'name', 'party_name', 'display_name', 'company_name'),
    salesperson_id: pickStr(r, 'salesperson_id', 'salespersonId'),
    salesperson_name:
      pickStr(r, 'salesperson_name', 'salespersonName') ??
      ([str(nestedSales?.first_name), str(nestedSales?.last_name)].filter(Boolean).join(' ') ||
        str(nestedSales?.name)),
    branch_id: pickStr(r, 'branch_id', 'branchId'),
    department_id: pickStr(r, 'department_id', 'departmentId'),
    carrier_id: pickStr(r, 'carrier_id', 'carrierId'),
    carrier_name: pickStr(r, 'carrier_name', 'carrierName') ?? str(nestedCarrier?.name),
    origin_port_id: pickStr(r, 'origin_port_id', 'originPortId'),
    dest_port_id: pickStr(r, 'dest_port_id', 'destPortId'),
    origin_port_code:
      pickStr(r, 'origin_port_code', 'originPortCode') ??
      pickPortCode(nestedOrigin) ??
      undefined,
    dest_port_code:
      pickStr(r, 'dest_port_code', 'destPortCode') ??
      pickPortCode(nestedDest) ??
      undefined,
    origin_port_name: pickStr(r, 'origin_port_name', 'originPortName') ?? str(nestedOrigin?.name),
    dest_port_name: pickStr(r, 'dest_port_name', 'destPortName') ?? str(nestedDest?.name),
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
    valid_until: pickStr(r, 'valid_until', 'validUntil')?.slice(0, 10),
    quotation_date: pickStr(r, 'quotation_date', 'quotationDate') ?? str(r.created_at)?.slice(0, 10),
    currency_code: (pickStr(r, 'currency_code', 'currencyCode') ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate ?? r.exchangeRate) ?? 1,
    discount_percent: num(r.discount_percent ?? r.discountPercent),
    discount_amount: num(r.discount_amount ?? r.discountAmount),
    subtotal: num(r.subtotal),
    tax_total: num(r.tax_total ?? r.taxTotal),
    total_amount:
      num(r.total_amount ?? r.totalAmount) ??
      num(r.total) ??
      num(r.grand_total ?? r.grandTotal) ??
      num(r.sale_total ?? r.saleTotal) ??
      num(asRecord(r.totals)?.total_amount) ??
      num(asRecord(r.totals)?.total) ??
      num(r.revenue_total ?? r.revenueTotal),
    cost_total: num(r.cost_total ?? r.costTotal),
    revenue_total: num(r.revenue_total ?? r.revenueTotal),
    gp_amount: num(r.gp_amount),
    gp_percent: num(r.gp_percent),
    contact_name:
      str(r.contact_name) ??
      str(asRecord(r.portal_user)?.full_name) ??
      str(asRecord(r.portal_user)?.fullName) ??
      str(asRecord(r.portal_user)?.name),
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
    created_by_name:
      str(r.created_by_name) ??
      str(r.created_by_full_name) ??
      str(asRecord(r.created_by_user)?.full_name) ??
      str(asRecord(r.created_by_user)?.fullName) ??
      str(asRecord(r.created_by_user)?.name) ??
      str(asRecord(r.creator)?.full_name) ??
      str(asRecord(r.creator)?.fullName) ??
      str(asRecord(r.creator)?.name),
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

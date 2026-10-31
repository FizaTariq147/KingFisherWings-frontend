import type {
  Job,
  JobActions,
  JobCharge,
  JobDetailTab,
  JobListParams,
  JobMilestone,
  JobNote,
  JobPnl,
  JobStatusOption,
  AirUldRequest,
  DeliveryAcknowledgement,
} from '../types/job.types';
import type { JobStatus } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';

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
    // Skip objects/arrays — callers must unwrap nested records explicitly.
    if (v == null || typeof v === 'object') continue;
    const s = String(v).trim();
    if (!s || s === 'undefined' || s === 'null') continue;
    return s;
  }
  return '';
}

function pickPortCode(value: unknown): string {
  const nested = asRecord(value);
  if (!nested) return '';
  return pickString(nested, 'code', 'port_code', 'portCode', 'iata_code', 'un_locode', 'unLocode', 'unlocode');
}

/** Prefer human-readable port/airport name when nested objects are present. */
function pickPortDisplay(value: unknown): string {
  const nested = asRecord(value);
  if (!nested) return '';
  const name = pickString(nested, 'name', 'port_name', 'portName', 'label', 'city');
  const code = pickPortCode(value);
  if (name && code && !name.toUpperCase().includes(code.toUpperCase())) return `${code} - ${name}`;
  return name || code;
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
      (Array.isArray(nested.milestones) && nested.milestones) ||
      (Array.isArray(nested.jobs) && nested.jobs) ||
      (Array.isArray(nested.shipments) && nested.shipments) ||
      (Array.isArray(nested.linked_shipments) && nested.linked_shipments) ||
      (Array.isArray(nested.uld_requests) && nested.uld_requests) ||
      (Array.isArray(nested.requests) && nested.requests) ||
      (Array.isArray(nested.vouchers) && nested.vouchers) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  const topList =
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.results) && envelope.results) ||
    (Array.isArray(envelope.milestones) && envelope.milestones) ||
    (Array.isArray(envelope.shipments) && envelope.shipments) ||
    (Array.isArray(envelope.linked_shipments) && envelope.linked_shipments) ||
    (Array.isArray(envelope.uld_requests) && envelope.uld_requests) ||
    (Array.isArray(envelope.requests) && envelope.requests) ||
    (Array.isArray(envelope.vouchers) && envelope.vouchers) ||
    [];
  return { items: topList, meta: envelope.meta };
}

export function normalizeAirUldRequest(raw: unknown): AirUldRequest | null {
  const record = asRecord(unwrapEntity(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id', 'request_id');
  if (!id) return null;
  const pallet = asRecord(record.air_pallet_type) ?? asRecord(record.pallet_type);
  return {
    id,
    job_id: pickString(record, 'job_id') || undefined,
    air_pallet_type_id: pickString(record, 'air_pallet_type_id', 'pallet_type_id') || undefined,
    air_pallet_type_code:
      pickString(record, 'air_pallet_type_code', 'pallet_type_code', 'code') ||
      pickString(pallet ?? {}, 'code', 'name') ||
      undefined,
    quantity: num(record.quantity ?? record.uld_count),
    status: pickString(record, 'status') || undefined,
    uld_number: pickString(record, 'uld_number', 'uld_code', 'container_number') || undefined,
    issued_at: pickString(record, 'issued_at') || undefined,
    allocated_at: pickString(record, 'allocated_at') || undefined,
    notes: pickString(record, 'notes') || undefined,
    created_at: pickString(record, 'created_at') || undefined,
    updated_at: pickString(record, 'updated_at') || undefined,
  };
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

function normalizeChargeSide(
  raw: Record<string, unknown> | null,
  side: 'sale' | 'cost',
): JobCharge['sale'] | undefined {
  if (!raw) return undefined;
  const bill =
    pickString(raw, 'bill_to', 'billTo', 'party_id', 'partyId') || undefined;
  const vendor =
    pickString(raw, 'vendor', 'vendor_id', 'vendorId', 'party_id', 'partyId') ||
    undefined;
  const party = asRecord(raw.party ?? raw.bill_to_party ?? raw.vendor_party);
  return {
    bill_to: side === 'sale' ? bill : undefined,
    bill_to_code:
      side === 'sale'
        ? pickString(raw, 'bill_to_code', 'billToCode') ||
          pickString(party ?? {}, 'code') ||
          undefined
        : undefined,
    bill_to_name:
      side === 'sale'
        ? pickString(raw, 'bill_to_name', 'billToName', 'party_name', 'partyName') ||
          pickString(party ?? {}, 'name') ||
          undefined
        : undefined,
    vendor: side === 'cost' ? vendor : undefined,
    vendor_code:
      side === 'cost'
        ? pickString(raw, 'vendor_code', 'vendorCode') ||
          pickString(party ?? {}, 'code') ||
          undefined
        : undefined,
    vendor_name:
      side === 'cost'
        ? pickString(raw, 'vendor_name', 'vendorName', 'party_name', 'partyName') ||
          pickString(party ?? {}, 'name') ||
          undefined
        : undefined,
    amount: num(raw.amount ?? raw.local_amount ?? raw.localAmount),
    qty: num(raw.qty ?? raw.quantity),
    amount_per_qty: num(
      raw.amount_per_qty ?? raw.amountPerQty ?? raw.unit_price ?? raw.unitPrice,
    ),
    currency:
      pickString(raw, 'currency', 'currency_code', 'currencyCode').toUpperCase() ||
      undefined,
    ex_rate: num(raw.ex_rate ?? raw.exRate ?? raw.exchange_rate ?? raw.exchangeRate),
    fcy_amount: num(raw.fcy_amount ?? raw.fcyAmount),
    local_amount: num(raw.local_amount ?? raw.localAmount ?? raw.amount),
    tax_amount: num(raw.tax_amount ?? raw.taxAmount),
    tax_group_code:
      pickString(raw, 'tax_group_code', 'taxGroupCode') || undefined,
    tax_rate_id: pickString(raw, 'tax_rate_id', 'taxRateId') || undefined,
    taxable_amount: num(raw.taxable_amount ?? raw.taxableAmount),
    dr_cr: pickString(raw, 'dr_cr', 'drCr') || undefined,
    remarks: pickString(raw, 'remarks') || undefined,
    gross_profit: num(raw.gross_profit ?? raw.grossProfit),
    editable:
      raw.editable === undefined && raw.Editable === undefined
        ? undefined
        : bool(raw.editable ?? raw.Editable, true),
    attachment_count:
      num(raw.attachment_count ?? raw.attachmentCount) ?? undefined,
    voucher_no:
      pickString(raw, 'voucher_no', 'voucherNo', 'voucher_number') || undefined,
  };
}

export function normalizeJobCharge(raw: unknown): JobCharge | null {
  const r = asRecord(raw);
  if (!r) return null;
  // Preview rows from get-job-charges may use charge_id / shipment_charge_id
  const id =
    str(r.id) ||
    pickString(r, 'charge_id', 'chargeId', 'shipment_charge_id', 'shipmentChargeId');
  if (!id) return null;
  const party = asRecord(r.party);
  const chargeSec = asRecord(r.charge);
  const sale = asRecord(r.sale);
  const cost = asRecord(r.cost);
  const saleView = normalizeChargeSide(sale, 'sale');
  const costView = normalizeChargeSide(cost, 'cost');
  const unitFromSides =
    num(sale?.unit_price ?? sale?.unitPrice ?? sale?.amount) ??
    num(cost?.unit_price ?? cost?.unitPrice ?? cost?.amount);
  const saleAmt =
    num(r.sale_amount ?? r.saleAmount) ??
    saleView?.local_amount ??
    saleView?.amount;
  const costAmt =
    num(r.cost_amount ?? r.costAmount) ??
    costView?.local_amount ??
    costView?.amount;
  return {
    id,
    charge_code_id:
      pickString(r, 'charge_code_id', 'chargeCodeId') ||
      pickString(chargeSec ?? {}, 'charge_code_id', 'chargeCodeId'),
    charge_code:
      pickString(r, 'charge_code', 'chargeCode', 'code') ||
      pickString(chargeSec ?? {}, 'charge_code', 'chargeCode', 'code') ||
      undefined,
    charge_code_name:
      pickString(r, 'charge_code_name', 'chargeCodeName') ||
      pickString(chargeSec ?? {}, 'charge_code_name', 'chargeCodeName', 'name') ||
      undefined,
    description:
      pickString(r, 'description', 'charge', 'charge_name', 'chargeName', 'name') ||
      pickString(chargeSec ?? {}, 'description', 'name', 'charge_name', 'chargeName') ||
      '—',
    quantity:
      num(r.quantity ?? r.qty) ??
      num(chargeSec?.quantity) ??
      num(sale?.quantity) ??
      num(cost?.quantity),
    unit_price:
      num(r.unit_price ?? r.unitPrice ?? r.amount_per_unit ?? r.amountPerUnit) ??
      unitFromSides ??
      0,
    currency_code:
      pickString(r, 'currency_code', 'currencyCode', 'currency').toUpperCase() ||
      pickString(sale ?? {}, 'currency_code', 'currencyCode', 'currency').toUpperCase() ||
      pickString(cost ?? {}, 'currency_code', 'currencyCode', 'currency').toUpperCase() ||
      'AED',
    exchange_rate:
      num(r.exchange_rate ?? r.exchangeRate ?? r.ex_rate ?? r.exRate) ??
      num(sale?.exchange_rate ?? sale?.exchangeRate) ??
      num(cost?.exchange_rate ?? cost?.exchangeRate),
    tax_rate_id: pickString(r, 'tax_rate_id', 'taxRateId') || undefined,
    // Dual-sided lines can carry both sale_amount + cost_amount; don't rely on is_cost alone.
    is_cost:
      bool(r.is_cost ?? r.isCost) === true
        ? true
        : saleAmt == null && costAmt != null
          ? true
          : bool(r.is_cost ?? r.isCost),
    is_billable: bool(r.is_billable ?? r.isBillable, true),
    is_provisional: bool(
      r.is_provisional ?? r.isProvisional ?? chargeSec?.is_provisional,
    ),
    party_id:
      pickString(r, 'party_id', 'partyId') ||
      saleView?.bill_to ||
      costView?.vendor ||
      undefined,
    party_name:
      pickString(r, 'party_name', 'partyName') ||
      pickString(party ?? {}, 'name', 'party_name') ||
      saleView?.bill_to_name ||
      costView?.vendor_name ||
      undefined,
    line_total:
      num(r.line_total ?? r.lineTotal) ?? saleAmt ?? costAmt,
    sale_amount: saleAmt,
    cost_amount: costAmt,
    line_no: num(r.line_no ?? r.lineNo),
    unit: pickString(r, 'unit') || undefined,
    pp_cc:
      pickString(r, 'pp_cc', 'ppCc', 'freight') ||
      pickString(chargeSec ?? {}, 'pp_cc', 'ppCc') ||
      undefined,
    ofd_type:
      pickString(r, 'ofd_type', 'ofdType') ||
      pickString(chargeSec ?? {}, 'ofd_type', 'ofdType') ||
      undefined,
    remarks:
      pickString(r, 'remarks') ||
      pickString(chargeSec ?? {}, 'remarks') ||
      undefined,
    sale_tax_amount:
      num(r.sale_tax_amount ?? r.saleTaxAmount) ?? saleView?.tax_amount,
    cost_tax_amount:
      num(r.cost_tax_amount ?? r.costTaxAmount) ?? costView?.tax_amount,
    sale_dr_cr: pickString(r, 'sale_dr_cr', 'saleDrCr') || saleView?.dr_cr || undefined,
    cost_dr_cr: pickString(r, 'cost_dr_cr', 'costDrCr') || costView?.dr_cr || undefined,
    gross_profit:
      num(r.gross_profit ?? r.grossProfit ?? r.gp) ??
      (saleAmt != null && costAmt != null ? saleAmt - costAmt : undefined),
    prorated_status:
      pickString(r, 'prorated_status', 'proratedStatus', 'prorate_status') || undefined,
    attachment_count: num(r.attachment_count ?? r.attachmentCount) ?? undefined,
    history_count: num(r.history_count ?? r.historyCount) ?? undefined,
    sale_voucher_no:
      pickString(r, 'sale_voucher_no', 'saleVoucherNo') ||
      saleView?.voucher_no ||
      undefined,
    cost_voucher_no:
      pickString(r, 'cost_voucher_no', 'costVoucherNo') ||
      costView?.voucher_no ||
      undefined,
    sale: saleView,
    cost: costView,
  };
}

export function normalizeJobCharges(raw: unknown): JobCharge[] {
  const { items } = unwrapList(raw);
  if (items.length) {
    return items.map(normalizeJobCharge).filter((c): c is JobCharge => Boolean(c));
  }
  // Costing getTab / charges envelope often uses `charges` / `lines` (not unwrapList keys).
  const root = asRecord(unwrapEntity(raw)) ?? asRecord(raw);
  if (!root) return [];
  for (const key of [
    'charges',
    'lines',
    'items',
    'preview_charges',
    'grid',
    'sale_charges',
    'cost_charges',
  ]) {
    const nested = root[key];
    if (Array.isArray(nested) && nested.length) {
      return nested
        .map(normalizeJobCharge)
        .filter((c): c is JobCharge => Boolean(c));
    }
  }
  return [];
}

function asLineRows(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row));
}

/** GET /jobs/:id/pnl — revenue/cost lines + totals (dual-sided costing). */
export function normalizeJobPnl(raw: unknown): JobPnl {
  const r = asRecord(unwrapEntity(raw) ?? raw) ?? {};
  const summary = asRecord(r.summary) ?? asRecord(r.totals) ?? r;
  const revenue = num(
    summary.revenue ??
      summary.total_revenue ??
      summary.totalRevenue ??
      summary.sale_total ??
      summary.saleTotal ??
      r.revenue ??
      r.total_revenue ??
      r.totalRevenue ??
      r.sale_amount ??
      r.saleAmount,
  );
  const cost = num(
    summary.cost ??
      summary.total_cost ??
      summary.totalCost ??
      summary.cost_total ??
      summary.costTotal ??
      r.cost ??
      r.total_cost ??
      r.totalCost ??
      r.cost_amount ??
      r.costAmount,
  );
  const gross_profit =
    num(
      summary.gross_profit ??
        summary.grossProfit ??
        summary.gp ??
        r.gross_profit ??
        r.grossProfit ??
        r.gp,
    ) ?? (revenue != null && cost != null ? revenue - cost : undefined);

  const revenue_lines = asLineRows(
    r.revenue_lines ?? r.revenueLines ?? r.sale_lines ?? r.saleLines,
  );
  const cost_lines = asLineRows(
    r.cost_lines ?? r.costLines ?? r.purchase_lines ?? r.purchaseLines,
  );
  let lines = asLineRows(r.lines ?? r.items ?? r.breakdown);
  if (!lines.length && (revenue_lines.length || cost_lines.length)) {
    lines = [
      ...revenue_lines.map((row) => ({ ...row, side: row.side ?? 'revenue' })),
      ...cost_lines.map((row) => ({ ...row, side: row.side ?? 'cost' })),
    ];
  }

  return {
    revenue,
    cost,
    gross_profit,
    currency_code:
      pickString(
        summary,
        'currency_code',
        'currencyCode',
        'currency',
      ).toUpperCase() ||
      pickString(r, 'currency_code', 'currencyCode', 'currency').toUpperCase() ||
      undefined,
    lines,
    revenue_lines: revenue_lines.length ? revenue_lines : undefined,
    cost_lines: cost_lines.length ? cost_lines : undefined,
  };
}

/** Frontend display heading — drop API slashes/underscores (keep route key unchanged). */
export function formatMilestoneHeading(raw: string): string {
  const s = String(raw ?? '').trim();
  if (!s) return 'Milestone';
  return s
    .replace(/[/\\|]+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Business key for PATCH /jobs/:id/milestones/:milestoneKey.
 * Prefer code/name from GET list — never UUID, never the literal "undefined".
 */
export function milestoneRouteKey(m: {
  milestone_key?: string | null;
  milestone?: string | null;
  id?: string | null;
}): string {
  const candidates = [m.milestone_key, m.milestone, m.id];
  for (const raw of candidates) {
    const key = String(raw ?? '').trim();
    if (!key || key === 'undefined' || key === 'null' || key === '[object Object]') continue;
    // Backend rejects UUID path keys — skip id-shaped values when a code exists above.
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
      continue;
    }
    return key;
  }
  return '';
}

export function normalizeMilestone(raw: unknown): JobMilestone | null {
  const r = asRecord(raw);
  if (!r) return null;

  const nested =
    asRecord(r.milestone) ||
    asRecord(r.milestone_def) ||
    asRecord(r.milestoneDef) ||
    asRecord(r.milestone_type) ||
    asRecord(r.milestoneType) ||
    asRecord(r.type);

  // Prefer explicit code fields (path key), then human name/label.
  const code =
    pickString(
      r,
      'milestone_key',
      'milestoneKey',
      'milestone_code',
      'milestoneCode',
      'code',
      'key',
      'type',
      'event',
      'event_code',
      'eventCode',
    ) ||
    (nested
      ? pickString(
          nested,
          'milestone_key',
          'milestoneKey',
          'milestone_code',
          'milestoneCode',
          'code',
          'key',
          'type',
          'name',
        )
      : '');

  const name =
    pickString(
      r,
      'milestone_name',
      'milestoneName',
      'name',
      'label',
      'title',
      'display_name',
      'displayName',
    ) ||
    (nested ? pickString(nested, 'name', 'label', 'title', 'display_name', 'displayName') : '');

  // If `milestone` was a plain string it wins as code fallback (and display when no label).
  const milestoneScalar =
    typeof r.milestone === 'string' || typeof r.milestone === 'number'
      ? String(r.milestone).trim()
      : '';

  const milestone_key = code || milestoneScalar || '';
  const milestone = name || milestoneScalar || milestone_key;
  if (!milestone && !milestone_key) return null;

  const id = str(r.id) || milestone_key || milestone;
  return {
    id,
    milestone: milestone || milestone_key,
    milestone_key: milestone_key || milestone || undefined,
    planned_date: pickString(r, 'planned_date', 'plannedDate') || undefined,
    actual_date: pickString(r, 'actual_date', 'actualDate') || undefined,
    completed_at: pickString(r, 'completed_at', 'completedAt') || undefined,
    description:
      pickString(r, 'description', 'milestone_description', 'milestoneDescription') || undefined,
    is_completed: Boolean(
      r.actual_date ??
        r.actualDate ??
        r.completed_at ??
        r.completedAt ??
        r.is_completed ??
        r.isCompleted ??
        r.completed,
    ),
    notes: pickString(r, 'notes') || undefined,
  };
}

export function normalizeMilestones(raw: unknown): JobMilestone[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeMilestone).filter((m): m is JobMilestone => Boolean(m));
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
  const code = pickString(nested, 'code', 'party_code', 'partyCode');
  const name =
    pickString(nested, 'name', 'full_name', 'fullName', 'company_name', 'companyName', 'party_name', 'partyName', 'display_name', 'displayName') ||
    '';
  if (code && name) return `${code} — ${name}`;
  if (name) return name;
  return code || undefined;
}

function pickJobScheduleDates(
  r: Record<string, unknown>,
  air: Record<string, unknown> | null,
  sea: Record<string, unknown> | null,
  seaLcl: Record<string, unknown> | null,
): { etd?: string; eta?: string } {
  const etd =
    pickString(r, 'etd', 'ETD') ||
    pickString(sea ?? {}, 'etd') ||
    pickString(seaLcl ?? {}, 'etd') ||
    pickString(air ?? {}, 'flight_date', 'flightDate') ||
    '';
  const eta =
    pickString(r, 'eta', 'ETA') ||
    pickString(sea ?? {}, 'eta') ||
    pickString(seaLcl ?? {}, 'eta') ||
    '';
  return {
    etd: etd ? etd.slice(0, 10) : undefined,
    eta: eta ? eta.slice(0, 10) : undefined,
  };
}

export function normalizeJob(raw: unknown): Job | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;

  const chargesRaw = r.charges ?? r.charge_lines;
  const milestonesRaw = r.milestones;
  const notesRaw = r.notes_list ?? r.job_notes ?? r.notes;
  const houseRaw = r.house_jobs ?? r.houseJobs;

  const charges = Array.isArray(chargesRaw)
    ? chargesRaw.map(normalizeJobCharge).filter((c): c is JobCharge => Boolean(c))
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
  const seaLcl = asRecord(r.sea_lcl_details ?? r.seaLclDetails);
  const courier = asRecord(r.courier_details ?? r.courierDetails);
  const land = asRecord(r.land_details ?? r.landDetails);
  const road = asRecord(r.road_freight_details ?? r.roadFreightDetails);
  const schedule = pickJobScheduleDates(r, air, sea, seaLcl);

  let jobType = canonicalizeJobType(pickString(r, 'job_type', 'jobType'), 'AIR_EXPORT');
  // Some convert paths store ROAD under land-ish labels but still attach road_freight_details.
  if (
    road &&
    Object.keys(road).length > 0 &&
    (jobType === 'LAND' || jobType === 'AIR_EXPORT' || jobType === 'SERVICE_JOB')
  ) {
    jobType = 'ROAD_FREIGHT';
  }

  return {
    id: str(r.id),
    job_number: pickString(r, 'job_number', 'jobNumber', 'job_no', 'jobNo') || undefined,
    job_type: jobType,
    status: (pickString(r, 'status') || 'ENQUIRY') as JobStatus,
    status_code: pickString(r, 'status_code', 'statusCode') || undefined,
    company_id: pickString(r, 'company_id', 'companyId') || undefined,
    branch_id: pickString(r, 'branch_id', 'branchId') || undefined,
    department_id: pickString(r, 'department_id', 'departmentId') || undefined,
    parent_job_id: pickString(r, 'parent_job_id', 'parentJobId') || undefined,
    quotation_id:
      pickString(r, 'quotation_id', 'quotationId', 'source_quotation_id', 'sourceQuotationId') ||
      pickString(asRecord(r.quotation) ?? {}, 'id') ||
      undefined,
    quotation_number:
      pickString(r, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo') ||
      pickString(
        asRecord(r.quotation) ?? {},
        'quotation_number',
        'quotationNumber',
        'quote_no',
        'quoteNo',
        'number',
        'reference',
      ) ||
      undefined,
    shipment_id:
      pickString(r, 'shipment_id', 'shipmentId', 'source_shipment_id', 'sourceShipmentId') ||
      pickString(asRecord(r.shipment) ?? {}, 'id') ||
      undefined,
    shipment_number:
      pickString(r, 'shipment_number', 'shipmentNumber', 'shipment_no', 'shipmentNo') ||
      pickString(
        asRecord(r.shipment) ?? {},
        'shipment_number',
        'shipmentNumber',
        'shipment_no',
        'shipmentNo',
        'number',
        'reference',
      ) ||
      undefined,
    enquiry_id:
      pickString(
        r,
        'enquiry_id',
        'enquiryId',
        'crm_enquiry_id',
        'crmEnquiryId',
        'source_enquiry_id',
        'sourceEnquiryId',
      ) ||
      pickString(asRecord(r.enquiry) ?? {}, 'id') ||
      undefined,
    enquiry_number:
      pickString(r, 'enquiry_number', 'enquiryNumber', 'enquiry_no', 'enquiryNo') ||
      pickString(
        asRecord(r.enquiry) ?? {},
        'enquiry_number',
        'enquiryNumber',
        'enquiry_no',
        'enquiryNo',
        'number',
        'reference',
      ) ||
      undefined,
    currency_code:
      pickString(r, 'currency_code', 'currencyCode', 'currency')?.toUpperCase() || undefined,
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
    billing_party_id: pickString(r, 'billing_party_id', 'billingPartyId') || undefined,
    billing_party_name:
      pickString(r, 'billing_party_name', 'billingPartyName') ||
      pickRelationName(r.billing_party ?? r.billingParty) ||
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
    company_name:
      pickString(r, 'company_name', 'companyName') || pickRelationName(r.company) || undefined,
    department_name:
      pickString(r, 'department_name', 'departmentName') ||
      pickRelationName(r.department) ||
      undefined,
    ops_user_id: pickString(r, 'ops_user_id', 'opsUserId') || undefined,
    ops_user_name:
      pickString(r, 'ops_user_name', 'opsUserName') ||
      pickRelationName(r.ops_user ?? r.opsUser) ||
      undefined,
    origin_port_id: pickString(r, 'origin_port_id', 'originPortId') || undefined,
    dest_port_id: pickString(r, 'dest_port_id', 'destPortId') || undefined,
    origin_port_code:
      pickString(r, 'origin_port_code', 'originPortCode', 'origin_port_name', 'originPortName') ||
      pickPortDisplay(r.origin_port ?? r.originPort) ||
      pickPortDisplay(sea?.port_of_loading ?? sea?.portOfLoading) ||
      pickPortDisplay(seaLcl?.port_of_loading ?? seaLcl?.portOfLoading) ||
      pickPortDisplay(air?.origin_airport ?? air?.originAirport) ||
      pickPortCode(r.origin_port ?? r.originPort) ||
      undefined,
    dest_port_code:
      pickString(r, 'dest_port_code', 'destPortCode', 'dest_port_name', 'destPortName') ||
      pickPortDisplay(r.dest_port ?? r.destPort) ||
      pickPortDisplay(sea?.port_of_discharge ?? sea?.portOfDischarge) ||
      pickPortDisplay(seaLcl?.port_of_discharge ?? seaLcl?.portOfDischarge) ||
      pickPortDisplay(air?.dest_airport ?? air?.destAirport) ||
      pickPortCode(r.dest_port ?? r.destPort) ||
      undefined,
    commodity: pickString(r, 'commodity') || undefined,
    commodity_description:
      pickString(r, 'commodity_description', 'commodityDescription') || undefined,
    hs_code: pickString(r, 'hs_code', 'hsCode') || undefined,
    job_date: pickString(r, 'job_date', 'jobDate') || undefined,
    client_reference_no:
      pickString(r, 'client_reference_no', 'clientReferenceNo', 'po_number', 'poNumber') ||
      undefined,
    client_reference_type:
      pickString(r, 'client_reference_type', 'clientReferenceType', 'reference_type') ||
      undefined,
    actions: normalizeJobActions(r.actions),
    path_hints: normalizePathHints(r.path_hints ?? r.pathHints),
    ops_continuum: (() => {
      const rec = asRecord(r.ops_continuum ?? r.opsContinuum);
      return rec && Object.keys(rec).length ? rec : undefined;
    })(),
    tabs: normalizeJobTabs(r.tabs),
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
    barcode:
      pickString(r, 'barcode', 'barcode_value', 'barcodeValue', 'barcode_code', 'barcodeCode') ||
      undefined,
    barcode_value:
      pickString(r, 'barcode_value', 'barcodeValue', 'barcode', 'barcode_code', 'barcodeCode') ||
      undefined,
    etd: schedule.etd,
    eta: schedule.eta,
    hold_reason:
      pickString(r, 'hold_reason', 'holdReason', 'stop_reason', 'stopReason') || undefined,
    held_at: pickString(r, 'held_at', 'heldAt', 'stopped_at', 'stoppedAt') || undefined,
    expected_release_at:
      pickString(r, 'expected_release_at', 'expectedReleaseAt', 'expected_release_date') ||
      undefined,
    resume_reason: pickString(r, 'resume_reason', 'resumeReason') || undefined,
    resumed_at: pickString(r, 'resumed_at', 'resumedAt') || undefined,
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
          flight_date: pickString(air, 'flight_date', 'flightDate') || undefined,
          screened: bool(air.screened),
          screening_ref: pickString(air, 'screening_ref', 'screeningRef') || undefined,
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
          shipping_line_name:
            pickString(sea, 'shipping_line_name', 'shippingLineName') ||
            pickRelationName(sea.shipping_line ?? sea.shippingLine) ||
            undefined,
          vessel_name:
            pickString(sea, 'vessel_name', 'vesselName') ||
            pickRelationName(sea.vessel) ||
            undefined,
          booking_number:
            pickString(sea, 'booking_number', 'bookingNumber', 'booking_reference', 'bookingReference') ||
            undefined,
          carrier_booking_ref:
            pickString(sea, 'carrier_booking_ref', 'carrierBookingRef') || undefined,
          hbl_number: pickString(sea, 'hbl_number', 'hblNumber') || undefined,
          mbl_number: pickString(sea, 'mbl_number', 'mblNumber') || undefined,
          place_of_receipt: pickString(sea, 'place_of_receipt', 'placeOfReceipt') || undefined,
          place_of_delivery: pickString(sea, 'place_of_delivery', 'placeOfDelivery') || undefined,
          etd: pickString(sea, 'etd') || undefined,
          eta: pickString(sea, 'eta') || undefined,
          actual_eta: pickString(sea, 'actual_eta', 'actualEta') || undefined,
          incoterms: pickString(sea, 'incoterms') || undefined,
          stuffing_location: pickString(sea, 'stuffing_location', 'stuffingLocation') || undefined,
          stuffing_date: pickString(sea, 'stuffing_date', 'stuffingDate') || undefined,
          si_cutoff: pickString(sea, 'si_cutoff', 'siCutoff') || undefined,
          vgm_cutoff: pickString(sea, 'vgm_cutoff', 'vgmCutoff') || undefined,
          cy_cutoff: pickString(sea, 'cy_cutoff', 'cyCutoff') || undefined,
          si_submitted_at: pickString(sea, 'si_submitted_at', 'siSubmittedAt') || undefined,
          si_version: num(sea.si_version ?? sea.siVersion),
          vgm_submitted_at: pickString(sea, 'vgm_submitted_at', 'vgmSubmittedAt') || undefined,
          vgm_method: pickString(sea, 'vgm_method', 'vgmMethod') || undefined,
          port_of_loading_id: pickString(sea, 'port_of_loading_id', 'portOfLoadingId') || undefined,
          port_of_discharge_id:
            pickString(sea, 'port_of_discharge_id', 'portOfDischargeId') || undefined,
          bl_type: pickString(sea, 'bl_type', 'blType') || undefined,
          freight_terms: pickString(sea, 'freight_terms', 'freightTerms') || undefined,
          transhipment_port: pickString(sea, 'transhipment_port', 'transhipmentPort') || undefined,
          sailed_at: pickString(sea, 'sailed_at', 'sailedAt') || undefined,
          mbl_number_from_line:
            pickString(sea, 'mbl_number_from_line', 'mblNumberFromLine') || undefined,
          hbl_number_from_agent:
            pickString(sea, 'hbl_number_from_agent', 'hblNumberFromAgent') || undefined,
          customs_entry_number:
            pickString(sea, 'customs_entry_number', 'customsEntryNumber') || undefined,
          customs_examination_details:
            pickString(sea, 'customs_examination_details', 'customsExaminationDetails') ||
            undefined,
          customs_duty_amount: num(sea.customs_duty_amount ?? sea.customsDutyAmount),
          customs_tax_amount: num(sea.customs_tax_amount ?? sea.customsTaxAmount),
          customs_clearance_date:
            pickString(sea, 'customs_clearance_date', 'customsClearanceDate') || undefined,
          customs_status: pickString(sea, 'customs_status', 'customsStatus') || undefined,
          customs_broker_id: pickString(sea, 'customs_broker_id', 'customsBrokerId') || undefined,
          linked_export_job_id:
            pickString(sea, 'linked_export_job_id', 'linkedExportJobId') || undefined,
          cfs_storage_rate_per_day: num(
            sea.cfs_storage_rate_per_day ?? sea.cfsStorageRatePerDay,
          ),
          cfs_storage_start_date:
            pickString(sea, 'cfs_storage_start_date', 'cfsStorageStartDate') || undefined,
        }
      : undefined,
    sea_lcl_details: seaLcl
      ? {
          shipping_line_id: pickString(seaLcl, 'shipping_line_id', 'shippingLineId') || undefined,
          vessel_id: pickString(seaLcl, 'vessel_id', 'vesselId') || undefined,
          voyage_number: pickString(seaLcl, 'voyage_number', 'voyageNumber') || undefined,
          vessel_name:
            pickString(seaLcl, 'vessel_name', 'vesselName') ||
            pickRelationName(seaLcl.vessel) ||
            undefined,
          booking_number: pickString(seaLcl, 'booking_number', 'bookingNumber') || undefined,
          carrier_booking_ref:
            pickString(seaLcl, 'carrier_booking_ref', 'carrierBookingRef') || undefined,
          hbl_number: pickString(seaLcl, 'hbl_number', 'hblNumber') || undefined,
          mbl_number: pickString(seaLcl, 'mbl_number', 'mblNumber') || undefined,
          place_of_receipt:
            pickString(seaLcl, 'place_of_receipt', 'placeOfReceipt') || undefined,
          place_of_delivery:
            pickString(seaLcl, 'place_of_delivery', 'placeOfDelivery') || undefined,
          etd: pickString(seaLcl, 'etd') || undefined,
          eta: pickString(seaLcl, 'eta') || undefined,
          actual_eta: pickString(seaLcl, 'actual_eta', 'actualEta') || undefined,
          incoterms: pickString(seaLcl, 'incoterms') || undefined,
          freight_terms: pickString(seaLcl, 'freight_terms', 'freightTerms') || undefined,
          bl_type: pickString(seaLcl, 'bl_type', 'blType') || undefined,
          port_of_loading_id:
            pickString(seaLcl, 'port_of_loading_id', 'portOfLoadingId') || undefined,
          port_of_discharge_id:
            pickString(seaLcl, 'port_of_discharge_id', 'portOfDischargeId') || undefined,
          transhipment_port:
            pickString(seaLcl, 'transhipment_port', 'transhipmentPort') || undefined,
          sailed_at: pickString(seaLcl, 'sailed_at', 'sailedAt') || undefined,
          si_cutoff: pickString(seaLcl, 'si_cutoff', 'siCutoff') || undefined,
          si_submitted_at: pickString(seaLcl, 'si_submitted_at', 'siSubmittedAt') || undefined,
          si_version: num(seaLcl.si_version ?? seaLcl.siVersion),
          consolidation_number:
            pickString(seaLcl, 'consolidation_number', 'consolidationNumber') || undefined,
          cfs_warehouse_id: pickString(seaLcl, 'cfs_warehouse_id', 'cfsWarehouseId') || undefined,
          cfs_storage_free_days: num(seaLcl.cfs_storage_free_days ?? seaLcl.cfsStorageFreeDays),
          cfs_storage_rate_per_day: num(
            seaLcl.cfs_storage_rate_per_day ?? seaLcl.cfsStorageRatePerDay,
          ),
          cfs_storage_start_date:
            pickString(seaLcl, 'cfs_storage_start_date', 'cfsStorageStartDate') || undefined,
          storage_rate_basis:
            pickString(seaLcl, 'storage_rate_basis', 'storageRateBasis') || undefined,
          wms_storage_charge_id:
            pickString(seaLcl, 'wms_storage_charge_id', 'wmsStorageChargeId') || undefined,
          customs_broker_id:
            pickString(seaLcl, 'customs_broker_id', 'customsBrokerId') || undefined,
          customs_entry_number:
            pickString(seaLcl, 'customs_entry_number', 'customsEntryNumber') || undefined,
          customs_examination_details:
            pickString(seaLcl, 'customs_examination_details', 'customsExaminationDetails') ||
            undefined,
          customs_duty_amount: num(seaLcl.customs_duty_amount ?? seaLcl.customsDutyAmount),
          customs_tax_amount: num(seaLcl.customs_tax_amount ?? seaLcl.customsTaxAmount),
          customs_clearance_date:
            pickString(seaLcl, 'customs_clearance_date', 'customsClearanceDate') || undefined,
          customs_status: pickString(seaLcl, 'customs_status', 'customsStatus') || undefined,
          linked_export_job_id:
            pickString(seaLcl, 'linked_export_job_id', 'linkedExportJobId') || undefined,
        }
      : undefined,
    courier_details: courier
      ? {
          courier_vendor_id:
            pickString(courier, 'courier_vendor_id', 'courierVendorId') || undefined,
          tracking_number: pickString(courier, 'tracking_number', 'trackingNumber') || undefined,
          service_type: pickString(courier, 'service_type', 'serviceType') || undefined,
          label_format: pickString(courier, 'label_format', 'labelFormat') || undefined,
          barcode_value: pickString(courier, 'barcode_value', 'barcodeValue') || undefined,
          pickup_address: pickString(courier, 'pickup_address', 'pickupAddress') || undefined,
          delivery_address:
            pickString(courier, 'delivery_address', 'deliveryAddress') || undefined,
          length_cm: num(courier.length_cm ?? courier.lengthCm),
          width_cm: num(courier.width_cm ?? courier.widthCm),
          height_cm: num(courier.height_cm ?? courier.heightCm),
          linked_export_job_id:
            pickString(courier, 'linked_export_job_id', 'linkedExportJobId') || undefined,
          linked_import_job_id:
            pickString(courier, 'linked_import_job_id', 'linkedImportJobId') || undefined,
        }
      : undefined,
    land_details: land
      ? {
          trucker_id: pickString(land, 'trucker_id', 'truckerId') || undefined,
          vehicle_number: pickString(land, 'vehicle_number', 'vehicleNumber') || undefined,
          vehicle_type: pickString(land, 'vehicle_type', 'vehicleType') || undefined,
          driver_name: pickString(land, 'driver_name', 'driverName') || undefined,
          driver_license: pickString(land, 'driver_license', 'driverLicense') || undefined,
          origin_city_country:
            pickString(land, 'origin_city_country', 'originCityCountry') || undefined,
          destination_city_country:
            pickString(land, 'destination_city_country', 'destinationCityCountry') || undefined,
          etd: pickString(land, 'etd') || undefined,
          eta: pickString(land, 'eta') || undefined,
          incoterms: pickString(land, 'incoterms') || undefined,
          freight_terms: pickString(land, 'freight_terms', 'freightTerms') || undefined,
          border_origin_country:
            pickString(land, 'border_origin_country', 'borderOriginCountry') || undefined,
          border_destination_country:
            pickString(land, 'border_destination_country', 'borderDestinationCountry') ||
            undefined,
          border_declaration_number:
            pickString(land, 'border_declaration_number', 'borderDeclarationNumber') || undefined,
          border_hs_code: pickString(land, 'border_hs_code', 'borderHsCode') || undefined,
          border_commodity:
            pickString(land, 'border_commodity', 'borderCommodity', 'commodity') || undefined,
          border_declared_value: num(land.border_declared_value ?? land.borderDeclaredValue),
          cross_border_docs_required: bool(
            land.cross_border_docs_required ?? land.crossBorderDocsRequired,
          ),
        }
      : undefined,
    road_freight_details: (() => {
      if (!road) return undefined;
      return {
        trucker_id: pickString(road, 'trucker_id', 'truckerId') || undefined,
        vehicle_number: pickString(road, 'vehicle_number', 'vehicleNumber') || undefined,
        vehicle_type: pickString(road, 'vehicle_type', 'vehicleType') || undefined,
        trailer_number: pickString(road, 'trailer_number', 'trailerNumber') || undefined,
        driver_name: pickString(road, 'driver_name', 'driverName') || undefined,
        driver_license: pickString(road, 'driver_license', 'driverLicense') || undefined,
        origin_city_country:
          pickString(road, 'origin_city_country', 'originCityCountry') || undefined,
        destination_city_country:
          pickString(road, 'destination_city_country', 'destinationCityCountry') || undefined,
        route_notes: pickString(road, 'route_notes', 'routeNotes') || undefined,
        etd: pickString(road, 'etd') || undefined,
        eta: pickString(road, 'eta') || undefined,
        incoterms: pickString(road, 'incoterms') || undefined,
        freight_terms: pickString(road, 'freight_terms', 'freightTerms') || undefined,
        border_origin_country:
          pickString(road, 'border_origin_country', 'borderOriginCountry') || undefined,
        border_destination_country:
          pickString(road, 'border_destination_country', 'borderDestinationCountry') || undefined,
        border_declaration_number:
          pickString(road, 'border_declaration_number', 'borderDeclarationNumber') || undefined,
        border_hs_code: pickString(road, 'border_hs_code', 'borderHsCode') || undefined,
        border_commodity:
          pickString(road, 'border_commodity', 'borderCommodity', 'commodity') || undefined,
        border_declared_value: num(road.border_declared_value ?? road.borderDeclaredValue),
        cross_border_docs_required: bool(
          road.cross_border_docs_required ?? road.crossBorderDocsRequired,
        ),
      };
    })(),
    service_scope: pickString(r, 'service_scope', 'serviceScope') || undefined,
    origin_door_address:
      pickString(r, 'origin_door_address', 'originDoorAddress') || undefined,
    dest_door_address: pickString(r, 'dest_door_address', 'destDoorAddress') || undefined,
    cargo_category: pickString(r, 'cargo_category', 'cargoCategory') || undefined,
    charges,
    milestones,
    notes_list: notesList,
    house_jobs: houseJobs,
    containers: Array.isArray(r.containers) ? (r.containers as Job['containers']) : undefined,
    cargo: Array.isArray(r.cargo) ? (r.cargo as Job['cargo']) : undefined,
    documents: Array.isArray(r.documents) ? (r.documents as Job['documents']) : undefined,
    bills_of_lading: Array.isArray(r.bills_of_lading ?? r.billsOfLading)
      ? ((r.bills_of_lading ?? r.billsOfLading) as Job['bills_of_lading'])
      : undefined,
  };
}

function normalizeJobActions(raw: unknown): JobActions | undefined {
  const record = asRecord(raw);
  if (!record) return undefined;
  const out: JobActions = { raw: record };
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'boolean') out[key] = value;
    else if (value === 'true' || value === 1 || value === '1') out[key] = true;
    else if (value === 'false' || value === 0 || value === '0') out[key] = false;
  }
  const statusList =
    record.allowed_statuses ?? record.allowedStatuses ?? record.statuses;
  if (Array.isArray(statusList)) {
    out.allowed_statuses = statusList
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
  }
  return Object.keys(out).length > 1 || out.allowed_statuses?.length
    ? out
    : Object.keys(out).length
      ? out
      : undefined;
}

function normalizePathHints(raw: unknown): string[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const hints = raw
      .map((h) => (typeof h === 'string' ? h.trim() : ''))
      .filter(Boolean);
    return hints.length ? hints : undefined;
  }
  const rec = asRecord(raw);
  if (!rec) return undefined;
  const hints = Object.keys(rec).filter((k) => {
    const v = rec[k];
    return v === true || v === 'true' || typeof v === 'string';
  });
  return hints.length ? hints : undefined;
}

function humanizeTabLabel(raw: string): string {
  return raw
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeJobTabs(raw: unknown): JobDetailTab[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const tabs: JobDetailTab[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      const key = item.trim();
      tabs.push({ key, label: humanizeTabLabel(key) });
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const key = pickString(rec, 'key', 'id', 'name', 'tab');
    if (!key) continue;
    const apiLabel = pickString(rec, 'label', 'title', 'name');
    tabs.push({
      key,
      label:
        apiLabel && !/[_-]/.test(apiLabel) ? apiLabel : humanizeTabLabel(apiLabel || key),
    });
  }
  return tabs.length ? tabs : undefined;
}

/** Normalize GET /jobs/status-options (flat list or Approved/Open/Closed groups). */
export function normalizeJobStatusOptions(raw: unknown): JobStatusOption[] {
  const envelope = asRecord(unwrapEntity(raw)) ?? asRecord(raw);
  const candidates: unknown[] = [];
  if (Array.isArray(raw)) candidates.push(...raw);
  if (envelope) {
    for (const key of ['options', 'items', 'statuses', 'data', 'results']) {
      if (Array.isArray(envelope[key])) candidates.push(...(envelope[key] as unknown[]));
    }
    for (const group of ['Approved', 'Open', 'Closed', 'approved', 'open', 'closed']) {
      const list = envelope[group];
      if (Array.isArray(list)) {
        for (const item of list) {
          if (typeof item === 'string') {
            candidates.push({ value: item, label: item, group });
          } else {
            const rec = asRecord(item);
            if (rec) candidates.push({ ...rec, group: rec.group ?? group });
          }
        }
      }
    }
  }

  const seen = new Set<string>();
  const out: JobStatusOption[] = [];
  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) {
      const value = item.trim().toUpperCase();
      if (seen.has(value)) continue;
      seen.add(value);
      out.push({ value, label: value.replaceAll('_', ' ') });
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const value = pickString(rec, 'value', 'status', 'code', 'id', 'key').toUpperCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    const mapsTo = pickString(
      rec,
      'maps_to_system_status',
      'mapsToSystemStatus',
      'maps_to',
      'system_status',
    ).toUpperCase();
    const code = pickString(rec, 'code', 'status_code', 'statusCode') || value;
    out.push({
      value: code || value,
      label: pickString(rec, 'label', 'name', 'title') || value.replaceAll('_', ' '),
      group: pickString(rec, 'group', 'category', 'bucket') || undefined,
      code: code || undefined,
      maps_to_system_status: mapsTo || undefined,
      is_system:
        typeof rec.is_system === 'boolean'
          ? rec.is_system
          : typeof rec.isSystem === 'boolean'
            ? rec.isSystem
            : undefined,
      is_custom:
        typeof rec.is_custom === 'boolean'
          ? rec.is_custom
          : typeof rec.isCustom === 'boolean'
            ? rec.isCustom
            : undefined,
      is_active:
        typeof rec.is_active === 'boolean'
          ? rec.is_active
          : typeof rec.isActive === 'boolean'
            ? rec.isActive
            : undefined,
    });
  }
  return out;
}

export function normalizeJobs(items: unknown[]): Job[] {
  return items.map(normalizeJob).filter((j): j is Job => Boolean(j));
}

/** Normalize GET/POST acknowledgement payloads (extends ProofOfDelivery). */
export function normalizeDeliveryAcknowledgement(raw: unknown): DeliveryAcknowledgement {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  const nested =
    asRecord(r.acknowledgement) ??
    asRecord(r.delivery_acknowledgement) ??
    asRecord(r.proof_of_delivery) ??
    r;
  const pathHintsRaw = nested.path_hints ?? nested.pathHints ?? r.path_hints;
  let path_hints: DeliveryAcknowledgement['path_hints'];
  if (Array.isArray(pathHintsRaw)) {
    path_hints = pathHintsRaw.map(String);
  } else if (asRecord(pathHintsRaw)) {
    path_hints = Object.fromEntries(
      Object.entries(asRecord(pathHintsRaw)!).map(([k, v]) => [k, String(v ?? '')]),
    );
  }
  return {
    id: pickString(nested, 'id') || undefined,
    job_id: pickString(nested, 'job_id', 'jobId') || undefined,
    status:
      pickString(nested, 'status', 'acknowledgement_status', 'ack_status').toUpperCase() ||
      'DRAFT',
    acknowledged_at:
      pickString(nested, 'acknowledged_at', 'acknowledgedAt') || undefined,
    receiver_name: pickString(nested, 'receiver_name', 'receiverName', 'received_by') || undefined,
    receiver_title: pickString(nested, 'receiver_title', 'receiverTitle') || undefined,
    goods_condition:
      pickString(nested, 'goods_condition', 'goodsCondition', 'condition') || undefined,
    remarks: pickString(nested, 'remarks', 'notes', 'comments') || undefined,
    signature_s3_key:
      pickString(nested, 'signature_s3_key', 'signatureS3Key', 'signature_image_path') ||
      undefined,
    signature_url:
      pickString(nested, 'signature_url', 'signatureUrl', 'signature_file_url') || undefined,
    template_snapshot:
      (nested.template_snapshot as string | Record<string, unknown> | undefined) ??
      (nested.templateSnapshot as string | Record<string, unknown> | undefined),
    submitted_by_party_id:
      pickString(nested, 'submitted_by_party_id', 'submittedByPartyId') || undefined,
    received_by_user_id:
      pickString(nested, 'received_by_user_id', 'receivedByUserId') || undefined,
    received_at: pickString(nested, 'received_at', 'receivedAt') || undefined,
    actual_delivery_date:
      pickString(nested, 'actual_delivery_date', 'actualDeliveryDate') || undefined,
    path_hints,
    raw: nested,
  };
}

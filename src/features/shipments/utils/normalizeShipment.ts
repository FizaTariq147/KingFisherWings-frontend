import { isUuid } from '@/lib/isUuid';
import type { Shipment, ShipmentActions, ShipmentDetailTab } from '../types/shipment.types';

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

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value.map((v) => str(v)).filter((v): v is string => Boolean(v));
  return list.length ? list : undefined;
}

function normalizeTabs(raw: unknown): ShipmentDetailTab[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const tabs: ShipmentDetailTab[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      tabs.push({ key: item.trim(), label: item.trim() });
      continue;
    }
    const r = asRecord(item);
    if (!r) continue;
    const key = str(r.key) ?? str(r.id) ?? str(r.tab) ?? str(r.name);
    if (!key) continue;
    tabs.push({
      key,
      label: str(r.label) ?? str(r.title) ?? key,
    });
  }
  return tabs.length ? tabs : undefined;
}

function normalizeActions(raw: unknown): ShipmentActions | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  const flag = (...keys: string[]): boolean | undefined => {
    for (const key of keys) {
      const v = bool(r[key]);
      if (v !== undefined) return v;
    }
    return undefined;
  };
  return {
    can_generate_job: flag('can_generate_job', 'canGenerateJob', 'generate_job'),
    can_change_status: flag('can_change_status', 'canChangeStatus', 'change_status'),
    can_change_bl_status: flag(
      'can_change_bl_status',
      'canChangeBlStatus',
      'change_bl_status',
    ),
    can_change_department: flag(
      'can_change_department',
      'canChangeDepartment',
      'change_department',
    ),
    can_copy: flag('can_copy', 'canCopy', 'copy'),
    can_split: flag('can_split', 'canSplit', 'split'),
    can_merge: flag('can_merge', 'canMerge', 'merge'),
    can_switch_bl: flag('can_switch_bl', 'canSwitchBl', 'switch_bl'),
    can_create_submaster: flag(
      'can_create_submaster',
      'canCreateSubmaster',
      'create_submaster',
    ),
    can_edi: flag('can_edi', 'canEdi', 'edi'),
    can_kpi: flag('can_kpi', 'canKpi', 'kpi'),
    can_tracking: flag('can_tracking', 'canTracking', 'tracking'),
    can_bl_entry: flag('can_bl_entry', 'canBlEntry', 'bl_entry', 'bills_of_lading'),
    can_awb: flag('can_awb', 'canAwb', 'awb'),
    allowed_statuses: stringList(r.allowed_statuses ?? r.allowedStatuses ?? r.statuses),
    allowed_bl_statuses: stringList(
      r.allowed_bl_statuses ?? r.allowedBlStatuses ?? r.bl_statuses,
    ),
    raw: r,
  };
}

function pickNestedId(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    const id = str(c);
    if (id && isUuid(id)) return id;
    const rec = asRecord(c);
    if (rec) {
      const nested = str(rec.id);
      if (nested && isUuid(nested)) return nested;
    }
  }
  return undefined;
}

export function normalizeShipment(raw: unknown): Shipment | null {
  const root = asRecord(raw);
  if (!root) return null;

  // Fresa detail envelope may nest shipment under data / header / shipment.
  const header = asRecord(root.header) ?? asRecord(asRecord(root.data)?.header);
  const nestedShipment =
    asRecord(root.shipment) ??
    asRecord(asRecord(root.data)?.shipment) ??
    asRecord(root.data);
  const r = {
    ...root,
    ...(nestedShipment && nestedShipment !== root ? nestedShipment : {}),
    ...(header ?? {}),
  };

  const id = str(r.id) ?? str(root.id);
  if (!id || !isUuid(id)) return null;

  const party = asRecord(r.party) ?? asRecord(r.customer);
  const quotation = asRecord(r.quotation);
  const enquiry = asRecord(r.enquiry);
  const job = asRecord(r.job);
  const department = asRecord(r.department);
  const branch = asRecord(r.branch);

  const actions =
    normalizeActions(r.actions ?? r.action_flags ?? r.actionFlags) ??
    normalizeActions(root.actions ?? asRecord(root.data)?.actions);

  const tabs =
    normalizeTabs(root.tabs) ??
    normalizeTabs(asRecord(root.data)?.tabs) ??
    normalizeTabs(r.tabs);

  return {
    ...r,
    id,
    shipment_number:
      str(r.shipment_number) ??
      str(r.shipmentNumber) ??
      str(r.shipment_no) ??
      str(r.reference),
    reference: str(r.reference),
    status: str(r.status),
    bl_status: str(r.bl_status) ?? str(r.blStatus),
    job_type: str(r.job_type) ?? str(r.jobType) ?? str(r.service_type) ?? str(r.serviceType),
    service_type: str(r.service_type) ?? str(r.serviceType) ?? str(r.job_type),
    party_id:
      pickNestedId(r.party_id, r.partyId, r.customer_id, r.customerId, party) ??
      undefined,
    party_name:
      str(r.party_name) ??
      str(r.partyName) ??
      str(r.customer_name) ??
      str(r.customerName) ??
      (party ? str(party.name) ?? str(party.company_name) : undefined),
    customer_id: str(r.customer_id) ?? str(r.customerId),
    customer_name: str(r.customer_name) ?? str(r.customerName),
    quotation_id: pickNestedId(r.quotation_id, r.quotationId, quotation),
    quotation_number:
      str(r.quotation_number) ??
      str(r.quotationNumber) ??
      (quotation ? str(quotation.quotation_number) ?? str(quotation.quote_no) : undefined),
    enquiry_id: pickNestedId(r.enquiry_id, r.enquiryId, enquiry),
    enquiry_number:
      str(r.enquiry_number) ??
      str(r.enquiryNumber) ??
      (enquiry ? str(enquiry.enquiry_number) : undefined),
    job_id: pickNestedId(r.job_id, r.jobId, job),
    job_number:
      str(r.job_number) ??
      str(r.jobNumber) ??
      (job ? str(job.job_number) ?? str(job.job_no) : undefined),
    department_id: pickNestedId(r.department_id, r.departmentId, department),
    department_name:
      str(r.department_name) ??
      str(r.departmentName) ??
      (department ? str(department.name) : undefined),
    branch_id: pickNestedId(r.branch_id, r.branchId, branch),
    branch_name:
      str(r.branch_name) ?? str(r.branchName) ?? (branch ? str(branch.name) : undefined),
    origin_port_id: str(r.origin_port_id) ?? str(r.originPortId),
    dest_port_id: str(r.dest_port_id) ?? str(r.destPortId),
    origin_port_name: str(r.origin_port_name) ?? str(r.originPortName),
    dest_port_name: str(r.dest_port_name) ?? str(r.destPortName),
    por: str(r.por) ?? str(r.place_of_receipt) ?? str(r.placeOfReceipt),
    pol: str(r.pol) ?? str(r.port_of_loading) ?? str(r.portOfLoading),
    pod: str(r.pod) ?? str(r.port_of_discharge) ?? str(r.portOfDischarge),
    pof: str(r.pof) ?? str(r.port_of_final) ?? str(r.portOfFinal),
    place_of_receipt: str(r.place_of_receipt) ?? str(r.placeOfReceipt),
    place_of_delivery: str(r.place_of_delivery) ?? str(r.placeOfDelivery),
    cargo_details: str(r.cargo_details) ?? str(r.cargoDetails),
    commodity: str(r.commodity),
    container_count: num(r.container_count ?? r.containerCount),
    container_type_id: str(r.container_type_id) ?? str(r.containerTypeId),
    incoterms: str(r.incoterms) ?? str(r.incoterm),
    freight_payment_type: str(r.freight_payment_type) ?? str(r.freightPaymentType),
    currency_code: str(r.currency_code) ?? str(r.currencyCode),
    mbl_number: str(r.mbl_number) ?? str(r.mblNumber) ?? str(r.mbl),
    hbl_number: str(r.hbl_number) ?? str(r.hblNumber) ?? str(r.hbl),
    etd: str(r.etd) ?? str(r.etd_date) ?? str(r.etdDate),
    eta: str(r.eta) ?? str(r.eta_date) ?? str(r.etaDate),
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? str(r.vessel),
    voyage_number: str(r.voyage_number) ?? str(r.voyageNumber) ?? str(r.voyage),
    carrier_name: str(r.carrier_name) ?? str(r.carrierName),
    created_at: str(r.created_at) ?? str(r.createdAt),
    updated_at: str(r.updated_at) ?? str(r.updatedAt),
    actions,
    tabs,
    header: header ?? undefined,
    links: asRecord(root.links) ?? asRecord(asRecord(root.data)?.links) ?? undefined,
    sections:
      asRecord(root.sections) ?? asRecord(asRecord(root.data)?.sections) ?? undefined,
  };
}

export function normalizeShipments(raw: unknown): Shipment[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeShipment).filter((s): s is Shipment => Boolean(s));
}

export function shipmentDisplayNumber(
  s: Pick<Shipment, 'shipment_number' | 'reference' | 'id'>,
): string {
  return s.shipment_number || s.reference || s.id.slice(0, 8);
}

/** Unwrap GET detail / action JSON envelopes to a plain object. */
export function unwrapShipmentPayload(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

import type {
  ArrivalReportStatusRowDto,
  CustomsStatusRowDto,
  JobTrackingContainerEventDto,
  JobTrackingLegDto,
  JobTrackingPortOfCallDto,
  JobTrackingProfile,
  ManifestStatusRowDto,
  QtyGwVolDto,
  UpsertJobTrackingProfileDto,
} from '../types/job.types';
import type { Job } from '../types/job.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function strOrNull(value: unknown): string | null | undefined {
  if (value === null) return null;
  return str(value);
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

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of [
    'items',
    'rows',
    'data',
    'manifest_status',
    'manifestStatus',
    'arrival_report_status',
    'arrivalReportStatus',
  ]) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

export function emptyJobTrackingProfile(): JobTrackingProfile {
  return {
    bl_number: '',
    origin_port: '',
    origin_label: '',
    dest_port: '',
    dest_label: '',
    at_before: '',
    terminal_cutoff_at: '',
    legs: [
      { leg_no: 1, vessel_name: '', voyage_number: '', imo: '', pol: '', pod: '' },
      { leg_no: 2, vessel_name: '', voyage_number: '', imo: '', pol: '', pod: '' },
    ],
    port_of_call: [
      { role: 'ORIGIN', port_name: '', eta: '', ata: '', etd: '', atd: '', vessel_name: '', voyage_number: '' },
      { role: 'DEST', port_name: '', eta: '', ata: '', etd: '', atd: '', vessel_name: '', voyage_number: '' },
    ],
    container_events: [],
    arrival_report: [],
    customs_status: [],
    detailed_data: {},
    pre_manifest: [],
    qty_gw_vol: {
      quantity: null,
      gross_weight: null,
      net_weight: null,
      volume: null,
      chargeable_weight: null,
      qty_unit: 'PKG',
      weight_unit: 'KG',
      volume_unit: 'CBM',
      lines: [],
    },
  };
}

function normalizeLeg(raw: unknown, index: number): JobTrackingLegDto {
  const r = asRecord(raw) ?? {};
  return {
    leg_no: num(r.leg_no) ?? num(r.legNo) ?? index + 1,
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? str(r.vessel) ?? '',
    voyage_number: str(r.voyage_number) ?? str(r.voyageNumber) ?? str(r.voyage) ?? '',
    imo: str(r.imo) ?? '',
    label: str(r.label) ?? '',
    pol: str(r.pol) ?? str(r.origin) ?? str(r.from) ?? '',
    pod: str(r.pod) ?? str(r.destination) ?? str(r.to) ?? '',
  };
}

function normalizePortOfCall(raw: unknown): JobTrackingPortOfCallDto {
  const r = asRecord(raw) ?? {};
  return {
    role: str(r.role) ?? str(r.code) ?? '',
    port_name: str(r.port_name) ?? str(r.portName) ?? str(r.name) ?? '',
    un_locode: str(r.un_locode) ?? str(r.unLocode) ?? str(r.code) ?? '',
    eta: strOrNull(r.eta) ?? '',
    ata: strOrNull(r.ata) ?? '',
    etd: strOrNull(r.etd) ?? '',
    atd: strOrNull(r.atd) ?? '',
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? '',
    voyage_number: str(r.voyage_number) ?? str(r.voyageNumber) ?? '',
    note: str(r.note) ?? '',
  };
}

function normalizeContainerEvent(raw: unknown): JobTrackingContainerEventDto {
  const r = asRecord(raw) ?? {};
  return {
    event_code: str(r.event_code) ?? str(r.eventCode) ?? '',
    label: str(r.label) ?? '',
    occurred_at: strOrNull(r.occurred_at) ?? strOrNull(r.occurredAt) ?? '',
    place: str(r.place) ?? '',
    container_no: str(r.container_no) ?? str(r.containerNo) ?? '',
  };
}

function normalizeArrivalReport(raw: unknown): ArrivalReportStatusRowDto {
  const r = asRecord(raw) ?? {};
  return {
    status: str(r.status) ?? '',
    sending_time: strOrNull(r.sending_time) ?? strOrNull(r.sendingTime) ?? '',
    receipt_time: strOrNull(r.receipt_time) ?? strOrNull(r.receiptTime) ?? '',
    container_no: str(r.container_no) ?? str(r.containerNo) ?? '',
    sub_container_no: str(r.sub_container_no) ?? str(r.subContainerNo) ?? '',
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? '',
    voyage_no: str(r.voyage_no) ?? str(r.voyageNo) ?? str(r.voyage_number) ?? '',
    imo: str(r.imo) ?? '',
  };
}

function normalizeCustomsStatus(raw: unknown): CustomsStatusRowDto {
  const r = asRecord(raw) ?? {};
  return {
    carrier_operator: str(r.carrier_operator) ?? str(r.carrierOperator) ?? '',
    customs_released: bool(r.customs_released) ?? bool(r.customsReleased) ?? false,
    sub_customs_no: str(r.sub_customs_no) ?? str(r.subCustomsNo) ?? '',
    quantity: num(r.quantity),
    weight: num(r.weight),
    volume: num(r.volume),
    customs_declaration_no:
      str(r.customs_declaration_no) ?? str(r.customsDeclarationNo) ?? '',
    customs_inspection_status:
      str(r.customs_inspection_status) ?? str(r.customsInspectionStatus) ?? '',
    customs_inspection_time:
      strOrNull(r.customs_inspection_time) ??
      strOrNull(r.customsInspectionTime) ??
      '',
  };
}

function normalizeManifestStatus(raw: unknown): ManifestStatusRowDto {
  const r = asRecord(raw) ?? {};
  return {
    sub_customs_no: str(r.sub_customs_no) ?? str(r.subCustomsNo) ?? '',
    status: str(r.status) ?? '',
    sending_time: strOrNull(r.sending_time) ?? strOrNull(r.sendingTime) ?? '',
    receipt_receiving_time:
      strOrNull(r.receipt_receiving_time) ??
      strOrNull(r.receiptReceivingTime) ??
      strOrNull(r.receipt_time) ??
      '',
    container_no: str(r.container_no) ?? str(r.containerNo) ?? '',
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? '',
    voyage_no: str(r.voyage_no) ?? str(r.voyageNo) ?? '',
    imo: str(r.imo) ?? '',
  };
}

function normalizeQtyGwVol(raw: unknown): QtyGwVolDto {
  const r = asRecord(raw) ?? {};
  const linesRaw = Array.isArray(r.lines) ? r.lines : [];
  return {
    quantity: num(r.quantity) ?? num(r.qty) ?? null,
    gross_weight: num(r.gross_weight) ?? num(r.grossWeight) ?? num(r.gw) ?? null,
    net_weight: num(r.net_weight) ?? num(r.netWeight) ?? null,
    volume: num(r.volume) ?? num(r.vol) ?? num(r.cbm) ?? null,
    chargeable_weight:
      num(r.chargeable_weight) ?? num(r.chargeableWeight) ?? null,
    qty_unit: str(r.qty_unit) ?? str(r.qtyUnit) ?? 'PKG',
    weight_unit: str(r.weight_unit) ?? str(r.weightUnit) ?? 'KG',
    volume_unit: str(r.volume_unit) ?? str(r.volumeUnit) ?? 'CBM',
    lines: linesRaw
      .map((line) => asRecord(line))
      .filter((line): line is Record<string, unknown> => Boolean(line)),
  };
}

function ensureTwoLegs(legs: JobTrackingLegDto[]): JobTrackingLegDto[] {
  const byNo = new Map<number, JobTrackingLegDto>();
  for (const leg of legs) {
    const n = leg.leg_no ?? 0;
    if (n === 1 || n === 2) byNo.set(n, { ...leg, leg_no: n });
  }
  return [
    byNo.get(1) ?? { leg_no: 1, vessel_name: '', voyage_number: '', imo: '', pol: '', pod: '' },
    byNo.get(2) ?? { leg_no: 2, vessel_name: '', voyage_number: '', imo: '', pol: '', pod: '' },
  ];
}

function ensureOriginDestPoc(
  rows: JobTrackingPortOfCallDto[],
): JobTrackingPortOfCallDto[] {
  if (rows.length) return rows;
  return [
    { role: 'ORIGIN', port_name: '', eta: '', ata: '', etd: '', atd: '', vessel_name: '', voyage_number: '' },
    { role: 'DEST', port_name: '', eta: '', ata: '', etd: '', atd: '', vessel_name: '', voyage_number: '' },
  ];
}

/** Normalize GET /jobs/:id/tracking/profile (or PUT response) into a stable FE shape. */
export function normalizeJobTrackingProfile(raw: unknown): JobTrackingProfile {
  const seed = emptyJobTrackingProfile();
  const r = asRecord(raw);
  if (!r) return seed;

  const origin =
    str(r.origin_port) ?? str(r.originPort) ?? str(r.origin_label) ?? str(r.originLabel) ?? '';
  const dest =
    str(r.dest_port) ?? str(r.destPort) ?? str(r.dest_label) ?? str(r.destLabel) ?? '';

  const legsRaw = asArray(r.legs);
  const firstLeg = asRecord(r.first_leg) ?? asRecord(r.firstLeg);
  const secondLeg = asRecord(r.second_leg) ?? asRecord(r.secondLeg);
  const legsFromNamed: JobTrackingLegDto[] = [];
  if (firstLeg) legsFromNamed.push(normalizeLeg({ ...firstLeg, leg_no: 1 }, 0));
  if (secondLeg) legsFromNamed.push(normalizeLeg({ ...secondLeg, leg_no: 2 }, 1));
  const legs = ensureTwoLegs([
    ...legsFromNamed,
    ...legsRaw.map((row, i) => normalizeLeg(row, i)),
  ]);

  const preManifestRaw =
    asArray(r.pre_manifest) ||
    asArray(r.preManifest) ||
    asArray(asRecord(r.pre_manifest)?.manifest_status) ||
    asArray(asRecord(r.preManifest)?.manifest_status) ||
    asArray(asRecord(r.pre_manifest)?.manifestStatus);

  const arrivalRaw =
    asArray(r.arrival_report) ||
    asArray(r.arrivalReport) ||
    asArray(r.arrival_report_status) ||
    asArray(r.arrivalReportStatus);

  const detailed =
    asRecord(r.detailed_data) ?? asRecord(r.detailedData) ?? {};

  return {
    id: str(r.id),
    job_id: str(r.job_id) ?? str(r.jobId),
    bl_number: str(r.bl_number) ?? str(r.blNumber) ?? '',
    origin_port: origin,
    origin_label: origin,
    dest_port: dest,
    dest_label: dest,
    at_before: str(r.at_before) ?? str(r.atBefore) ?? '',
    terminal_cutoff_at:
      str(r.terminal_cutoff_at) ?? str(r.terminalCutoffAt) ?? '',
    legs,
    port_of_call: ensureOriginDestPoc(
      asArray(r.port_of_call ?? r.portOfCall).map(normalizePortOfCall),
    ),
    container_events: asArray(r.container_events ?? r.containerEvents).map(
      normalizeContainerEvent,
    ),
    arrival_report: arrivalRaw.map(normalizeArrivalReport),
    customs_status: asArray(r.customs_status ?? r.customsStatus).map(
      normalizeCustomsStatus,
    ),
    detailed_data: detailed,
    pre_manifest: preManifestRaw.map(normalizeManifestStatus),
    qty_gw_vol: normalizeQtyGwVol(r.qty_gw_vol ?? r.qtyGwVol),
  };
}

function cleanStr(value?: string | null): string | undefined {
  const s = String(value ?? '').trim();
  return s || undefined;
}

function cleanNum(value?: number | null): number | undefined {
  if (value == null || value === ('' as unknown)) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Build PUT body — omit empty fluff, keep arrays. */
export function toUpsertJobTrackingProfileDto(
  profile: JobTrackingProfile | UpsertJobTrackingProfileDto,
): UpsertJobTrackingProfileDto {
  const origin = cleanStr(profile.origin_port) ?? cleanStr(profile.origin_label);
  const dest = cleanStr(profile.dest_port) ?? cleanStr(profile.dest_label);
  const qty = profile.qty_gw_vol ?? {};

  return {
    bl_number: cleanStr(profile.bl_number) ?? null,
    origin_port: origin ?? null,
    origin_label: origin ?? null,
    dest_port: dest ?? null,
    dest_label: dest ?? null,
    at_before: cleanStr(profile.at_before) ?? null,
    terminal_cutoff_at: cleanStr(profile.terminal_cutoff_at) ?? null,
    legs: (profile.legs ?? []).map((leg, i) => ({
      leg_no: leg.leg_no ?? i + 1,
      vessel_name: cleanStr(leg.vessel_name),
      voyage_number: cleanStr(leg.voyage_number),
      imo: cleanStr(leg.imo),
      label: cleanStr(leg.label),
      pol: cleanStr(leg.pol),
      pod: cleanStr(leg.pod),
    })),
    port_of_call: (profile.port_of_call ?? []).map((row) => ({
      role: cleanStr(row.role),
      port_name: cleanStr(row.port_name),
      un_locode: cleanStr(row.un_locode),
      eta: cleanStr(row.eta) ?? null,
      ata: cleanStr(row.ata) ?? null,
      etd: cleanStr(row.etd) ?? null,
      atd: cleanStr(row.atd) ?? null,
      vessel_name: cleanStr(row.vessel_name),
      voyage_number: cleanStr(row.voyage_number),
      note: cleanStr(row.note),
    })),
    container_events: (profile.container_events ?? []).map((row) => ({
      event_code: cleanStr(row.event_code),
      label: cleanStr(row.label),
      occurred_at: cleanStr(row.occurred_at) ?? null,
      place: cleanStr(row.place),
      container_no: cleanStr(row.container_no),
    })),
    arrival_report: (profile.arrival_report ?? []).map((row) => ({
      status: cleanStr(row.status),
      sending_time: cleanStr(row.sending_time) ?? null,
      receipt_time: cleanStr(row.receipt_time) ?? null,
      container_no: cleanStr(row.container_no),
      sub_container_no: cleanStr(row.sub_container_no),
      vessel_name: cleanStr(row.vessel_name),
      voyage_no: cleanStr(row.voyage_no),
      imo: cleanStr(row.imo),
    })),
    customs_status: (profile.customs_status ?? []).map((row) => ({
      carrier_operator: cleanStr(row.carrier_operator),
      customs_released: Boolean(row.customs_released),
      sub_customs_no: cleanStr(row.sub_customs_no),
      quantity: cleanNum(row.quantity),
      weight: cleanNum(row.weight),
      volume: cleanNum(row.volume),
      customs_declaration_no: cleanStr(row.customs_declaration_no),
      customs_inspection_status: cleanStr(row.customs_inspection_status),
      customs_inspection_time: cleanStr(row.customs_inspection_time) ?? null,
    })),
    detailed_data:
      profile.detailed_data && typeof profile.detailed_data === 'object'
        ? profile.detailed_data
        : {},
    pre_manifest: (profile.pre_manifest ?? []).map((row) => ({
      sub_customs_no: cleanStr(row.sub_customs_no),
      status: cleanStr(row.status),
      sending_time: cleanStr(row.sending_time) ?? null,
      receipt_receiving_time: cleanStr(row.receipt_receiving_time) ?? null,
      container_no: cleanStr(row.container_no),
      vessel_name: cleanStr(row.vessel_name),
      voyage_no: cleanStr(row.voyage_no),
      imo: cleanStr(row.imo),
    })),
    qty_gw_vol: {
      quantity: cleanNum(qty.quantity) ?? null,
      gross_weight: cleanNum(qty.gross_weight) ?? null,
      net_weight: cleanNum(qty.net_weight) ?? null,
      volume: cleanNum(qty.volume) ?? null,
      chargeable_weight: cleanNum(qty.chargeable_weight) ?? null,
      qty_unit: cleanStr(qty.qty_unit) ?? 'PKG',
      weight_unit: cleanStr(qty.weight_unit) ?? 'KG',
      volume_unit: cleanStr(qty.volume_unit) ?? 'CBM',
      lines: Array.isArray(qty.lines) ? qty.lines : [],
    },
  };
}

/** Client-side seed from job when profile fields are still empty (backend may also seed). */
export function seedTrackingProfileFromJob(
  profile: JobTrackingProfile,
  job: Job | null | undefined,
): JobTrackingProfile {
  if (!job) return profile;
  const j = job as Job & {
    origin_port_name?: string;
    dest_port_name?: string;
    hbl_number?: string;
    mbl_number?: string;
    hawb_number?: string;
    pol?: string;
    pod?: string;
  };
  const air = j.air_details;
  const sea = j.sea_fcl_details ?? j.sea_lcl_details;
  const bl =
    cleanStr(profile.bl_number) ||
    cleanStr(j.bl_number) ||
    cleanStr(j.mbl_number) ||
    cleanStr(sea?.mbl_number) ||
    cleanStr(j.hbl_number) ||
    cleanStr(sea?.hbl_number) ||
    cleanStr(j.hawb_number) ||
    cleanStr(air?.hawb_number) ||
    '';
  const origin =
    cleanStr(profile.origin_port) ||
    cleanStr(j.origin_port_name) ||
    cleanStr(j.origin_port_code) ||
    cleanStr(j.pol) ||
    '';
  const dest =
    cleanStr(profile.dest_port) ||
    cleanStr(j.dest_port_name) ||
    cleanStr(j.dest_port_code) ||
    cleanStr(j.pod) ||
    '';

  const legs = ensureTwoLegs(profile.legs ?? []);
  if (!cleanStr(legs[0].vessel_name) && cleanStr(j.vessel_name)) {
    legs[0] = {
      ...legs[0],
      vessel_name: j.vessel_name,
      voyage_number: cleanStr(legs[0].voyage_number) || cleanStr(j.voyage_number) || '',
      pol: cleanStr(legs[0].pol) || origin,
      pod: cleanStr(legs[0].pod) || dest,
    };
  }

  const poc = ensureOriginDestPoc(profile.port_of_call ?? []).map((row) => {
    if (row.role === 'ORIGIN' && !cleanStr(row.port_name)) {
      return { ...row, port_name: origin, etd: cleanStr(row.etd) || cleanStr(j.etd) || '' };
    }
    if (row.role === 'DEST' && !cleanStr(row.port_name)) {
      return { ...row, port_name: dest, eta: cleanStr(row.eta) || cleanStr(j.eta) || '' };
    }
    return row;
  });

  const qty = { ...(profile.qty_gw_vol ?? {}) };
  if (qty.quantity == null && j.pieces != null) qty.quantity = j.pieces;
  if (qty.gross_weight == null && j.gross_weight != null) qty.gross_weight = j.gross_weight;
  if (qty.volume == null && j.volume_cbm != null) qty.volume = j.volume_cbm;
  if (qty.chargeable_weight == null && j.chargeable_weight != null) {
    qty.chargeable_weight = j.chargeable_weight;
  }

  const detailed = { ...(profile.detailed_data ?? {}) };
  const snapshot: Record<string, unknown> = {
    job_number: j.job_number,
    job_type: j.job_type,
    status: j.status,
    commodity: j.commodity ?? j.commodity_description,
    pieces: j.pieces,
    gross_weight: j.gross_weight,
    chargeable_weight: j.chargeable_weight,
    volume_cbm: j.volume_cbm,
    origin_port: origin,
    dest_port: dest,
    bl_number: bl,
    hbl_number: j.hbl_number ?? sea?.hbl_number,
    mbl_number: j.mbl_number ?? sea?.mbl_number,
    hawb_number: j.hawb_number ?? air?.hawb_number,
    vessel_name: j.vessel_name,
    voyage_number: j.voyage_number,
    primary_container_number: j.primary_container_number,
    shipper_name: j.shipper_name,
    consignee_name: j.consignee_name,
    etd: j.etd,
    eta: j.eta,
  };
  for (const [k, v] of Object.entries(snapshot)) {
    if (v == null || v === '') continue;
    if (detailed[k] == null || detailed[k] === '') detailed[k] = v;
  }

  return {
    ...profile,
    bl_number: bl,
    origin_port: origin,
    origin_label: origin,
    dest_port: dest,
    dest_label: dest,
    legs,
    port_of_call: poc,
    qty_gw_vol: qty,
    detailed_data: detailed,
  };
}

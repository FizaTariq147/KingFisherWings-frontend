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
    airline_name: '',
    flight_number: '',
    arrival_flight_number: '',
    mawb_number: '',
    hawb_number: '',
    flight_date: '',
    flight_status: '',
    legs: [
      {
        leg_no: 1,
        vessel_name: '',
        voyage_number: '',
        imo: '',
        pol: '',
        pod: '',
        airline_name: '',
        flight_number: '',
        arrival_flight_number: '',
        mawb_number: '',
        hawb_number: '',
        flight_date: '',
        flight_status: '',
        etd: '',
        eta: '',
      },
      {
        leg_no: 2,
        vessel_name: '',
        voyage_number: '',
        imo: '',
        pol: '',
        pod: '',
        airline_name: '',
        flight_number: '',
        arrival_flight_number: '',
        mawb_number: '',
        hawb_number: '',
        flight_date: '',
        flight_status: '',
        etd: '',
        eta: '',
      },
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
  const voyageNumber =
    str(r.voyage_number) ?? str(r.voyageNumber) ?? str(r.voyage) ?? '';
  const explicitFlight =
    str(r.flight_number) ??
    str(r.flightNumber) ??
    str(r.flight_no) ??
    str(r.flightNo) ??
    '';
  const airlineName =
    str(r.airline_name) ?? str(r.airlineName) ?? str(r.airline) ?? '';
  const label = str(r.label) ?? '';
  // Recover flight from voyage_number only when this leg already looks like air (airline / Flight label).
  const flightNumber =
    explicitFlight ||
    (airlineName || /^flight\b/i.test(label) ? voyageNumber : '') ||
    '';
  return {
    leg_no: num(r.leg_no) ?? num(r.legNo) ?? index + 1,
    vessel_name: str(r.vessel_name) ?? str(r.vesselName) ?? str(r.vessel) ?? '',
    voyage_number: voyageNumber,
    imo: str(r.imo) ?? '',
    label,
    pol:
      str(r.pol) ??
      str(r.origin) ??
      str(r.from) ??
      str(r.origin_airport) ??
      str(r.originAirport) ??
      '',
    pod:
      str(r.pod) ??
      str(r.destination) ??
      str(r.to) ??
      str(r.dest_airport) ??
      str(r.destAirport) ??
      '',
    airline_name: airlineName,
    flight_number: flightNumber,
    arrival_flight_number:
      str(r.arrival_flight_number) ??
      str(r.arrivalFlightNumber) ??
      str(r.arrival_flight) ??
      '',
    mawb_number: str(r.mawb_number) ?? str(r.mawbNumber) ?? str(r.mawb_no) ?? '',
    hawb_number: str(r.hawb_number) ?? str(r.hawbNumber) ?? str(r.hawb_no) ?? '',
    flight_date: str(r.flight_date) ?? str(r.flightDate) ?? '',
    flight_status: str(r.flight_status) ?? str(r.flightStatus) ?? '',
    etd: str(r.etd) ?? str(r.etd_at) ?? '',
    eta: str(r.eta) ?? str(r.eta_at) ?? '',
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

function emptyLeg(legNo: 1 | 2): JobTrackingLegDto {
  return {
    leg_no: legNo,
    vessel_name: '',
    voyage_number: '',
    imo: '',
    pol: '',
    pod: '',
    airline_name: '',
    flight_number: '',
    arrival_flight_number: '',
    mawb_number: '',
    hawb_number: '',
    flight_date: '',
    flight_status: '',
    etd: '',
    eta: '',
  };
}

function ensureTwoLegs(legs: JobTrackingLegDto[]): JobTrackingLegDto[] {
  const byNo = new Map<number, JobTrackingLegDto>();
  for (const leg of legs) {
    const n = leg.leg_no ?? 0;
    if (n === 1 || n === 2) byNo.set(n, { ...leg, leg_no: n });
  }
  return [byNo.get(1) ?? emptyLeg(1), byNo.get(2) ?? emptyLeg(2)];
}

const FLIGHT_DETAILED_KEYS = [
  'airline_name',
  'flight_number',
  'arrival_flight_number',
  'mawb_number',
  'hawb_number',
  'flight_date',
  'flight_status',
] as const;

function pickFlightFromDetailed(
  detailed: Record<string, unknown>,
): Partial<JobTrackingProfile> {
  const out: Partial<JobTrackingProfile> = {};
  for (const key of FLIGHT_DETAILED_KEYS) {
    const value = str(detailed[key]);
    if (value) (out as Record<string, string>)[key] = value;
  }
  // Only treat voyage/vessel as flight/airline when detailed_data already has air keys.
  const looksAir = Boolean(
    out.flight_number ||
      out.arrival_flight_number ||
      out.mawb_number ||
      out.hawb_number ||
      out.airline_name ||
      out.flight_date ||
      out.flight_status,
  );
  if (looksAir && !out.flight_number) {
    const mirrored =
      str(detailed.voyage_number) ?? str(detailed.voyageNumber) ?? str(detailed.voyage);
    if (mirrored) out.flight_number = mirrored;
  }
  if (looksAir && !out.airline_name) {
    const airline = str(detailed.vessel_name) ?? str(detailed.vesselName);
    if (airline) out.airline_name = airline;
  }
  return out;
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
  const fromDetailed = pickFlightFromDetailed(detailed);
  const first = legs[0] ?? emptyLeg(1);

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
    airline_name:
      str(r.airline_name) ??
      str(r.airlineName) ??
      fromDetailed.airline_name ??
      first.airline_name ??
      '',
    flight_number:
      str(r.flight_number) ??
      str(r.flightNumber) ??
      fromDetailed.flight_number ??
      first.flight_number ??
      (fromDetailed.airline_name ||
      fromDetailed.mawb_number ||
      fromDetailed.hawb_number ||
      first.airline_name ||
      first.mawb_number ||
      first.hawb_number
        ? first.voyage_number
        : '') ??
      '',
    arrival_flight_number:
      str(r.arrival_flight_number) ??
      str(r.arrivalFlightNumber) ??
      fromDetailed.arrival_flight_number ??
      first.arrival_flight_number ??
      '',
    mawb_number:
      str(r.mawb_number) ??
      str(r.mawbNumber) ??
      fromDetailed.mawb_number ??
      first.mawb_number ??
      '',
    hawb_number:
      str(r.hawb_number) ??
      str(r.hawbNumber) ??
      fromDetailed.hawb_number ??
      first.hawb_number ??
      '',
    flight_date:
      str(r.flight_date) ??
      str(r.flightDate) ??
      fromDetailed.flight_date ??
      first.flight_date ??
      '',
    flight_status:
      str(r.flight_status) ??
      str(r.flightStatus) ??
      fromDetailed.flight_status ??
      first.flight_status ??
      '',
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

  const firstLeg = (profile.legs ?? []).find((l) => l.leg_no === 1) ?? (profile.legs ?? [])[0];
  const airlineName =
    cleanStr(profile.airline_name) ?? cleanStr(firstLeg?.airline_name);
  const flightNumber =
    cleanStr(profile.flight_number) ?? cleanStr(firstLeg?.flight_number);
  const arrivalFlight =
    cleanStr(profile.arrival_flight_number) ??
    cleanStr(firstLeg?.arrival_flight_number);
  const mawb = cleanStr(profile.mawb_number) ?? cleanStr(firstLeg?.mawb_number);
  const hawb = cleanStr(profile.hawb_number) ?? cleanStr(firstLeg?.hawb_number);
  const flightDate =
    cleanStr(profile.flight_date) ?? cleanStr(firstLeg?.flight_date);
  const flightStatus =
    cleanStr(profile.flight_status) ?? cleanStr(firstLeg?.flight_status);

  const detailed: Record<string, unknown> = {
    ...(profile.detailed_data && typeof profile.detailed_data === 'object'
      ? profile.detailed_data
      : {}),
  };
  // Mirror flight into detailed_data so tracking can read it even if leg extras are stripped.
  if (airlineName) detailed.airline_name = airlineName;
  if (flightNumber) detailed.flight_number = flightNumber;
  if (arrivalFlight) detailed.arrival_flight_number = arrivalFlight;
  if (mawb) detailed.mawb_number = mawb;
  if (hawb) detailed.hawb_number = hawb;
  if (flightDate) detailed.flight_date = flightDate;
  if (flightStatus) detailed.flight_status = flightStatus;

  return {
    bl_number: cleanStr(profile.bl_number) ?? null,
    origin_port: origin ?? null,
    origin_label: origin ?? null,
    dest_port: dest ?? null,
    dest_label: dest ?? null,
    at_before: cleanStr(profile.at_before) ?? null,
    terminal_cutoff_at: cleanStr(profile.terminal_cutoff_at) ?? null,
    airline_name: airlineName ?? null,
    flight_number: flightNumber ?? null,
    arrival_flight_number: arrivalFlight ?? null,
    mawb_number: mawb ?? null,
    hawb_number: hawb ?? null,
    flight_date: flightDate ?? null,
    flight_status: flightStatus ?? null,
    legs: (profile.legs ?? []).map((leg, i) => {
      const legFlight =
        cleanStr(leg.flight_number) || (i === 0 ? flightNumber : undefined);
      const legAirline =
        cleanStr(leg.airline_name) || (i === 0 ? airlineName : undefined);
      return {
        leg_no: leg.leg_no ?? i + 1,
        // Documented sea fields — for air, also mirror flight into voyage_number so
        // OpenAPI-strict BE still stores a usable flight identifier.
        vessel_name: cleanStr(leg.vessel_name) || legAirline,
        voyage_number: cleanStr(leg.voyage_number) || legFlight,
        imo: cleanStr(leg.imo),
        label: cleanStr(leg.label) || (legFlight ? `Flight ${legFlight}` : undefined),
        pol: cleanStr(leg.pol),
        pod: cleanStr(leg.pod),
        airline_name: legAirline,
        flight_number: legFlight,
        arrival_flight_number:
          cleanStr(leg.arrival_flight_number) ||
          (i === 0 ? arrivalFlight : undefined),
        mawb_number: cleanStr(leg.mawb_number) || (i === 0 ? mawb : undefined),
        hawb_number: cleanStr(leg.hawb_number) || (i === 0 ? hawb : undefined),
        flight_date: cleanStr(leg.flight_date) || (i === 0 ? flightDate : undefined),
        flight_status:
          cleanStr(leg.flight_status) || (i === 0 ? flightStatus : undefined),
        etd: cleanStr(leg.etd),
        eta: cleanStr(leg.eta),
      };
    }),
    port_of_call: (profile.port_of_call ?? []).map((row) => ({
      role: cleanStr(row.role),
      port_name: cleanStr(row.port_name),
      un_locode: cleanStr(row.un_locode),
      eta: cleanStr(row.eta) ?? null,
      ata: cleanStr(row.ata) ?? null,
      etd: cleanStr(row.etd) ?? null,
      atd: cleanStr(row.atd) ?? null,
      vessel_name: cleanStr(row.vessel_name) || airlineName,
      voyage_number: cleanStr(row.voyage_number) || flightNumber,
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
    detailed_data: detailed,
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

  const airlineName =
    cleanStr(profile.airline_name) ||
    cleanStr(legs[0].airline_name) ||
    cleanStr(legs[0].vessel_name) ||
    cleanStr((air as { airline_name?: string; airline?: string } | undefined)?.airline_name) ||
    cleanStr((air as { airline?: string } | undefined)?.airline) ||
    cleanStr(j.vessel_name) ||
    '';
  const flightNumber =
    cleanStr(profile.flight_number) ||
    cleanStr(legs[0].flight_number) ||
    cleanStr(legs[0].voyage_number) ||
    cleanStr(air?.flight_number) ||
    cleanStr(j.flight_number) ||
    '';
  const arrivalFlight =
    cleanStr(profile.arrival_flight_number) ||
    cleanStr(legs[0].arrival_flight_number) ||
    cleanStr((air as { arrival_flight_number?: string } | undefined)?.arrival_flight_number) ||
    '';
  const mawb =
    cleanStr(profile.mawb_number) ||
    cleanStr(legs[0].mawb_number) ||
    cleanStr(air?.mawb_number) ||
    cleanStr(j.mawb_number) ||
    '';
  const hawb =
    cleanStr(profile.hawb_number) ||
    cleanStr(legs[0].hawb_number) ||
    cleanStr(air?.hawb_number) ||
    cleanStr(j.hawb_number) ||
    '';
  const flightDate =
    cleanStr(profile.flight_date) ||
    cleanStr(legs[0].flight_date) ||
    cleanStr(air?.flight_date) ||
    '';
  const flightStatus =
    cleanStr(profile.flight_status) ||
    cleanStr(legs[0].flight_status) ||
    cleanStr(air?.flight_status) ||
    cleanStr(j.flight_status) ||
    '';

  if (flightNumber || mawb || hawb || airlineName) {
    legs[0] = {
      ...legs[0],
      airline_name: cleanStr(legs[0].airline_name) || airlineName,
      vessel_name: cleanStr(legs[0].vessel_name) || airlineName,
      flight_number: cleanStr(legs[0].flight_number) || flightNumber,
      arrival_flight_number: cleanStr(legs[0].arrival_flight_number) || arrivalFlight,
      mawb_number: cleanStr(legs[0].mawb_number) || mawb,
      hawb_number: cleanStr(legs[0].hawb_number) || hawb,
      flight_date: cleanStr(legs[0].flight_date) || flightDate,
      flight_status: cleanStr(legs[0].flight_status) || flightStatus,
      voyage_number: cleanStr(legs[0].voyage_number) || flightNumber,
      pol: cleanStr(legs[0].pol) || origin,
      pod: cleanStr(legs[0].pod) || dest,
      etd: cleanStr(legs[0].etd) || cleanStr(j.etd) || flightDate,
      eta: cleanStr(legs[0].eta) || cleanStr(j.eta) || '',
      label: cleanStr(legs[0].label) || (flightNumber ? `Flight ${flightNumber}` : ''),
    };
  }

  const poc = ensureOriginDestPoc(profile.port_of_call ?? []).map((row) => {
    if (row.role === 'ORIGIN' && !cleanStr(row.port_name)) {
      return {
        ...row,
        port_name: origin,
        etd: cleanStr(row.etd) || cleanStr(j.etd) || flightDate || '',
        voyage_number: cleanStr(row.voyage_number) || flightNumber,
      };
    }
    if (row.role === 'DEST' && !cleanStr(row.port_name)) {
      return {
        ...row,
        port_name: dest,
        eta: cleanStr(row.eta) || cleanStr(j.eta) || '',
        voyage_number: cleanStr(row.voyage_number) || arrivalFlight || flightNumber,
      };
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
    hawb_number: hawb || j.hawb_number || air?.hawb_number,
    mawb_number: mawb || air?.mawb_number,
    airline_name: airlineName,
    flight_number: flightNumber,
    arrival_flight_number: arrivalFlight,
    flight_date: flightDate,
    flight_status: flightStatus,
    vessel_name: airlineName || j.vessel_name,
    voyage_number: flightNumber || j.voyage_number,
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
    airline_name: airlineName || profile.airline_name || '',
    flight_number: flightNumber || profile.flight_number || '',
    arrival_flight_number: arrivalFlight || profile.arrival_flight_number || '',
    mawb_number: mawb || profile.mawb_number || '',
    hawb_number: hawb || profile.hawb_number || '',
    flight_date: flightDate || profile.flight_date || '',
    flight_status: flightStatus || profile.flight_status || '',
    legs,
    port_of_call: poc,
    qty_gw_vol: qty,
    detailed_data: detailed,
  };
}

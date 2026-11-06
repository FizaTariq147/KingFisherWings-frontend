import {
  asRecord,
  pickString,
  unwrapData,
} from '@/features/portal-shared/normalize';
import type {
  PublicTrackArrivalReportRow,
  PublicTrackCargoInfo,
  PublicTrackContainer,
  PublicTrackCustomsStatusRow,
  PublicTrackEmbedConfig,
  PublicTrackManifestStatusRow,
  PublicTrackMatch,
  PublicTrackMilestone,
  PublicTrackPortOfCall,
  PublicTrackProgressLeg,
  PublicTrackQtyGwVol,
  PublicTrackResult,
  PublicTrackRoute,
  PublicTrackRouteLegRow,
} from '../types/publicTrack.types';

function pickNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function isAirJobType(jobType?: string | null): boolean {
  const t = String(jobType || '').toUpperCase();
  return t === 'AIR_EXPORT' || t === 'AIR_IMPORT' || t.startsWith('AIR');
}

function titleCaseMove(value: string): string {
  return value
    .replace(/[/\\|]+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function unwrapArray(...candidates: unknown[]): unknown[] {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
    const rec = asRecord(c);
    if (!rec) continue;
    for (const key of [
      'items',
      'results',
      'rows',
      'data',
      'legs',
      'ports',
      'points',
      'manifest_status',
      'manifestStatus',
      'arrival_report_status',
      'arrivalReportStatus',
    ]) {
      if (Array.isArray(rec[key]) && (rec[key] as unknown[]).length) {
        return rec[key] as unknown[];
      }
    }
  }
  return [];
}

function formatContainerType(type?: string, iso?: string): string | undefined {
  const t = type?.trim();
  const i = iso?.trim();
  if (t && i && t.toUpperCase() !== i.toUpperCase()) return `${i} (${t})`;
  return t || i || undefined;
}

function containerKindOf(rec: Record<string, unknown> | null): 'ACTUAL' | 'PLANNED' | undefined {
  const kind = pickString(rec?.kind, rec?.container_kind, rec?.containerKind)?.toUpperCase();
  if (kind === 'ACTUAL' || kind === 'PLANNED') return kind;
  return undefined;
}

/**
 * Strip STATUS change + HOLD/RESUME spam from timeline — keep milestones / container / ops.
 * Matches `eventType` or raw `type` (normalized into eventType).
 */
export function isTrackTimelineNoise(
  m: Pick<PublicTrackMilestone, 'eventType'>,
): boolean {
  const type = String(m.eventType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!type) return false;
  return (
    type === 'STATUS' ||
    type === 'HOLD' ||
    type === 'RESUME' ||
    type.startsWith('STATUS_') ||
    type.startsWith('HOLD_') ||
    type.startsWith('RESUME_')
  );
}

/** OpenAPI TrackHistoryEventDto (+ legacy aliases). */
export function normalizePublicMilestone(
  raw: unknown,
  index: number,
): PublicTrackMilestone | null {
  const r = asRecord(raw);
  if (!r) return null;

  const completedAt =
    pickString(
      r.actual_at,
      r.actualAt,
      r.completed_at,
      r.completedAt,
      r.occurred_at,
      r.occurredAt,
      r.planned_at,
      r.plannedAt,
      r.date,
      r.timestamp,
    ) || undefined;

  const isCompleted =
    r.is_completed === true ||
    r.isCompleted === true ||
    Boolean(
      pickString(r.actual_at, r.actualAt, r.completed_at, r.completedAt, r.occurred_at),
    );

  const eventType =
    pickString(r.event_type, r.eventType, r.type, r.code) || undefined;

  const moveRaw =
    pickString(r.move, r.label, r.code, r.type, r.event_type, r.eventType) || 'EVENT';
  const move = titleCaseMove(moveRaw);

  return {
    id: pickString(r.id, r.code) || String(index),
    label: move,
    move,
    description: pickString(r.notes, r.description, r.summary) || undefined,
    summary: pickString(r.notes, r.summary) || undefined,
    occurredAt: completedAt,
    completedAt,
    location:
      pickString(
        r.location,
        r.location_terminal,
        r.locationTerminal,
        r.place,
        r.port,
        r.port_name,
        r.city,
      ) || undefined,
    terminal:
      pickString(
        r.terminal,
        r.terminal_name,
        r.location_terminal,
        r.locationTerminal,
        r.facility,
        r.depot,
      ) || undefined,
    status: pickString(r.status) || undefined,
    pending: !isCompleted,
    eventType,
    containerNumber:
      pickString(r.container_number, r.containerNumber, r.container_no) || undefined,
    vessel: pickString(r.vessel_name, r.vesselName, r.vessel) || undefined,
    voyage: pickString(r.voyage_number, r.voyageNumber, r.voyage) || undefined,
    flightNumber:
      pickString(r.flight_number, r.flightNumber, r.flight_no, r.flightNo) || undefined,
    mawbNumber: pickString(r.mawb_number, r.mawbNumber, r.mawb_no, r.mawbNo) || undefined,
    hawbNumber: pickString(r.hawb_number, r.hawbNumber, r.hawb_no, r.hawbNo) || undefined,
  };
}

function normalizeMatches(raw: unknown): PublicTrackMatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: PublicTrackMatch[] = [];
  for (const row of raw) {
    const r = asRecord(row);
    if (!r) continue;
    const reference = pickString(
      r.reference,
      r.ref,
      r.job_number,
      r.jobNumber,
      r.shipment_number,
      r.container_number,
    );
    if (!reference) continue;
    out.push({
      reference,
      kind: pickString(r.kind, r.type) || undefined,
      status: pickString(r.status) || undefined,
    });
  }
  return out.length ? out : undefined;
}

function normalizeProgressLegRows(raw: unknown[]): PublicTrackProgressLeg[] {
  const out: PublicTrackProgressLeg[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const row = raw[index];
    const r = asRecord(row);
    if (!r) {
      const name = pickString(row);
      if (!name) continue;
      out.push({
        id: String(index),
        code: index === 0 ? 'POL' : index === raw.length - 1 ? 'POD' : 'PTS',
        name,
      });
      continue;
    }
    const name =
      pickString(r.name, r.port_name, r.portName, r.location, r.city, r.label) || '';
    if (!name) continue;
    const code =
      pickString(r.code, r.leg_type, r.legType, r.role, r.kind, r.type)?.toUpperCase() ||
      (index === 0 ? 'POL' : index === raw.length - 1 ? 'POD' : 'PTS');
    out.push({
      id: pickString(r.id, r.un_locode, r.unLocode) || String(index),
      code,
      name,
      country: pickString(r.country, r.country_code, r.countryCode) || undefined,
      current: r.current === true || r.is_current === true || r.isCurrent === true,
      completed:
        r.completed === true ||
        r.is_completed === true ||
        Boolean(pickString(r.completed_at, r.actual_date)),
    });
  }
  return out;
}

/** Prefer top-level progress_legs, then route.progress_legs; do not treat route object as a leg list. */
function normalizeProgressLegs(
  body: Record<string, unknown>,
  routeRec: Record<string, unknown> | null,
): PublicTrackProgressLeg[] {
  const raw = unwrapArray(
    body.progress_legs,
    body.progressLegs,
    routeRec?.progress_legs,
    routeRec?.progressLegs,
    body.route_legs,
    body.routeLegs,
    body.ports,
    Array.isArray(body.route) ? body.route : undefined,
  );
  return normalizeProgressLegRows(raw);
}

function normalizeRouteLegRow(
  raw: unknown,
  index: number,
  airMode = false,
): PublicTrackRouteLegRow | null {
  const r = asRecord(raw);
  if (!r) {
    const label = pickString(raw);
    if (!label) return null;
    return { id: String(index), label };
  }
  const label =
    pickString(r.label, r.name, r.leg_name, r.legName, r.description) || undefined;
  const from =
    pickString(
      r.from,
      r.origin,
      r.pol,
      r.from_port,
      r.fromPort,
      r.origin_airport,
      r.originAirport,
      r.from_airport,
    ) || undefined;
  const to =
    pickString(
      r.to,
      r.destination,
      r.pod,
      r.to_port,
      r.toPort,
      r.dest_airport,
      r.destAirport,
      r.to_airport,
    ) || undefined;
  const flightNumber =
    pickString(r.flight_number, r.flightNumber, r.flight_no, r.flightNo) || undefined;
  const arrivalFlightNumber =
    pickString(
      r.arrival_flight_number,
      r.arrivalFlightNumber,
      r.arrival_flight,
      r.arrivalFlight,
    ) || undefined;
  const mawbNumber =
    pickString(r.mawb_number, r.mawbNumber, r.mawb_no, r.mawbNo) || undefined;
  const hawbNumber =
    pickString(r.hawb_number, r.hawbNumber, r.hawb_no, r.hawbNo) || undefined;
  // Air: do not inject vessel/voyage fallbacks — leave null and surface flight fields.
  const vessel = airMode
    ? undefined
    : pickString(r.vessel_name, r.vesselName, r.vessel) || undefined;
  const voyage = airMode
    ? undefined
    : pickString(r.voyage_number, r.voyageNumber, r.voyage, r.voyage_no, r.voyageNo) ||
      undefined;
  const imo = airMode ? undefined : pickString(r.imo) || undefined;
  const legNo = pickNumber(r.leg_no, r.legNo);
  if (
    !label &&
    !from &&
    !to &&
    !vessel &&
    !voyage &&
    !imo &&
    !flightNumber &&
    !arrivalFlightNumber &&
    !mawbNumber &&
    !hawbNumber
  ) {
    return null;
  }
  return {
    id: pickString(r.id) || String(index),
    legNo,
    label:
      label ||
      (legNo != null
        ? `${legNo === 1 ? '1st' : legNo === 2 ? '2nd' : `Leg ${legNo}`}`
        : undefined),
    code: pickString(r.code, r.leg_type, r.legType) || undefined,
    from,
    to,
    vessel,
    voyage,
    flightNumber,
    arrivalFlightNumber,
    mawbNumber,
    hawbNumber,
    imo,
    etd:
      pickString(r.etd, r.etd_at, r.departure, r.flight_date, r.flightDate) || undefined,
    eta: pickString(r.eta, r.eta_at, r.arrival, r.actual_eta, r.actualEta) || undefined,
    raw: r,
  };
}

function normalizePortOfCall(
  raw: unknown,
  index: number,
  airMode = false,
): PublicTrackPortOfCall | null {
  const r = asRecord(raw);
  if (!r) {
    const name = pickString(raw);
    if (!name) return null;
    return { id: String(index), name };
  }
  const name =
    pickString(
      r.name,
      r.port_name,
      r.portName,
      r.location,
      r.city,
      r.label,
      r.airport_name,
      r.airportName,
    ) || undefined;
  const role = pickString(r.role, r.code)?.toUpperCase() || undefined;
  if (!name && !pickString(r.un_locode, r.unLocode, r.iata, r.icao) && !role) return null;
  const flightNumber =
    pickString(r.flight_number, r.flightNumber, r.flight_no, r.flightNo) || undefined;
  const arrivalFlightNumber =
    pickString(
      r.arrival_flight_number,
      r.arrivalFlightNumber,
      r.arrival_flight,
      r.arrivalFlight,
    ) || undefined;
  return {
    id: pickString(r.id, r.un_locode, r.unLocode, r.iata) || String(index),
    role,
    name,
    code: pickString(r.un_locode, r.unLocode, r.code, r.iata, r.icao) || undefined,
    country: pickString(r.country, r.country_code, r.countryCode) || undefined,
    eta: pickString(r.eta, r.eta_at, r.actual_eta, r.actualEta) || undefined,
    etd: pickString(r.etd, r.etd_at, r.flight_date, r.flightDate) || undefined,
    ata: pickString(r.ata, r.ata_at, r.actual_arrival) || undefined,
    atd: pickString(r.atd, r.atd_at, r.actual_departure) || undefined,
    vesselName: airMode
      ? undefined
      : pickString(r.vessel_name, r.vesselName, r.vessel) || undefined,
    voyageNumber: airMode
      ? undefined
      : pickString(r.voyage_number, r.voyageNumber, r.voyage, r.voyage_no) || undefined,
    flightNumber,
    arrivalFlightNumber,
    mawbNumber:
      pickString(r.mawb_number, r.mawbNumber, r.mawb_no, r.mawbNo) || undefined,
    hawbNumber:
      pickString(r.hawb_number, r.hawbNumber, r.hawb_no, r.hawbNo) || undefined,
    raw: r,
  };
}

function normalizeRoute(
  body: Record<string, unknown>,
  origin?: string,
  destination?: string,
  airMode = false,
): PublicTrackRoute | undefined {
  const routeRec = asRecord(body.route);
  const blNumber =
    pickString(
      routeRec?.bl_number,
      routeRec?.blNumber,
      body.bl_number,
      body.blNumber,
    ) || undefined;
  const from =
    pickString(
      routeRec?.from,
      routeRec?.origin,
      routeRec?.origin_port,
      routeRec?.originPort,
      routeRec?.origin_label,
      routeRec?.originLabel,
      routeRec?.pol,
      body.origin_port,
      body.originPort,
      body.origin_label,
      body.originLabel,
      origin,
    ) || undefined;
  const to =
    pickString(
      routeRec?.to,
      routeRec?.destination,
      routeRec?.dest_port,
      routeRec?.destPort,
      routeRec?.dest_label,
      routeRec?.destLabel,
      routeRec?.pod,
      body.dest_port,
      body.destPort,
      body.dest_label,
      body.destLabel,
      destination,
    ) || undefined;
  const originLabel =
    pickString(
      routeRec?.origin_port,
      routeRec?.originPort,
      routeRec?.origin_label,
      routeRec?.originLabel,
      body.origin_port,
      body.origin_label,
      from,
    ) || undefined;
  const destLabel =
    pickString(
      routeRec?.dest_port,
      routeRec?.destPort,
      routeRec?.dest_label,
      routeRec?.destLabel,
      body.dest_port,
      body.dest_label,
      to,
    ) || undefined;
  const atBefore =
    pickString(
      routeRec?.at_before,
      routeRec?.atBefore,
      body.at_before,
      body.atBefore,
    ) || undefined;
  const terminalCutoffAt =
    pickString(
      routeRec?.terminal_cutoff_at,
      routeRec?.terminalCutoffAt,
      body.terminal_cutoff_at,
      body.terminalCutoffAt,
    ) || undefined;

  const firstLegRaw =
    asRecord(routeRec?.first_leg) ??
    asRecord(routeRec?.firstLeg) ??
    asRecord(body.first_leg) ??
    asRecord(body.firstLeg);
  const secondLegRaw =
    asRecord(routeRec?.second_leg) ??
    asRecord(routeRec?.secondLeg) ??
    asRecord(body.second_leg) ??
    asRecord(body.secondLeg);
  const firstLeg = firstLegRaw
    ? normalizeRouteLegRow({ ...firstLegRaw, leg_no: 1 }, 0, airMode)
    : null;
  const secondLeg = secondLegRaw
    ? normalizeRouteLegRow({ ...secondLegRaw, leg_no: 2 }, 1, airMode)
    : null;

  const legsRaw = unwrapArray(routeRec?.legs, body.legs);
  const legsFromArray = legsRaw
    .map((row, i) => normalizeRouteLegRow(row, i, airMode))
    .filter((r): r is PublicTrackRouteLegRow => Boolean(r));
  const legs: PublicTrackRouteLegRow[] = [];
  if (firstLeg) legs.push(firstLeg);
  if (secondLeg) legs.push(secondLeg);
  for (const leg of legsFromArray) {
    if (leg.legNo === 1 && firstLeg) continue;
    if (leg.legNo === 2 && secondLeg) continue;
    legs.push(leg);
  }

  const pocRaw = unwrapArray(
    routeRec?.port_of_call,
    routeRec?.portOfCall,
    body.port_of_call,
    body.portOfCall,
  );
  const portOfCall = pocRaw
    .map((row, i) => normalizePortOfCall(row, i, airMode))
    .filter((r): r is PublicTrackPortOfCall => Boolean(r));

  if (
    !blNumber &&
    !from &&
    !to &&
    !originLabel &&
    !destLabel &&
    !atBefore &&
    !terminalCutoffAt &&
    !legs.length &&
    !portOfCall.length
  ) {
    return undefined;
  }

  return {
    blNumber,
    from,
    to,
    originLabel,
    destLabel,
    atBefore,
    terminalCutoffAt,
    firstLeg: firstLeg || legs.find((l) => l.legNo === 1),
    secondLeg: secondLeg || legs.find((l) => l.legNo === 2),
    legs,
    portOfCall,
  };
}

function normalizeDetailedData(raw: unknown): Record<string, unknown> {
  const rec = asRecord(raw);
  if (!rec) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (v == null) continue;
    out[k] = v;
  }
  return out;
}

function normalizeArrivalReportRow(
  raw: unknown,
  index: number,
): PublicTrackArrivalReportRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const row: PublicTrackArrivalReportRow = {
    id: pickString(r.id) || String(index),
    status: pickString(r.status) || undefined,
    sendingTime: pickString(r.sending_time, r.sendingTime) || undefined,
    receiptTime: pickString(r.receipt_time, r.receiptTime) || undefined,
    containerNo: pickString(r.container_no, r.containerNo, r.container_number) || undefined,
    subContainerNo: pickString(r.sub_container_no, r.subContainerNo) || undefined,
    vesselName: pickString(r.vessel_name, r.vesselName, r.vessel) || undefined,
    voyageNo: pickString(r.voyage_no, r.voyageNo, r.voyage_number, r.voyage) || undefined,
    imo: pickString(r.imo) || undefined,
  };
  if (
    !row.status &&
    !row.sendingTime &&
    !row.receiptTime &&
    !row.containerNo &&
    !row.vesselName
  ) {
    return null;
  }
  return row;
}

function normalizeCustomsStatusRow(
  raw: unknown,
  index: number,
): PublicTrackCustomsStatusRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const row: PublicTrackCustomsStatusRow = {
    id: pickString(r.id) || String(index),
    carrierOperator: pickString(r.carrier_operator, r.carrierOperator) || undefined,
    customsReleased:
      typeof r.customs_released === 'boolean'
        ? r.customs_released
        : typeof r.customsReleased === 'boolean'
          ? r.customsReleased
          : undefined,
    subCustomsNo: pickString(r.sub_customs_no, r.subCustomsNo) || undefined,
    quantity: pickNumber(r.quantity),
    weight: pickNumber(r.weight),
    volume: pickNumber(r.volume),
    customsDeclarationNo:
      pickString(r.customs_declaration_no, r.customsDeclarationNo) || undefined,
    customsInspectionStatus:
      pickString(r.customs_inspection_status, r.customsInspectionStatus) || undefined,
    customsInspectionTime:
      pickString(r.customs_inspection_time, r.customsInspectionTime) || undefined,
  };
  if (
    !row.carrierOperator &&
    row.customsReleased == null &&
    !row.subCustomsNo &&
    row.quantity == null &&
    !row.customsDeclarationNo &&
    !row.customsInspectionStatus
  ) {
    return null;
  }
  return row;
}

function normalizeManifestStatusRow(
  raw: unknown,
  index: number,
): PublicTrackManifestStatusRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const row: PublicTrackManifestStatusRow = {
    id: pickString(r.id) || String(index),
    subCustomsNo: pickString(r.sub_customs_no, r.subCustomsNo) || undefined,
    status: pickString(r.status) || undefined,
    sendingTime: pickString(r.sending_time, r.sendingTime) || undefined,
    receiptReceivingTime:
      pickString(
        r.receipt_receiving_time,
        r.receiptReceivingTime,
        r.receipt_time,
        r.receiptTime,
      ) || undefined,
    containerNo: pickString(r.container_no, r.containerNo, r.container_number) || undefined,
    vesselName: pickString(r.vessel_name, r.vesselName, r.vessel) || undefined,
    voyageNo: pickString(r.voyage_no, r.voyageNo, r.voyage_number) || undefined,
    imo: pickString(r.imo) || undefined,
  };
  if (
    !row.subCustomsNo &&
    !row.status &&
    !row.sendingTime &&
    !row.receiptReceivingTime &&
    !row.containerNo &&
    !row.vesselName
  ) {
    return null;
  }
  return row;
}

function normalizeCargoInfo(body: Record<string, unknown>): PublicTrackCargoInfo | undefined {
  const cargoRec =
    asRecord(body.cargo_info) ??
    asRecord(body.cargoInfo) ??
    asRecord(body.cargo);
  const arrivalReport = unwrapArray(
    cargoRec?.arrival_report_status,
    cargoRec?.arrivalReportStatus,
    cargoRec?.arrival_report,
    cargoRec?.arrivalReport,
    body.arrival_report_status,
    body.arrival_report,
    body.arrivalReport,
  )
    .map(normalizeArrivalReportRow)
    .filter((r): r is PublicTrackArrivalReportRow => Boolean(r));
  const customsStatus = unwrapArray(
    cargoRec?.customs_status,
    cargoRec?.customsStatus,
    body.customs_status,
    body.customsStatus,
  )
    .map(normalizeCustomsStatusRow)
    .filter((r): r is PublicTrackCustomsStatusRow => Boolean(r));
  const detailedData = normalizeDetailedData(
    cargoRec?.detailed_data ??
      cargoRec?.detailedData ??
      body.detailed_data ??
      body.detailedData,
  );
  if (!arrivalReport.length && !customsStatus.length && !Object.keys(detailedData).length) {
    return undefined;
  }
  return { arrivalReport, customsStatus, detailedData };
}

function normalizePreManifest(
  body: Record<string, unknown>,
): PublicTrackManifestStatusRow[] {
  const preRec = asRecord(body.pre_manifest) ?? asRecord(body.preManifest);
  return unwrapArray(
    preRec?.manifest_status,
    preRec?.manifestStatus,
    Array.isArray(body.pre_manifest) ? body.pre_manifest : undefined,
    Array.isArray(body.preManifest) ? body.preManifest : undefined,
    body.manifest_status,
    body.manifestStatus,
  )
    .map(normalizeManifestStatusRow)
    .filter((r): r is PublicTrackManifestStatusRow => Boolean(r));
}

function formatWithUnit(value?: number, unit?: string): string | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return unit ? `${value} ${unit}` : String(value);
}

function normalizeQtyGwVol(body: Record<string, unknown>): PublicTrackQtyGwVol | undefined {
  const rec =
    asRecord(body.qty_gw_vol) ??
    asRecord(body.qtyGwVol) ??
    asRecord(body.qty_gw_volume) ??
    null;
  if (!rec) return undefined;
  const quantity = pickNumber(rec.quantity, rec.qty, rec.packages, rec.pkg, rec.pcs);
  const grossWeight = pickNumber(rec.gross_weight, rec.grossWeight, rec.gw, rec.weight, rec.g_w);
  const netWeight = pickNumber(rec.net_weight, rec.netWeight);
  const volume = pickNumber(rec.volume, rec.vol, rec.cbm, rec.measurement);
  const chargeableWeight = pickNumber(rec.chargeable_weight, rec.chargeableWeight);
  const qtyUnit = pickString(rec.qty_unit, rec.qtyUnit) || undefined;
  const weightUnit = pickString(rec.weight_unit, rec.weightUnit) || undefined;
  const volumeUnit = pickString(rec.volume_unit, rec.volumeUnit) || undefined;
  const lines = Array.isArray(rec.lines)
    ? rec.lines
        .map((line) => asRecord(line))
        .filter((line): line is Record<string, unknown> => Boolean(line))
    : [];
  const extras: Record<string, string> = {};
  const known = new Set([
    'qty',
    'quantity',
    'packages',
    'pkg',
    'pcs',
    'gw',
    'gross_weight',
    'grossWeight',
    'weight',
    'g_w',
    'net_weight',
    'netWeight',
    'vol',
    'volume',
    'cbm',
    'measurement',
    'chargeable_weight',
    'chargeableWeight',
    'qty_unit',
    'qtyUnit',
    'weight_unit',
    'weightUnit',
    'volume_unit',
    'volumeUnit',
    'lines',
  ]);
  for (const [k, v] of Object.entries(rec)) {
    if (known.has(k)) continue;
    if (v == null || typeof v === 'object') continue;
    extras[k] = String(v);
  }
  if (
    quantity == null &&
    grossWeight == null &&
    netWeight == null &&
    volume == null &&
    chargeableWeight == null &&
    !lines.length &&
    !Object.keys(extras).length
  ) {
    return undefined;
  }
  return {
    quantity,
    grossWeight,
    netWeight,
    volume,
    chargeableWeight,
    qtyUnit,
    weightUnit,
    volumeUnit,
    lines,
    qty: formatWithUnit(quantity, qtyUnit),
    gw: formatWithUnit(grossWeight, weightUnit),
    vol: formatWithUnit(volume, volumeUnit),
    extras,
  };
}

function pickContainersFromBody(body: Record<string, unknown>): {
  containerNumber?: string;
  containerType?: string;
  containerKind?: 'ACTUAL' | 'PLANNED';
  containers: import('../types/publicTrack.types').PublicTrackContainer[];
} {
  const topNumber = pickString(body.container_number, body.containerNumber);
  const topType = formatContainerType(
    pickString(body.container_type, body.containerType),
    pickString(body.iso_size, body.isoSize),
  );

  const list = unwrapArray(body.containers);
  const containers: PublicTrackContainer[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const r = asRecord(list[index]);
    if (!r) continue;
    const number = pickString(r.container_number, r.containerNumber) || '';
    const type = formatContainerType(
      pickString(r.container_type, r.containerType),
      pickString(r.iso_size, r.isoSize),
    );
    const status = pickString(r.status, r.status_code, r.statusCode) || undefined;
    const statusLabel =
      pickString(r.status_label, r.statusLabel) ||
      (status ? status.replaceAll('_', ' ') : undefined);
    if (!number && !type && !status) continue;
    containers.push({
      id: pickString(r.id) || number || String(index),
      containerNumber: number || undefined,
      status,
      statusLabel,
      containerType: type || undefined,
      kind: containerKindOf(r),
      sealNumber: pickString(r.seal_number, r.sealNumber) || undefined,
    });
  }

  const preferred =
    containers.find((c) => c.kind === 'ACTUAL' && c.containerNumber) ||
    containers.find((c) => c.kind === 'PLANNED' && c.containerNumber) ||
    containers.find((c) => c.containerNumber) ||
    containers[0];

  return {
    containerNumber: preferred?.containerNumber || topNumber || undefined,
    containerType: preferred?.containerType || topType || undefined,
    containerKind: preferred?.kind,
    containers,
  };
}

/**
 * Peel TrackShipmentResponseDto and nested `{ success, data }` envelopes until
 * we reach TrackShipmentBodyDto (or the best available object).
 */
function peelTrackBody(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 4; i += 1) {
    const rec = asRecord(cur);
    if (!rec) return null;
    // Prefer explicit track body keys before peeling another `data` wrapper.
    if (
      rec.current_status != null ||
      rec.currentStatus != null ||
      Array.isArray(rec.history) ||
      Array.isArray(rec.moves) ||
      Array.isArray(rec.events) ||
      Array.isArray(rec.timeline) ||
      Array.isArray(rec.progress_legs) ||
      Array.isArray(rec.progressLegs) ||
      Array.isArray(rec.route_legs) ||
      Array.isArray(rec.ports) ||
      Array.isArray(rec.containers) ||
      Array.isArray(rec.pre_manifest) ||
      Array.isArray(rec.preManifest) ||
      asRecord(rec.pre_manifest) != null ||
      asRecord(rec.preManifest) != null ||
      asRecord(rec.route) != null ||
      asRecord(rec.cargo_info) != null ||
      asRecord(rec.cargoInfo) != null ||
      asRecord(rec.qty_gw_vol) != null ||
      asRecord(rec.qtyGwVol) != null ||
      rec.container_number != null ||
      rec.job_number != null ||
      rec.bl_number != null
    ) {
      return rec;
    }
    const nested =
      asRecord(rec.data) ??
      asRecord(rec.tracking) ??
      asRecord(rec.track) ??
      asRecord(rec.shipment) ??
      asRecord(rec.job) ??
      asRecord(unwrapData(rec));
    if (!nested || nested === rec) return rec;
    cur = nested;
  }
  return asRecord(cur);
}

/**
 * Normalize TrackShipmentResponseDto / TrackShipmentBodyDto and legacy envelopes.
 * OpenAPI: `{ success, data: TrackShipmentBodyDto }`.
 * Always returns a result when `fallbackRef` is provided so the reference UI can render.
 */
export function normalizePublicTrack(
  raw: unknown,
  opts?: { fallbackRef?: string },
): PublicTrackResult | null {
  const body = peelTrackBody(raw) ?? asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!body) {
    if (!opts?.fallbackRef?.trim()) return null;
    return {
      reference: opts.fallbackRef.trim(),
      progressLegs: [],
      milestones: [],
    };
  }

  const root = body;
  const summary = asRecord(body.summary);
  const routeRec = asRecord(body.route);

  const ref =
    pickString(
      body.job_number,
      body.jobNumber,
      body.reference,
      body.shipment_number,
      body.shipmentNumber,
      body.container_number,
      root.job_number,
      root.reference,
      root.ref,
      summary?.job_number,
      summary?.reference,
      opts?.fallbackRef,
    ) || '';
  if (!ref) return null;

  const historyRaw = unwrapArray(
    body.history,
    body.moves,
    body.events,
    body.timeline,
    body.milestones,
    body.container_events,
    body.containerEvents,
    root.history,
    root.moves,
    root.events,
    root.milestones,
  );

  const milestones = historyRaw
    .map(normalizePublicMilestone)
    .filter((m): m is PublicTrackMilestone => Boolean(m))
    .filter((m) => !isTrackTimelineNoise(m));

  // Prefer newest first for "current move" + previous collapses.
  const ordered = [...milestones].sort((a, b) => {
    const ta = Date.parse(a.completedAt || a.occurredAt || '') || 0;
    const tb = Date.parse(b.completedAt || b.occurredAt || '') || 0;
    return tb - ta;
  });

  let progress = pickNumber(body.progress, root.progress, summary?.progress);
  if (progress != null && progress > 0 && progress <= 1) progress = Math.round(progress * 100);

  const origin =
    pickString(
      body.origin,
      body.origin_name,
      body.origin_port,
      body.pol,
      routeRec?.from,
      routeRec?.origin_port,
      routeRec?.origin_label,
      routeRec?.originLabel,
      summary?.origin,
    ) || undefined;
  const destination =
    pickString(
      body.destination,
      body.dest_name,
      body.dest_port,
      body.pod,
      routeRec?.to,
      routeRec?.dest_port,
      routeRec?.dest_label,
      routeRec?.destLabel,
      summary?.destination,
    ) || undefined;

  const container = pickContainersFromBody(body);
  let progressLegs = normalizeProgressLegs(body, routeRec);

  if (!progressLegs.length && (origin || destination)) {
    progressLegs = [];
    if (origin) progressLegs.push({ id: 'pol', code: 'POL', name: origin, completed: true });
    if (destination) {
      progressLegs.push({ id: 'pod', code: 'POD', name: destination, current: true });
    }
  }

  if (progressLegs.length && !progressLegs.some((l) => l.current)) {
    progressLegs[progressLegs.length - 1] = {
      ...progressLegs[progressLegs.length - 1],
      current: true,
    };
  }

  const jobType =
    pickString(body.job_type, body.jobType, summary?.job_type, summary?.jobType) ||
    undefined;
  const airMode = isAirJobType(jobType);
  const airDetails =
    asRecord(body.air_details) ??
    asRecord(body.airDetails) ??
    asRecord(summary?.air_details) ??
    asRecord(routeRec?.air_details);

  const mawbNumber =
    pickString(
      body.mawb_number,
      body.mawbNumber,
      airDetails?.mawb_number,
      airDetails?.mawbNumber,
      airDetails?.mawb_no,
    ) || undefined;
  const hawbNumber =
    pickString(
      body.hawb_number,
      body.hawbNumber,
      airDetails?.hawb_number,
      airDetails?.hawbNumber,
      airDetails?.hawb_no,
    ) || undefined;
  const flightNumber =
    pickString(
      body.flight_number,
      body.flightNumber,
      airDetails?.flight_number,
      airDetails?.flightNumber,
      airDetails?.flight_no,
    ) || undefined;
  const arrivalFlightNumber =
    pickString(
      body.arrival_flight_number,
      body.arrivalFlightNumber,
      airDetails?.arrival_flight_number,
      airDetails?.arrivalFlightNumber,
    ) || undefined;

  if (airMode) {
    // Prefer flight + MAWB/HAWB; do not inject vessel/voyage fallbacks for air.
    for (const m of ordered) {
      if (!m.flightNumber && flightNumber) m.flightNumber = flightNumber;
      if (!m.mawbNumber && mawbNumber) m.mawbNumber = mawbNumber;
      if (!m.hawbNumber && hawbNumber) m.hawbNumber = hawbNumber;
      m.vessel = undefined;
      m.voyage = undefined;
    }
  } else {
    const topVessel = pickString(body.vessel_name, body.vesselName);
    const topVoyage = pickString(body.voyage_number, body.voyageNumber);
    if (topVessel || topVoyage) {
      for (const m of ordered) {
        if (!m.vessel && topVessel) m.vessel = topVessel;
        if (!m.voyage && topVoyage) m.voyage = topVoyage;
      }
    }
  }

  const route = normalizeRoute(body, origin, destination, airMode);
  if (route && airMode && route.legs.length === 0 && (flightNumber || mawbNumber || hawbNumber)) {
    route.legs.push({
      id: 'air-flight',
      label: 'Flight',
      from: origin,
      to: destination,
      flightNumber,
      arrivalFlightNumber,
      mawbNumber,
      hawbNumber,
      etd:
        pickString(
          airDetails?.flight_date,
          airDetails?.flightDate,
          body.etd,
          body.job_date,
        ) || undefined,
      eta:
        pickString(
          airDetails?.actual_eta,
          airDetails?.actualEta,
          body.eta,
          body.expected_delivery,
        ) || undefined,
    });
  }

  const cargoInfo = normalizeCargoInfo(body);
  const preManifest = normalizePreManifest(body);
  const qtyGwVol = normalizeQtyGwVol(body);

  const expectedDelivery =
    pickString(
      body.expected_delivery,
      airMode
        ? airDetails?.actual_eta ?? airDetails?.actualEta ?? airDetails?.flight_date
        : undefined,
      body.eta,
      summary?.eta,
    ) || undefined;

  return {
    reference: ref,
    status: pickString(body.status, root.status) || undefined,
    currentStatus:
      pickString(
        body.current_status,
        body.currentStatus,
        summary?.current_status,
        body.status,
        root.current_status,
      ) || undefined,
    progress,
    expectedDelivery,
    origin,
    destination,
    jobType,
    partyName: pickString(body.party_name, summary?.party_name) || undefined,
    blNumber: route?.blNumber || pickString(body.bl_number, body.blNumber) || undefined,
    mawbNumber,
    hawbNumber,
    flightNumber,
    arrivalFlightNumber,
    containerNumber: container.containerNumber,
    containerType: container.containerType,
    containerKind: container.containerKind,
    containers: container.containers.length ? container.containers : undefined,
    progressLegs,
    milestones: ordered,
    matches: normalizeMatches(root.matches ?? root.results ?? root.alternates),
    route,
    cargoInfo,
    preManifest: preManifest.length ? preManifest : undefined,
    qtyGwVol,
  };
}

export function normalizeEmbedConfig(raw: unknown): PublicTrackEmbedConfig {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    tenantSlug: pickString(d.tenant_slug, d.tenantSlug) || undefined,
    companyName: pickString(d.company_name, d.companyName, d.tenant_name) || undefined,
    primaryColor: pickString(d.primary_color, d.primaryColor) || undefined,
    logoUrl: pickString(d.logo_url, d.logoUrl) || undefined,
    trackUrl: pickString(d.track_url, d.trackUrl, d.endpoint) || undefined,
    apiBaseUrl: pickString(d.api_base_url, d.apiBaseUrl, d.base_url) || undefined,
    widgetScriptUrl:
      pickString(d.widget_script_url, d.widgetScriptUrl, d.widget_url) || undefined,
  };
}

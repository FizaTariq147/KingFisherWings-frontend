export type PublicTrackLegCode = 'POL' | 'PTS' | 'POD' | 'ORIGIN' | 'DEST' | string;

export interface PublicTrackMilestone {
  id: string;
  label: string;
  description?: string;
  /** Prefer completed_at from API. */
  occurredAt?: string;
  completedAt?: string;
  location?: string;
  /** Terminal / depot / facility when distinct from city/port. */
  terminal?: string;
  status?: string;
  pending?: boolean;
  /** Richer TrackTimelineService event kinds (CONTAINER, HOLD, PORT_TOKEN, DRAFT_BL, …). */
  eventType?: string;
  summary?: string;
  containerNumber?: string;
  vessel?: string;
  voyage?: string;
  /** Air: flight number (prefer over vessel/voyage). */
  flightNumber?: string;
  mawbNumber?: string;
  hawbNumber?: string;
  /** Move / event code shown in history (e.g. GATE IN EMPTY AT DEPOT). */
  move?: string;
}

export interface PublicTrackProgressLeg {
  id: string;
  code: PublicTrackLegCode;
  name: string;
  country?: string;
  /** True when this leg is the current / last reached point. */
  current?: boolean;
  completed?: boolean;
  /** Live coordinates from tracking payload when present. */
  lat?: number;
  lng?: number;
}

export interface PublicTrackMatch {
  reference: string;
  kind?: string;
  status?: string;
}

export interface PublicTrackContainer {
  id: string;
  containerNumber?: string;
  status?: string;
  statusLabel?: string;
  containerType?: string;
  kind?: 'ACTUAL' | 'PLANNED';
  sealNumber?: string;
}

/** Route leg row from enriched `route.legs` / first_leg / second_leg. */
export interface PublicTrackRouteLegRow {
  id: string;
  legNo?: number;
  label?: string;
  code?: string;
  from?: string;
  to?: string;
  vessel?: string;
  voyage?: string;
  /** Air: leave vessel/voyage null; surface flight + airports. */
  flightNumber?: string;
  arrivalFlightNumber?: string;
  mawbNumber?: string;
  hawbNumber?: string;
  imo?: string;
  etd?: string;
  eta?: string;
  raw?: Record<string, unknown>;
}

/** Port-of-call stop from `route.port_of_call`. */
export interface PublicTrackPortOfCall {
  id: string;
  role?: string;
  name?: string;
  code?: string;
  country?: string;
  eta?: string;
  etd?: string;
  ata?: string;
  atd?: string;
  vesselName?: string;
  voyageNumber?: string;
  flightNumber?: string;
  arrivalFlightNumber?: string;
  mawbNumber?: string;
  hawbNumber?: string;
  /** Live coordinates from tracking payload when present. */
  lat?: number;
  lng?: number;
  raw?: Record<string, unknown>;
}

/** Enriched route block shared by public `/track` and staff `GET /jobs/:id/tracking`. */
export interface PublicTrackRoute {
  blNumber?: string;
  from?: string;
  to?: string;
  originLabel?: string;
  destLabel?: string;
  atBefore?: string;
  terminalCutoffAt?: string;
  firstLeg?: PublicTrackRouteLegRow;
  secondLeg?: PublicTrackRouteLegRow;
  legs: PublicTrackRouteLegRow[];
  portOfCall: PublicTrackPortOfCall[];
}

/** @deprecated Prefer typed section rows; kept for legacy info-list UIs. */
export interface PublicTrackInfoRow {
  id: string;
  label?: string;
  value?: string;
  status?: string;
  date?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export interface PublicTrackArrivalReportRow {
  id: string;
  status?: string;
  sendingTime?: string;
  receiptTime?: string;
  containerNo?: string;
  subContainerNo?: string;
  vesselName?: string;
  voyageNo?: string;
  imo?: string;
}

export interface PublicTrackCustomsStatusRow {
  id: string;
  carrierOperator?: string;
  customsReleased?: boolean;
  subCustomsNo?: string;
  quantity?: number;
  weight?: number;
  volume?: number;
  customsDeclarationNo?: string;
  customsInspectionStatus?: string;
  customsInspectionTime?: string;
}

export interface PublicTrackManifestStatusRow {
  id: string;
  subCustomsNo?: string;
  status?: string;
  sendingTime?: string;
  receiptReceivingTime?: string;
  containerNo?: string;
  vesselName?: string;
  voyageNo?: string;
  imo?: string;
}

export interface PublicTrackCargoInfo {
  arrivalReport: PublicTrackArrivalReportRow[];
  customsStatus: PublicTrackCustomsStatusRow[];
  detailedData: Record<string, unknown>;
}

export interface PublicTrackQtyGwVol {
  quantity?: number;
  grossWeight?: number;
  netWeight?: number;
  volume?: number;
  chargeableWeight?: number;
  qtyUnit?: string;
  weightUnit?: string;
  volumeUnit?: string;
  lines: Record<string, unknown>[];
  /** Display helpers (with units). */
  qty?: string;
  gw?: string;
  vol?: string;
  /** Extra numeric / text fields from API. */
  extras: Record<string, string>;
}

export interface PublicTrackResult {
  reference: string;
  status?: string;
  currentStatus?: string;
  progress?: number;
  expectedDelivery?: string;
  origin?: string;
  destination?: string;
  /** Live vessel/flight position from tracking payload when present. */
  currentLat?: number;
  currentLng?: number;
  jobType?: string;
  partyName?: string;
  /** B/L from route / profile. */
  blNumber?: string;
  /** Air document / flight refs (AIR_EXPORT / AIR_IMPORT). */
  mawbNumber?: string;
  hawbNumber?: string;
  flightNumber?: string;
  arrivalFlightNumber?: string;
  /** Primary container number (actual preferred over planned). */
  containerNumber?: string;
  /** ISO / type label e.g. 45G1 (40HC). */
  containerType?: string;
  containerKind?: 'ACTUAL' | 'PLANNED';
  /** All containers with statuses from track payload. */
  containers?: PublicTrackContainer[];
  /** Horizontal POL / PTS / POD (or origin→dest) progress rail. */
  progressLegs: PublicTrackProgressLeg[];
  milestones: PublicTrackMilestone[];
  /** When the resolver returns multiple hits for the same ref. */
  matches?: PublicTrackMatch[];
  /** YQN-style enriched route (from/to, legs, POC, cutoffs). */
  route?: PublicTrackRoute;
  /** Arrival report / customs / detailed cargo block. */
  cargoInfo?: PublicTrackCargoInfo;
  /** Pre-manifest → manifest_status rows. */
  preManifest?: PublicTrackManifestStatusRow[];
  /** Quantity / gross weight / volume summary. */
  qtyGwVol?: PublicTrackQtyGwVol;
}

export interface PublicTrackEmbedConfig {
  tenantSlug?: string;
  companyName?: string;
  primaryColor?: string;
  logoUrl?: string;
  trackUrl?: string;
  apiBaseUrl?: string;
  widgetScriptUrl?: string;
}

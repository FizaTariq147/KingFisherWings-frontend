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

/** Route leg row from enriched `route.legs` (YQN-style). */
export interface PublicTrackRouteLegRow {
  id: string;
  label?: string;
  code?: string;
  from?: string;
  to?: string;
  vessel?: string;
  voyage?: string;
  etd?: string;
  eta?: string;
  raw?: Record<string, unknown>;
}

/** Port-of-call stop from `route.port_of_call`. */
export interface PublicTrackPortOfCall {
  id: string;
  name?: string;
  code?: string;
  country?: string;
  eta?: string;
  etd?: string;
  ata?: string;
  atd?: string;
  raw?: Record<string, unknown>;
}

/** Enriched route block shared by public `/track` and staff `GET /jobs/:id/tracking`. */
export interface PublicTrackRoute {
  from?: string;
  to?: string;
  originLabel?: string;
  destLabel?: string;
  atBefore?: string;
  terminalCutoffAt?: string;
  legs: PublicTrackRouteLegRow[];
  portOfCall: PublicTrackPortOfCall[];
}

/** Key/value or labeled row used in cargo / pre-manifest tables. */
export interface PublicTrackInfoRow {
  id: string;
  label?: string;
  value?: string;
  status?: string;
  date?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export interface PublicTrackCargoInfo {
  arrivalReport: PublicTrackInfoRow[];
  customsStatus: PublicTrackInfoRow[];
  detailedData: Record<string, unknown>;
}

export interface PublicTrackQtyGwVol {
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
  jobType?: string;
  partyName?: string;
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
  /** Pre-manifest rows. */
  preManifest?: PublicTrackInfoRow[];
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

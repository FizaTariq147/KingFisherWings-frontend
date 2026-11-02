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
  /** Horizontal POL / PTS / POD (or origin→dest) progress rail. */
  progressLegs: PublicTrackProgressLeg[];
  milestones: PublicTrackMilestone[];
  /** When the resolver returns multiple hits for the same ref. */
  matches?: PublicTrackMatch[];
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

export interface PublicTrackMilestone {
  id: string;
  label: string;
  description?: string;
  /** Prefer completed_at from API. */
  occurredAt?: string;
  completedAt?: string;
  location?: string;
  status?: string;
  pending?: boolean;
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
  milestones: PublicTrackMilestone[];
  partyName?: string;
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

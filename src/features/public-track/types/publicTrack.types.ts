export interface PublicTrackMilestone {
  id: string; label: string; occurredAt?: string; location?: string; status?: string;
}
export interface PublicTrackResult {
  reference: string; status?: string; origin?: string; destination?: string;
  jobType?: string; milestones: PublicTrackMilestone[]; partyName?: string;
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

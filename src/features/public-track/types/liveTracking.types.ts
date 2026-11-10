/** Live vessel / flight card from /track/live/* and job|shipment tracking/live. */
export interface LiveTrackingLink {
  label: string;
  url: string;
}

export interface LiveTrackingCard {
  kind: 'flight' | 'vessel' | 'unknown';
  query?: string;
  status?: string;
  summary?: string;
  title?: string;
  subtitle?: string;
  flightNumber?: string;
  airlineName?: string;
  vesselName?: string;
  voyageNumber?: string;
  imo?: string;
  lat?: number;
  lng?: number;
  updatedAt?: string;
  provider?: string;
  links: LiveTrackingLink[];
  raw?: Record<string, unknown>;
}
